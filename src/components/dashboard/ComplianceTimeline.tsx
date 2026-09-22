import React, { useState } from 'react';
import { motion } from 'motion/react';
import { Calendar, AlertTriangle, CheckCircle2, Clock, Filter } from 'lucide-react';

interface Milestone {
  date: string;
  title: string;
  description: string;
  status: 'upcoming' | 'passed';
  framework: 'AI Act' | 'NIS2' | 'GDPR';
}

const milestones: Milestone[] = [
  { date: '2026-09-01', title: 'NIS2 Directive Enforcement', description: 'Mandatory implementation for critical infrastructure providers.', status: 'upcoming', framework: 'NIS2' },
  { date: '2026-11-15', title: 'AI Act Governance Review', description: 'First audit cycle for high-risk AI models.', status: 'upcoming', framework: 'AI Act' },
  { date: '2026-12-31', title: 'Data Sovereignty Deadline', description: 'Completion of regional database migration requirements.', status: 'upcoming', framework: 'GDPR' },
  { date: '2026-05-15', title: 'GDPR Updated Framework', description: 'Alignment with new cross-border data transfer protocols.', status: 'passed', framework: 'GDPR' },
];

export const ComplianceTimeline: React.FC = () => {
  const [filter, setFilter] = useState<'All' | 'AI Act' | 'NIS2' | 'GDPR'>('All');

  const filteredMilestones = filter === 'All' 
    ? milestones 
    : milestones.filter(m => m.framework === filter);

  return (
    <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-4 sm:p-5 lg:p-6">
      <div className="flex justify-between items-center mb-6 border-b border-slate-100 pb-3">
        <h2 className="text-lg font-bold text-slate-800 flex items-center">
           <Calendar className="w-5 h-5 mr-2 text-indigo-500" /> Compliance Timeline
        </h2>
        <select 
          value={filter}
          onChange={(e) => setFilter(e.target.value as any)}
          className="text-xs border border-slate-200 rounded-lg p-1.5 focus:outline-none focus:ring-2 focus:ring-indigo-500"
        >
          <option value="All">All Frameworks</option>
          <option value="AI Act">AI Act</option>
          <option value="NIS2">NIS2</option>
          <option value="GDPR">GDPR</option>
        </select>
      </div>
      <div className="space-y-4 sm:space-y-6">
        {filteredMilestones.map((milestone, i) => (
          <div key={i} className="flex gap-4">
            <div className="flex flex-col items-center">
              <div className={`w-3 h-3 rounded-full mt-1.5 ${milestone.status === 'passed' ? 'bg-emerald-500' : 'bg-indigo-500'}`} />
              {i !== filteredMilestones.length - 1 && <div className="w-0.5 h-full bg-slate-200 mt-1" />}
            </div>
            <div className="pb-4">
              <div className="flex items-center gap-2">
                <div className="text-xs font-mono font-bold text-slate-500">{milestone.date}</div>
                <span className="text-[10px] bg-indigo-50 text-indigo-700 px-1.5 py-0.5 rounded font-bold">{milestone.framework}</span>
              </div>
              <div className="font-bold text-slate-900">{milestone.title}</div>
              <p className="text-sm text-slate-600 mt-1">{milestone.description}</p>
              {milestone.status === 'passed' && (
                <div className="flex items-center text-emerald-600 text-[10px] font-black uppercase tracking-wider mt-2">
                  <CheckCircle2 className="w-3 h-3 mr-1" /> Completed
                </div>
              )}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};
