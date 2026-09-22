import React, { useState } from 'react';
import { CheckCircle2, Clock, AlertTriangle, Calendar, Filter, ChevronDown, CheckSquare, Repeat, Plus, Trash2, ShieldCheck, UserPlus, FileEdit } from 'lucide-react';
import { useNotification } from '../context/NotificationContext';
import { MultiSelectActionBar } from '../components/MultiSelectActionBar';
import { BullMQWorkerMonitoring } from '../components/admin/BullMQWorkerMonitoring';

const TEAM_MEMBERS = ['Alice Smith', 'Bob Jones', 'Charlie Miller', 'System Generated', 'Sarah Jenkins'];

export const Tasks: React.FC = () => {
  const { showToast } = useNotification();
  const [tasks, setTasks] = useState([
    { id: 't1', title: 'Complete DPIA for new HR System', act: 'GDPR', due: '2026-06-20', priority: 'High', status: 'Pending', assignee: 'Alice Smith' },
    { id: 't2', title: 'Review NIS2 Incident Response Plan', act: 'NIS2', due: '2026-06-25', priority: 'High', status: 'In Progress', assignee: 'Bob Jones' },
    { id: 't3', title: 'Update Data Processing Agreement templates', act: 'GDPR', due: '2026-07-01', priority: 'Medium', status: 'Pending', assignee: 'Alice Smith' },
    { id: 't4', title: 'Conduct AI Act risk categorization', act: 'EU AI Act', due: '2026-07-15', priority: 'Medium', status: 'Pending', assignee: 'System Generated' },
    { id: 't5', title: 'Annual DORA penetration test review', act: 'DORA', due: '2026-06-15', priority: 'Critical', status: 'Overdue', assignee: 'Bob Jones' },
    { id: 't6', title: 'Sign renewed SCCs with US vendor', act: 'GDPR', due: '2026-06-10', priority: 'High', status: 'Completed', assignee: 'Alice Smith' }
  ]);

  const [selectedTaskIds, setSelectedTaskIds] = useState<string[]>([]);

  const [recurringScans, setRecurringScans] = useState([
    { id: 'rs1', title: 'GDPR Data Mapping Audit', frequency: 'Quarterly', nextRun: '2026-09-01', active: true },
    { id: 'rs2', title: 'DORA Resilience Scan', frequency: 'Monthly', nextRun: '2026-07-01', active: true }
  ]);

  const [isAddingScheduler, setIsAddingScheduler] = useState(false);
  const [newScanTitle, setNewScanTitle] = useState('NIS2 Vendor Risk Assessment');
  const [newScanFrequency, setNewScanFrequency] = useState('Quarterly');

  const toggleTaskStatus = (id: string) => {
    setTasks(tasks.map(t => t.id === id ? { ...t, status: t.status === 'Completed' ? 'Pending' : 'Completed' } : t));
  };

  const handleToggleSelect = (id: string) => {
    setSelectedTaskIds(prev =>
      prev.includes(id) ? prev.filter(tId => tId !== id) : [...prev, id]
    );
  };

  const handleSelectAllToggle = () => {
    if (selectedTaskIds.length === tasks.length) {
      setSelectedTaskIds([]);
    } else {
      setSelectedTaskIds(tasks.map(t => t.id));
    }
  };

  const handleBatchDelete = () => {
    setTasks(prev => prev.filter(t => !selectedTaskIds.includes(t.id)));
    showToast(`Successfully deleted ${selectedTaskIds.length} tasks.`, 'success');
    setSelectedTaskIds([]);
  };

  const handleBatchUpdateStatus = (status: string) => {
    setTasks(prev => prev.map(t => selectedTaskIds.includes(t.id) ? { ...t, status } : t));
    showToast(`Successfully updated status to "${status}" for ${selectedTaskIds.length} tasks.`, 'success');
    setSelectedTaskIds([]);
  };

  const handleBatchAssign = (assignee: string) => {
    setTasks(prev => prev.map(t => selectedTaskIds.includes(t.id) ? { ...t, assignee } : t));
    showToast(`Successfully assigned ${selectedTaskIds.length} tasks to ${assignee}.`, 'success');
    setSelectedTaskIds([]);
  };

  const handleClearSelection = () => {
    setSelectedTaskIds([]);
  };

  const toggleRecurringActive = (id: string) => {
    setRecurringScans(recurringScans.map(scan => scan.id === id ? { ...scan, active: !scan.active } : scan));
  };

  const deleteRecurringScan = (id: string) => {
    setRecurringScans(recurringScans.filter(scan => scan.id !== id));
  };

  const addRecurringScan = () => {
    if (!newScanTitle) return;
    
    // Simple date calculation for next run based on frequency
    const date = new Date();
    if (newScanFrequency === 'Monthly') date.setMonth(date.getMonth() + 1);
    if (newScanFrequency === 'Quarterly') date.setMonth(date.getMonth() + 3);
    if (newScanFrequency === 'Annually') date.setFullYear(date.getFullYear() + 1);

    setRecurringScans([
      ...recurringScans,
      {
        id: `rs-${Date.now()}`,
        title: newScanTitle,
        frequency: newScanFrequency,
        nextRun: date.toISOString().split('T')[0],
        active: true
      }
    ]);
    setIsAddingScheduler(false);
  };

  return (
    <div className="space-y-4 sm:space-y-6">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center border-b border-slate-200 pb-5">
        <div>
          <h1 className="text-3xl font-extrabold text-slate-900 tracking-tight">Compliance Tasks</h1>
          <p className="text-slate-500 mt-1">Manage scheduled reviews, remediation items, and policy updates.</p>
        </div>
        <div className="flex space-x-3 mt-4 md:mt-0">
           <button className="px-4 py-2 bg-white border border-slate-200 text-slate-700 font-semibold rounded-lg hover:bg-slate-50 transition-colors flex items-center">
            <Filter className="w-4 h-4 mr-2" />
            Filter
          </button>
          <button className="px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white font-semibold rounded-lg shadow-sm transition-colors flex items-center">
             <CheckSquare className="w-4 h-4 mr-2" />
             New Task
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        {['All Tasks', 'Pending', 'In Progress', 'Completed'].map((status) => (
           <div key={status} className="bg-white p-4 rounded-xl border border-slate-200 shadow-sm flex flex-col items-center justify-center cursor-pointer hover:border-emerald-300 transition-colors">
              <span className="text-2xl font-bold text-slate-800">
                {status === 'All Tasks' ? tasks.length : tasks.filter(t => t.status === status).length}
              </span>
              <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider mt-1">{status}</span>
           </div>
        ))}
      </div>

      <div className="grid lg:grid-cols-3 gap-4 sm:gap-6">
        <div className="lg:col-span-2 space-y-4 sm:space-y-6">
          <div className="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden">
             <div className="p-4 border-b border-slate-200 bg-slate-50 flex flex-col md:flex-row md:items-center justify-between gap-3">
                 <div className="flex items-center gap-3">
                     <input
                       type="checkbox"
                       checked={tasks.length > 0 && selectedTaskIds.length === tasks.length}
                       onChange={handleSelectAllToggle}
                       className="h-4 w-4 text-indigo-600 border-slate-300 rounded focus:ring-indigo-500 cursor-pointer transition-colors"
                     />
                     <h2 className="text-lg font-bold text-slate-800">Action Items</h2>
                 </div>
                 {selectedTaskIds.length === 0 && (
                   <p className="text-xs text-slate-500 font-semibold bg-slate-100/80 px-2 py-0.5 rounded border border-slate-200/50">Select items to batch action</p>
                 )}
             </div>
             
             <MultiSelectActionBar
                selectedCount={selectedTaskIds.length}
                onDelete={handleBatchDelete}
                onStatusUpdate={handleBatchUpdateStatus}
                onClear={handleClearSelection}
                statusOptions={[
                  { value: 'Pending', label: 'Pending' },
                  { value: 'In Progress', label: 'In Progress' },
                  { value: 'Completed', label: 'Completed' },
                  { value: 'Overdue', label: 'Overdue' }
                ]}
                additionalActions={
                  <div className="flex items-center gap-2">
                    <UserPlus className="w-4 h-4 text-slate-400" />
                    <select
                      onChange={(e) => {
                        handleBatchAssign(e.target.value);
                        e.target.value = "";
                      }}
                      defaultValue=""
                      className="text-xs font-semibold bg-slate-50 border border-slate-200 rounded-md py-1 px-2 focus:outline-none focus:ring-1 focus:ring-indigo-500"
                    >
                      <option value="" disabled>Assign To...</option>
                      {TEAM_MEMBERS.map(member => (
                        <option key={member} value={member}>{member}</option>
                      ))}
                    </select>
                  </div>
                }
              />
             <div className="divide-y divide-slate-100">
                {tasks.map((task) => (
                  <div key={task.id} className={`p-4 sm:p-5 flex flex-col sm:flex-row gap-4 items-start sm:items-center hover:bg-slate-50/50 transition-colors ${task.status === 'Completed' ? 'opacity-65 grayscale-[30%]' : ''}`}>
                    <div className="flex items-center gap-3 shrink-0">
                      <input
                        type="checkbox"
                        checked={selectedTaskIds.includes(task.id)}
                        onChange={() => handleToggleSelect(task.id)}
                        className="h-4 w-4 text-indigo-600 border-slate-300 rounded focus:ring-indigo-500 cursor-pointer transition-all"
                      />
                      <button onClick={() => toggleTaskStatus(task.id)} className="mt-0.5 shrink-0" title="Toggle quick status complete">
                        <CheckCircle2 className={`w-5 h-5 ${task.status === 'Completed' ? 'text-emerald-500' : 'text-slate-300 hover:text-emerald-400'}`} />
                      </button>
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex flex-col sm:flex-row sm:items-center gap-2 sm:gap-3 mb-1">
                        <h3 className={`font-bold text-slate-800 truncate ${task.status === 'Completed' ? 'line-through text-slate-500' : ''}`}>{task.title}</h3>
                        <span className="inline-flex px-2 py-0.5 rounded text-[10px] uppercase font-bold tracking-wider bg-indigo-50 text-indigo-700 w-max border border-indigo-100">
                          {task.act}
                        </span>
                      </div>
                      <div className="flex flex-wrap items-center gap-3 text-xs text-slate-500 mt-2">
                        <div className="flex items-center">
                          <Calendar className="w-3.5 h-3.5 mr-1" />
                          {task.due}
                        </div>
                        <div className="flex items-center">
                          <AlertTriangle className={`w-3.5 h-3.5 mr-1 ${task.priority === 'Critical' ? 'text-rose-500' : task.priority === 'High' ? 'text-amber-500' : ''}`} />
                          {task.priority} Priority
                        </div>
                        <div className="flex items-center font-medium text-slate-600 bg-slate-100 px-2 py-0.5 rounded-md border border-slate-200/50">
                          Assignee: <span className="font-bold text-slate-800 ml-1">{task.assignee}</span>
                        </div>
                      </div>
                    </div>
                    <div className="shrink-0 flex items-center space-x-3 w-full sm:w-auto">
                       <span className={`px-2.5 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider w-fit ${
                         task.status === 'Completed' ? 'bg-emerald-100 text-emerald-800 border border-emerald-200' : 
                         task.status === 'In Progress' ? 'bg-blue-100 text-blue-800 border border-blue-200' : 
                         task.status === 'Overdue' ? 'bg-rose-100 text-rose-800 border border-rose-200' :
                         'bg-slate-100 text-slate-700 border border-slate-200'
                       }`}>
                         {task.status}
                       </span>
                       <button className="p-1 text-slate-400 hover:text-slate-600 rounded">
                         <ChevronDown className="w-5 h-5" />
                       </button>
                    </div>
                  </div>
                ))}
              </div>
          </div>
        </div>

        <div className="lg:col-span-1 space-y-4 sm:space-y-6">
          <div className="bg-indigo-50 rounded-xl border border-indigo-100 overflow-hidden shadow-sm">
            <div className="p-4 border-b border-indigo-100 bg-indigo-100/50 flex justify-between items-center">
              <div className="flex items-center space-x-2">
                <Repeat className="w-5 h-5 text-indigo-700" />
                <h2 className="text-sm font-bold text-indigo-900 uppercase tracking-wide">Automated Scans</h2>
              </div>
              <button 
                onClick={() => setIsAddingScheduler(true)}
                className="p-1 hover:bg-indigo-200 text-indigo-700 rounded-md transition-colors"
                title="Schedule Verification"
              >
                <Plus className="w-4 h-4" />
              </button>
            </div>
            
            {isAddingScheduler && (
              <div className="p-4 border-b border-indigo-100 bg-white space-y-3">
                <div className="space-y-1">
                  <label className="text-xs font-bold tracking-wide text-slate-600 uppercase">Target Audit</label>
                  <input 
                    type="text" 
                    className="w-full text-sm border-slate-200 rounded-md focus:ring-indigo-500 focus:border-indigo-500 bg-slate-50"
                    value={newScanTitle}
                    onChange={e => setNewScanTitle(e.target.value)}
                  />
                </div>
                <div className="space-y-1">
                  <label className="text-xs font-bold tracking-wide text-slate-600 uppercase">Frequency</label>
                  <select 
                    className="w-full text-sm border-slate-200 rounded-md focus:ring-indigo-500 focus:border-indigo-500 bg-slate-50"
                    value={newScanFrequency}
                    onChange={e => setNewScanFrequency(e.target.value)}
                  >
                    <option value="Monthly">Monthly</option>
                    <option value="Quarterly">Quarterly</option>
                    <option value="Annually">Annually</option>
                  </select>
                </div>
                <div className="flex space-x-2 pt-2">
                  <button 
                    onClick={addRecurringScan}
                    className="flex-1 bg-indigo-600 text-white text-xs font-bold uppercase tracking-wider py-2 rounded-md hover:bg-indigo-700 transition"
                  >
                    Schedule
                  </button>
                  <button 
                    onClick={() => setIsAddingScheduler(false)}
                    className="flex-1 bg-slate-200 text-slate-700 text-xs font-bold uppercase tracking-wider py-2 rounded-md hover:bg-slate-300 transition"
                  >
                    Cancel
                  </button>
                </div>
              </div>
            )}

            <div className="p-4 flex flex-col space-y-3">
              {recurringScans.map(scan => (
                <div key={scan.id} className="bg-white border text-sm border-indigo-100 rounded-lg p-3 relative group">
                   <div className="flex justify-between items-start mb-2">
                     <p className={`font-semibold ${scan.active ? 'text-indigo-900' : 'text-slate-500 line-through'}`}>{scan.title}</p>
                     <div className="flex items-center space-x-2">
                        <button 
                          onClick={() => toggleRecurringActive(scan.id)}
                          className={`relative inline-flex h-4 w-7 items-center rounded-full transition-colors focus:outline-none ${scan.active ? 'bg-indigo-500' : 'bg-slate-300'}`}
                        >
                          <span className={`inline-block h-3 w-3 transform rounded-full bg-white transition-transform ${scan.active ? 'translate-x-3.5' : 'translate-x-0.5'}`} />
                        </button>
                     </div>
                   </div>
                   <div className="flex flex-col space-y-1 text-xs text-slate-500">
                     <div className="flex items-center">
                       <Repeat className="w-3.5 h-3.5 mr-1.5 opacity-70" />
                       {scan.frequency} Schedule
                     </div>
                     <div className="flex items-center">
                       <Calendar className="w-3.5 h-3.5 mr-1.5 opacity-70" />
                       Next run: <span className="font-medium ml-1 text-slate-700">{scan.nextRun}</span>
                     </div>
                   </div>
                   
                   <button 
                     onClick={() => deleteRecurringScan(scan.id)}
                     className="absolute top-2 right-2 opacity-0 group-hover:opacity-100 p-1 bg-white hover:bg-rose-50 text-rose-500 rounded transition"
                     title="Remove Scan"
                   >
                     <Trash2 className="w-3.5 h-3.5" />
                   </button>
                </div>
              ))}
              
              {recurringScans.length === 0 && (
                <div className="text-center py-4 sm:py-6 text-indigo-400">
                  <ShieldCheck className="w-8 h-8 mx-auto mb-2 opacity-50" />
                  <p className="text-xs font-medium">No automated scans scheduled.</p>
                </div>
              )}
            </div>
            <div className="bg-indigo-100 p-3 text-[10px] text-indigo-800 leading-relaxed border-t border-indigo-200">
              <strong>Note:</strong> Automated scans create standard tasks assigned to "System Generated" based on your defined cron schedule. Webhooks will trigger external tools.
            </div>
          </div>
        </div>
      </div>

      {/* BullMQ Worker & Distributed Task Queue Monitor */}
      <div className="mt-10">
        <BullMQWorkerMonitoring />
      </div>
    </div>
  );
};
