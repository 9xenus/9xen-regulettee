import React, { useState, useEffect } from 'react';
import { CheckSquare, Square, ShieldCheck } from 'lucide-react';

interface ChecklistItem {
  id: string;
  label: string;
  completed: boolean;
}

const INITIAL_TASKS: ChecklistItem[] = [
  { id: 'data-mapping', label: 'Complete Data Mapping Inventory', completed: false },
  { id: 'dpia', label: 'Conduct DPIA Assessments', completed: false },
  { id: 'privacy-policy', label: 'Update Privacy Policies', completed: false },
  { id: 'consent-mgmt', label: 'Implement Consent Management', completed: false },
  { id: 'dsr-process', label: 'Define DSR Process', completed: false },
  { id: 'staff-training', label: 'GDPR Staff Training', completed: false },
  { id: 'dpa-agreements', label: 'Finalize Data Processor Agreements', completed: false },
];

export const GdprChecklist: React.FC = () => {
  const [tasks, setTasks] = useState<ChecklistItem[]>(INITIAL_TASKS);

  useEffect(() => {
    const saved = localStorage.getItem('gdpr_checklist_status');
    if (saved) {
      setTasks(JSON.parse(saved));
    }
  }, []);

  const toggleTask = (id: string) => {
    const updatedTasks = tasks.map(task => 
      task.id === id ? { ...task, completed: !task.completed } : task
    );
    setTasks(updatedTasks);
    localStorage.setItem('gdpr_checklist_status', JSON.stringify(updatedTasks));
  };

  const completedCount = tasks.filter(t => t.completed).length;
  const progress = (completedCount / tasks.length) * 100;

  return (
    <div className="p-4 sm:p-5 lg:p-6 bg-white rounded-lg shadow-sm border border-slate-200">
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-lg font-semibold flex items-center gap-2">
          <ShieldCheck className="w-5 h-5 text-indigo-600" />
          GDPR Compliance Checklist
        </h2>
        <div className="text-sm text-slate-500 font-medium">
          {completedCount} / {tasks.length} completed
        </div>
      </div>

      <div className="w-full bg-slate-100 rounded-full h-2.5 mb-6">
        <div className="bg-indigo-600 h-2.5 rounded-full transition-all duration-300" style={{ width: `${progress}%` }}></div>
      </div>

      <div className="space-y-3">
        {tasks.map(task => (
          <div 
            key={task.id} 
            className={`flex items-center p-3 rounded-md border cursor-pointer transition-colors ${task.completed ? 'bg-indigo-50 border-indigo-100' : 'bg-white border-slate-100 hover:bg-slate-50'}`}
            onClick={() => toggleTask(task.id)}
          >
            {task.completed ? (
              <CheckSquare className="w-5 h-5 text-indigo-600 mr-3" />
            ) : (
              <Square className="w-5 h-5 text-slate-400 mr-3" />
            )}
            <span className={`text-sm ${task.completed ? 'text-indigo-900 line-through' : 'text-slate-700'}`}>
              {task.label}
            </span>
          </div>
        ))}
      </div>
    </div>
  );
};
