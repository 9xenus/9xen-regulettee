import React, { useState } from 'react';
import { 
  Workflow, 
  Plus, 
  Trash2, 
  ChevronRight, 
  User, 
  ShieldCheck, 
  FileText, 
  Zap, 
  Clock, 
  AlertCircle,
  MoreVertical,
  Play,
  Save,
  Layers,
  Search,
  CheckCircle2,
  GitBranch
} from 'lucide-react';
import { cn } from '../../lib/utils';

interface WorkflowStep {
  id: string;
  type: 'approval' | 'notification' | 'action';
  label: string;
  assignee: string;
  status: 'pending' | 'completed' | 'active';
}

export const WorkflowBuilder: React.FC = () => {
  const [activeWorkflow, setActiveWorkflow] = useState('policy-change');

  const workflows = [
    { id: 'policy-change', name: 'Global Policy Change', icon: ShieldCheck, status: 'Active' },
    { id: 'new-entity', name: 'New Entity Onboarding', icon: Layers, status: 'Draft' },
    { id: 'data-request', name: 'DSAR / Data Request', icon: FileText, status: 'Active' },
  ];

  return (
    <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
      {/* Sidebar: Workflow List */}
      <div className="space-y-6">
        <div className="bg-white rounded-xl border border-gray-200 p-6 shadow-sm">
          <div className="flex items-center justify-between mb-6">
            <h3 className="font-bold text-gray-900">Workflows</h3>
            <button className="p-1.5 bg-blue-50 text-blue-600 rounded-lg hover:bg-blue-100">
              <Plus className="w-4 h-4" />
            </button>
          </div>
          <div className="space-y-2">
            {workflows.map((wf) => (
              <button
                key={wf.id}
                onClick={() => setActiveWorkflow(wf.id)}
                className={cn(
                  "w-full flex items-center justify-between p-3 rounded-lg transition-all",
                  activeWorkflow === wf.id 
                    ? "bg-gray-900 text-white shadow-lg" 
                    : "text-gray-500 hover:bg-gray-100"
                )}
              >
                <div className="flex items-center">
                  <wf.icon className="w-4 h-4 mr-3" />
                  <span className="text-sm font-bold truncate">{wf.name}</span>
                </div>
                {activeWorkflow !== wf.id && (
                  <span className={cn(
                    "text-[10px] px-1.5 py-0.5 rounded font-black uppercase tracking-widest",
                    wf.status === 'Active' ? "bg-emerald-100 text-emerald-700" : "bg-amber-100 text-amber-700"
                  )}>
                    {wf.status}
                  </span>
                )}
              </button>
            ))}
          </div>
        </div>

        <div className="bg-blue-600 rounded-xl p-6 text-white shadow-xl">
          <h4 className="font-bold mb-2">Pro Tip: Branching</h4>
          <p className="text-xs text-blue-100 leading-relaxed">
            Use the <GitBranch className="inline w-3 h-3 mx-1" /> Branch tool to add conditional logic based on risk scores or jurisdictional flags.
          </p>
        </div>
      </div>

      {/* Main Builder Canvas */}
      <div className="lg:col-span-3 space-y-6">
        <div className="bg-white rounded-xl border border-gray-200 shadow-sm min-h-[600px] flex flex-col relative overflow-hidden">
          {/* Grid Background */}
          <div className="absolute inset-0 opacity-[0.03]" style={{ 
            backgroundImage: `radial-gradient(#000 1px, transparent 1px)`,
            backgroundSize: '24px 24px'
          }} />

          {/* Builder Header */}
          <div className="relative z-10 px-8 py-6 border-b border-gray-200 bg-white flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <div className="p-2.5 bg-gray-100 rounded-lg">
                <Workflow className="w-6 h-6 text-gray-900" />
              </div>
              <div>
                <h2 className="text-xl font-bold text-gray-900 tracking-tight">Global Policy Change Workflow</h2>
                <p className="text-xs text-gray-500 font-medium">Triggered when any control in the "Sovereign" category is modified.</p>
              </div>
            </div>
            <div className="flex items-center space-x-3">
              <button className="px-4 py-2 border border-gray-300 rounded-lg text-sm font-bold text-gray-600 hover:bg-gray-50 flex items-center transition-all">
                <Save className="w-4 h-4 mr-2" />
                Save Draft
              </button>
              <button className="px-6 py-2 bg-blue-600 text-white rounded-lg text-sm font-bold hover:bg-blue-700 shadow-md transition-all flex items-center">
                <Play className="w-4 h-4 mr-2" />
                Deploy Workflow
              </button>
            </div>
          </div>

          {/* Builder Body */}
          <div className="relative z-10 flex-1 p-12 overflow-y-auto">
            <div className="flex flex-col items-center space-y-12">
              {/* Trigger */}
              <div className="group flex flex-col items-center">
                <div className="px-6 py-3 bg-amber-50 border-2 border-amber-200 rounded-full text-amber-700 text-sm font-black uppercase tracking-[0.15em] shadow-sm">
                  Trigger: Settings Change
                </div>
                <div className="w-0.5 h-12 bg-gray-200" />
              </div>

              {/* Steps */}
              {[
                { id: '1', type: 'approval', label: 'Compliance Review', assignee: 'Head of Compliance', status: 'completed' },
                { id: '2', type: 'approval', label: 'Legal Counsel Sign-off', assignee: 'Senior Legal Lead', status: 'active' },
                { id: '3', type: 'notification', label: 'Security Lead Alert', assignee: 'CISO Office', status: 'pending' },
                { id: '4', type: 'action', label: 'Auto-Sync Staging', assignee: 'System Engine', status: 'pending' },
              ].map((step, idx, arr) => (
                <React.Fragment key={step.id}>
                  <div className="group relative w-full max-w-sm">
                    <div className={cn(
                      "flex items-center justify-between p-6 rounded-2xl border-2 transition-all relative z-10",
                      step.status === 'completed' ? "bg-emerald-50 border-emerald-200" :
                      step.status === 'active' ? "bg-white border-blue-400 shadow-xl scale-105" :
                      "bg-white border-gray-200 border-dashed"
                    )}>
                      <div className="flex items-center space-x-4">
                        <div className={cn(
                          "p-3 rounded-xl",
                          step.status === 'completed' ? "bg-emerald-100 text-emerald-600" :
                          step.status === 'active' ? "bg-blue-100 text-blue-600" :
                          "bg-gray-100 text-gray-400"
                        )}>
                          {step.type === 'approval' ? <CheckCircle2 className="w-6 h-6" /> : 
                           step.type === 'notification' ? <Zap className="w-6 h-6" /> : 
                           <Workflow className="w-6 h-6" />}
                        </div>
                        <div>
                          <h4 className="font-bold text-gray-900">{step.label}</h4>
                          <div className="flex items-center mt-0.5 text-xs text-gray-500 font-medium">
                            <User className="w-3 h-3 mr-1" /> {step.assignee}
                          </div>
                        </div>
                      </div>
                      <button className="p-2 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-all opacity-0 group-hover:opacity-100">
                        <Trash2 className="w-5 h-5" />
                      </button>

                      {step.status === 'active' && (
                        <div className="absolute -right-3 -top-3">
                          <div className="relative">
                            <div className="absolute inset-0 bg-blue-400 blur-md rounded-full animate-pulse" />
                            <div className="relative bg-blue-600 text-white p-1 rounded-full shadow-lg">
                              <Zap className="w-4 h-4 fill-white" />
                            </div>
                          </div>
                        </div>
                      )}
                    </div>

                    {/* Step Link */}
                    {idx < arr.length - 1 && (
                      <div className="flex flex-col items-center">
                        <div className="w-0.5 h-12 bg-gray-200" />
                        <button className="absolute bottom-[-24px] left-1/2 -translate-x-1/2 z-20 p-2 bg-white border border-gray-200 rounded-full text-gray-400 hover:text-blue-600 hover:border-blue-300 transition-all shadow-sm">
                          <Plus className="w-4 h-4" />
                        </button>
                      </div>
                    )}
                  </div>
                </React.Fragment>
              ))}

              {/* End */}
              <div className="flex flex-col items-center mt-4">
                <div className="w-0.5 h-12 bg-gray-200" />
                <div className="px-8 py-3 bg-gray-900 border-2 border-gray-800 rounded-full text-white text-sm font-black uppercase tracking-[0.2em] shadow-lg">
                  Deployed
                </div>
              </div>
            </div>
          </div>

          {/* Builder Tools Palette */}
          <div className="absolute left-8 bottom-8 flex items-center space-x-3 z-20">
            <div className="bg-white rounded-xl border border-gray-200 shadow-2xl p-2 flex items-center space-x-2">
              <button className="p-3 text-gray-600 hover:bg-blue-50 hover:text-blue-600 rounded-lg transition-all" title="Add Approval Step">
                <ShieldCheck className="w-5 h-5" />
              </button>
              <button className="p-3 text-gray-600 hover:bg-amber-50 hover:text-amber-600 rounded-lg transition-all" title="Add Notification">
                <Zap className="w-5 h-5" />
              </button>
              <button className="p-3 text-gray-600 hover:bg-emerald-50 hover:text-emerald-600 rounded-lg transition-all" title="Add Integration Action">
                <Workflow className="w-5 h-5" />
              </button>
              <div className="w-px h-8 bg-gray-100 mx-2" />
              <button className="p-3 text-gray-600 hover:bg-purple-50 hover:text-purple-600 rounded-lg transition-all" title="Add Branch Logic">
                <GitBranch className="w-5 h-5" />
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
