import React, { useState, useMemo } from 'react';
import { FileText, FileCheck, Download, Search, Settings, ShieldAlert, Plus, Eye, CheckCircle2, AlertTriangle, HelpCircle, Edit2, Trash2 } from 'lucide-react';
import { generatePdfExport } from '../../utils/pdfGenerator';
import { useNotification } from '../../context/NotificationContext';
import { DpiaQuestionnaire, DpiaAssessment } from './DpiaQuestionnaire';

export const PiaDpiaManager: React.FC = () => {
  const { showToast } = useNotification();
  const [searchTerm, setSearchTerm] = useState("");
  const [typeFilter, setTypeFilter] = useState("ALL");
  const [riskFilter, setRiskFilter] = useState("ALL");
  const [isWizardOpen, setIsWizardOpen] = useState(false);
  const [selectedAssessmentForView, setSelectedAssessmentForView] = useState<any | null>(null);

  // Edit/Add custom assessment modal state
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [editingAssessmentIndex, setEditingAssessmentIndex] = useState<number | null>(null);
  const [formName, setFormName] = useState("");
  const [formType, setFormType] = useState("DPIA");
  const [formStatus, setFormStatus] = useState("Draft");
  const [formRisk, setFormRisk] = useState("Medium");
  const [formDpo, setFormDpo] = useState("");
  const [formDesc, setFormDesc] = useState("");

  const [assessments, setAssessments] = useState<any[]>([
    { id: 'DPIA-01', name: 'Customer Database Migration', type: 'DPIA', status: 'Draft', risk: 'High', date: '2026-05-12', dpo: 'Sarah Jenkins, Esq.', desc: 'Migrating historical user databases containing detailed purchase logs and financial details to high-capacity scalable cloud instances.' },
    { id: 'PIA-01', name: 'Employee Analytics Portal', type: 'PIA', status: 'Completed', risk: 'Medium', date: '2026-04-22', dpo: 'Mark Randal', desc: 'Analyzing internal keystroke metrics and desk presence data to optimize department layouts and operational budgets.' },
    { id: 'DPIA-02', name: 'AI Resume Screener Integration', type: 'DPIA', status: 'In Review', risk: 'High', date: '2026-06-15', dpo: 'Sarah Jenkins, Esq.', desc: 'Utilizing machine-learning algorithms to scan external resumes and rank applicants dynamically.' },
    { id: 'PIA-02', name: 'New Vendor Onboarding Tool', type: 'PIA', status: 'Completed', risk: 'Low', date: '2026-03-10', dpo: 'Mark Randal', desc: 'A basic registration questionnaire and intake hub for standard operational tool sub-processors.' },
  ]);

  const filteredAssessments = useMemo(() => {
    return assessments.filter(a => {
      const matchSearch = a.name.toLowerCase().includes(searchTerm.toLowerCase()) || 
                          a.id.toLowerCase().includes(searchTerm.toLowerCase()) ||
                          (a.dpo && a.dpo.toLowerCase().includes(searchTerm.toLowerCase()));
      const matchType = typeFilter === "ALL" || a.type === typeFilter;
      const matchRisk = riskFilter === "ALL" || a.risk === riskFilter;
      return matchSearch && matchType && matchRisk;
    });
  }, [assessments, searchTerm, typeFilter, riskFilter]);

  const handleExportPdf = () => {
    const headers = ['ID', 'Name', 'Type', 'Status', 'Risk', 'DPO', 'Date'];
    const data = assessments.map(a => [a.id, a.name, a.type, a.status, a.risk, a.dpo || 'N/A', a.date]);
    generatePdfExport('DPIA/PIA Assessments Log', headers, data, 'dpias-export');
    showToast('Comprehensive DPIA/PIA registry report generated successfully.', 'info');
  };

  const handleStatusChange = (id: string, newStatus: string) => {
    setAssessments(prev => prev.map(a => a.id === id ? { ...a, status: newStatus } : a));
    showToast(`Assessment ${id} status updated to ${newStatus}.`, 'success');
  };

  const handleAddNewAssessment = (newDpia: DpiaAssessment) => {
    const formattedItem = {
      id: newDpia.id,
      name: newDpia.projectName,
      type: newDpia.id.startsWith("DPIA") ? "DPIA" : "PIA",
      status: newDpia.status,
      risk: newDpia.overallRisk,
      date: newDpia.date,
      dpo: newDpia.dpoName,
      desc: newDpia.description
    };

    setAssessments(prev => [formattedItem, ...prev]);
    setIsWizardOpen(false);
    showToast(`DPIA Assessment ${newDpia.id} successfully registered inside ledger!`, 'success');
  };

  const handleOpenAddAssessment = () => {
    setEditingAssessmentIndex(null);
    setFormName("");
    setFormType("DPIA");
    setFormStatus("Draft");
    setFormRisk("Medium");
    setFormDpo("Sarah Jenkins, Esq.");
    setFormDesc("");
    setIsEditModalOpen(true);
  };

  const handleOpenEditAssessment = (a: any, index: number) => {
    setEditingAssessmentIndex(index);
    setFormName(a.name);
    setFormType(a.type);
    setFormStatus(a.status);
    setFormRisk(a.risk);
    setFormDpo(a.dpo || "Sarah Jenkins, Esq.");
    setFormDesc(a.desc || "");
    setIsEditModalOpen(true);
  };

  const handleSaveAssessment = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formName.trim()) return;

    const record = {
      id: editingAssessmentIndex !== null ? assessments[editingAssessmentIndex].id : `${formType}-${Math.floor(Math.random() * 90) + 10}`,
      name: formName,
      type: formType,
      status: formStatus,
      risk: formRisk,
      date: editingAssessmentIndex !== null ? assessments[editingAssessmentIndex].date : new Date().toISOString().split('T')[0],
      dpo: formDpo,
      desc: formDesc
    };

    if (editingAssessmentIndex !== null) {
      setAssessments(prev => prev.map((item, idx) => idx === editingAssessmentIndex ? record : item));
      showToast("Assessment details updated successfully.", "success");
    } else {
      setAssessments(prev => [record, ...prev]);
      showToast("New assessment record registered inside security ledger.", "success");
    }

    setIsEditModalOpen(false);
    setEditingAssessmentIndex(null);
  };

  const handleDeleteAssessment = (index: number) => {
    if (!window.confirm("Are you sure you want to delete this assessment record?")) return;
    setAssessments(prev => prev.filter((_, idx) => idx !== index));
    showToast("Assessment record deleted from register.", "success");
  };

  return (
    <div className="p-4 sm:p-5 lg:p-6 space-y-4 sm:space-y-6">
      {/* Header Panel */}
      <div className="flex flex-col md:flex-row justify-between md:items-center gap-4">
        <div>
          <h3 className="text-lg font-bold text-slate-900 flex items-center gap-2">
            <FileText className="w-5 h-5 text-indigo-600" />
            PIA & DPIA Assessments Management Console
          </h3>
          <p className="text-xs text-slate-500 mt-1">
            Conduct and log Privacy Impact Assessments (PIA) and Data Protection Impact Assessments (DPIA) aligning with regulatory requirements.
          </p>
        </div>
        <div className="flex flex-wrap gap-2">
          <button 
            onClick={handleOpenAddAssessment}
            className="px-3 py-2 bg-indigo-50 border border-indigo-200 text-indigo-700 rounded-lg text-xs font-bold hover:bg-indigo-100 transition-colors flex items-center gap-1.5 cursor-pointer"
          >
            <Plus className="w-3.5 h-3.5" />
            Create Record Manual
          </button>
          <button 
            onClick={() => setIsWizardOpen(true)}
            className="px-4 py-2 bg-indigo-600 text-white rounded-lg text-sm font-bold hover:bg-indigo-700 transition-colors flex items-center gap-2 cursor-pointer shadow-sm"
          >
            <Plus className="w-4 h-4" />
            Launch Questionnaire Wizard
          </button>
          <button 
            onClick={handleExportPdf}
            className="p-2 text-slate-500 hover:bg-slate-100 rounded-lg transition-colors border border-slate-200 bg-white cursor-pointer"
            title="Export Ledger to PDF"
          >
            <Download className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
        <div className="bg-white border border-slate-200 p-4 rounded-xl shadow-sm">
          <p className="text-slate-500 font-bold text-xs uppercase tracking-wider">Total Assessments</p>
          <p className="text-2xl font-black text-slate-900 mt-1">{assessments.length}</p>
        </div>
        <div className="bg-emerald-50 border border-emerald-100 p-4 rounded-xl shadow-sm">
          <p className="text-emerald-600 font-bold text-xs uppercase tracking-wider">Completed / Approved</p>
          <p className="text-2xl font-black text-emerald-900 mt-1">{assessments.filter(a => a.status === 'Completed').length}</p>
        </div>
        <div className="bg-amber-50 border border-amber-100 p-4 rounded-xl shadow-sm">
          <p className="text-amber-600 font-bold text-xs uppercase tracking-wider">In Review</p>
          <p className="text-2xl font-black text-amber-900 mt-1">{assessments.filter(a => a.status === 'In Review').length}</p>
        </div>
        <div className="bg-rose-50 border border-rose-100 p-4 rounded-xl shadow-sm">
          <p className="text-rose-600 font-bold text-xs uppercase tracking-wider">High Risk Systems</p>
          <p className="text-2xl font-black text-rose-900 mt-1">{assessments.filter(a => a.risk === 'High').length}</p>
        </div>
      </div>

      {/* Filter and Search controls */}
      <div className="bg-slate-50 p-4 border border-slate-200 rounded-xl grid grid-cols-1 md:grid-cols-3 gap-3">
        <div className="relative">
          <span className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-slate-400">
            <Search className="w-4 h-4" />
          </span>
          <input 
            type="text" 
            placeholder="Search assessments, DPOs..." 
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-9 pr-3 py-1.5 text-xs bg-white border border-slate-200 rounded-lg focus:outline-none focus:border-indigo-500 text-slate-700"
          />
        </div>

        <div>
          <select 
            value={typeFilter}
            onChange={(e) => setTypeFilter(e.target.value)}
            className="w-full px-3 py-1.5 text-xs bg-white border border-slate-200 rounded-lg focus:outline-none text-slate-700"
          >
            <option value="ALL">All Types</option>
            <option value="DPIA">DPIA (Data Protection Impact Assessment)</option>
            <option value="PIA">PIA (Privacy Impact Assessment)</option>
          </select>
        </div>

        <div>
          <select 
            value={riskFilter}
            onChange={(e) => setRiskFilter(e.target.value)}
            className="w-full px-3 py-1.5 text-xs bg-white border border-slate-200 rounded-lg focus:outline-none text-slate-700"
          >
            <option value="ALL">All Risks</option>
            <option value="Low">Low Risk</option>
            <option value="Medium">Medium Risk</option>
            <option value="High">High Risk</option>
          </select>
        </div>
      </div>

      {/* Main Table */}
      <div className="border border-slate-200 rounded-xl overflow-x-auto bg-white shadow-xs">
        <table className="w-full text-left text-sm">
          <thead className="bg-slate-50 border-b border-slate-200 text-slate-600 font-bold text-xs uppercase tracking-wider">
            <tr>
              <th className="px-4 py-3">ID / Project Name</th>
              <th className="px-4 py-3">Type</th>
              <th className="px-4 py-3">Assigned DPO</th>
              <th className="px-4 py-3">Inherent Risk</th>
              <th className="px-4 py-3">Date conducted</th>
              <th className="px-4 py-3">Review Status</th>
              <th className="px-4 py-3 text-right">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100">
            {filteredAssessments.map(a => {
              const originalIndex = assessments.indexOf(a);
              return (
                <tr key={a.id} className="hover:bg-slate-50 transition-colors">
                  <td className="px-4 py-3">
                    <div className="flex items-start gap-2">
                      <div>
                        <button 
                          onClick={() => setSelectedAssessmentForView(a)}
                          className="font-bold text-slate-900 hover:text-indigo-600 hover:underline text-left text-sm block"
                        >
                          {a.name}
                        </button>
                        <p className="text-xs text-slate-500 font-mono mt-0.5">{a.id}</p>
                      </div>
                    </div>
                  </td>
                  <td className="px-4 py-3">
                    <span className={`text-[10px] font-bold px-2.5 py-1 rounded border ${
                      a.type === 'DPIA' ? 'bg-indigo-50 text-indigo-700 border-indigo-200 font-extrabold' : 'bg-slate-100 text-slate-700 border-slate-200 font-medium'
                    }`}>
                      {a.type}
                    </span>
                  </td>
                  <td className="px-4 py-3 text-slate-600 font-semibold text-xs">
                    {a.dpo || 'Sarah Jenkins, Esq.'}
                  </td>
                  <td className="px-4 py-3">
                    <span className={`text-[10px] font-bold px-2.5 py-1 rounded-full ${
                      a.risk === 'Low' ? 'bg-emerald-100 text-emerald-700' : 
                      a.risk === 'Medium' ? 'bg-amber-100 text-amber-700' : 
                      'bg-rose-100 text-rose-700'
                    }`}>
                      {a.risk} Risk
                    </span>
                  </td>
                  <td className="px-4 py-3 text-slate-500 font-medium text-xs">
                    {a.date}
                  </td>
                  <td className="px-4 py-3">
                    <select 
                      value={a.status}
                      onChange={(e) => handleStatusChange(a.id, e.target.value)}
                      className="text-xs border border-slate-200 rounded-lg p-1.5 bg-white font-bold text-slate-700 focus:outline-none focus:ring-1 focus:ring-indigo-500"
                    >
                      <option value="Draft">Draft</option>
                      <option value="In Review">In Review</option>
                      <option value="Action Required">Action Required</option>
                      <option value="Completed">Completed</option>
                    </select>
                  </td>
                  <td className="px-4 py-3 text-right">
                    <div className="flex items-center justify-end gap-1.5">
                      <button 
                        onClick={() => handleOpenEditAssessment(a, originalIndex)}
                        className="p-1 text-slate-400 hover:text-indigo-600 hover:bg-slate-100 rounded cursor-pointer"
                        title="Edit Record"
                      >
                        <Edit2 className="w-3.5 h-3.5" />
                      </button>
                      <button 
                        onClick={() => handleDeleteAssessment(originalIndex)}
                        className="p-1 text-slate-400 hover:text-rose-600 hover:bg-slate-100 rounded cursor-pointer"
                        title="Delete Record"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </td>
                </tr>
              );
            })}
            {filteredAssessments.length === 0 && (
              <tr>
                <td colSpan={7} className="px-4 py-5 sm:py-8 text-center text-slate-400 italic">
                  No assessments match your current search constraints.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      {/* Assessment Edit / Add Manual Modal */}
      {isEditModalOpen && (
        <div className="fixed inset-0 bg-slate-900/40 backdrop-blur-xs flex items-center justify-center p-4 z-50">
          <div className="w-full max-w-lg bg-white rounded-2xl shadow-2xl border border-slate-200 overflow-hidden">
            <div className="bg-slate-50 border-b border-slate-200 px-4 sm:px-6 py-4 flex justify-between items-center">
              <h4 className="font-extrabold text-slate-900 text-base">
                {editingAssessmentIndex !== null ? 'Modify Assessment Details' : 'Register Custom Assessment'}
              </h4>
              <button 
                onClick={() => setIsEditModalOpen(false)}
                className="text-slate-400 hover:text-slate-600 transition-colors cursor-pointer text-xl font-bold"
              >
                ×
              </button>
            </div>
            <form onSubmit={handleSaveAssessment} className="p-4 sm:p-5 lg:p-6 space-y-4 text-xs font-semibold text-slate-700">
              <div className="space-y-1">
                <label className="text-slate-600 block">Assessment Name / Title</label>
                <input
                  type="text"
                  required
                  value={formName}
                  onChange={(e) => setFormName(e.target.value)}
                  placeholder="E.g. Database Migration Audit"
                  className="w-full px-3 py-2 border border-slate-200 rounded-lg text-xs focus:outline-none bg-slate-50 font-normal"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-1">
                  <label className="text-slate-600 block">Type</label>
                  <select
                    value={formType}
                    onChange={(e) => setFormType(e.target.value)}
                    className="w-full px-3 py-2 border border-slate-200 rounded-lg text-xs bg-white focus:outline-none"
                  >
                    <option value="DPIA">DPIA</option>
                    <option value="PIA">PIA</option>
                  </select>
                </div>
                <div className="space-y-1">
                  <label className="text-slate-600 block">Inherent Risk Level</label>
                  <select
                    value={formRisk}
                    onChange={(e) => setFormRisk(e.target.value)}
                    className="w-full px-3 py-2 border border-slate-200 rounded-lg text-xs bg-white focus:outline-none"
                  >
                    <option value="Low">Low Risk</option>
                    <option value="Medium">Medium Risk</option>
                    <option value="High">High Risk</option>
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-1">
                  <label className="text-slate-600 block">Review Status</label>
                  <select
                    value={formStatus}
                    onChange={(e) => setFormStatus(e.target.value)}
                    className="w-full px-3 py-2 border border-slate-200 rounded-lg text-xs bg-white focus:outline-none"
                  >
                    <option value="Draft">Draft</option>
                    <option value="In Review">In Review</option>
                    <option value="Action Required">Action Required</option>
                    <option value="Completed">Completed</option>
                  </select>
                </div>
                <div className="space-y-1">
                  <label className="text-slate-600 block">Assigned DPO / Lead Officer</label>
                  <input
                    type="text"
                    required
                    value={formDpo}
                    onChange={(e) => setFormDpo(e.target.value)}
                    className="w-full px-3 py-2 border border-slate-200 rounded-lg text-xs focus:outline-none bg-slate-50 font-normal"
                  />
                </div>
              </div>

              <div className="space-y-1">
                <label className="text-slate-600 block">Description & Scope of Operations</label>
                <textarea
                  required
                  rows={3}
                  value={formDesc}
                  onChange={(e) => setFormDesc(e.target.value)}
                  placeholder="Summarize personal data categories, workflows, and cloud storage targets..."
                  className="w-full px-3 py-2 border border-slate-200 rounded-lg text-xs focus:outline-none bg-slate-50 resize-none font-sans font-normal"
                />
              </div>

              <div className="flex justify-end gap-2 pt-3 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setIsEditModalOpen(false)}
                  className="px-4 py-2 border border-slate-200 rounded-lg text-slate-700 hover:bg-slate-50 font-bold transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-indigo-600 text-white font-bold rounded-lg hover:bg-indigo-700 transition-colors cursor-pointer"
                >
                  Save Assessment
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Assessment Interactive Questionnaire Wizard Modal */}
      {isWizardOpen && (
        <div className="fixed inset-0 bg-slate-900/40 backdrop-blur-xs flex items-center justify-center p-4 z-50">
          <div className="w-full max-w-4xl bg-white rounded-2xl shadow-2xl overflow-hidden">
            <DpiaQuestionnaire 
              onAddAssessment={handleAddNewAssessment} 
              onClose={() => setIsWizardOpen(false)} 
            />
          </div>
        </div>
      )}

      {/* Simple View Details Modal */}
      {selectedAssessmentForView && (
        <div className="fixed inset-0 bg-slate-900/40 backdrop-blur-xs flex items-center justify-center p-4 z-50">
          <div className="w-full max-w-2xl bg-white rounded-2xl shadow-2xl overflow-hidden border border-slate-200">
            <div className="bg-slate-50 border-b border-slate-200 px-4 sm:px-6 py-4 flex justify-between items-center">
              <div className="flex items-center gap-2">
                <span className="font-mono text-xs font-bold text-slate-400 bg-slate-200/60 px-2 py-0.5 rounded">{selectedAssessmentForView.id}</span>
                <h4 className="font-extrabold text-slate-900 text-base">{selectedAssessmentForView.name}</h4>
              </div>
              <button 
                onClick={() => setSelectedAssessmentForView(null)}
                className="p-1 hover:bg-slate-200 rounded-lg text-slate-400 hover:text-slate-600 transition-colors cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
            <div className="p-4 sm:p-5 lg:p-6 space-y-4">
              <div className="grid grid-cols-2 gap-4 text-xs">
                <div>
                  <span className="text-slate-400 block mb-0.5">Assigned DPO</span>
                  <span className="font-bold text-slate-800">{selectedAssessmentForView.dpo}</span>
                </div>
                <div>
                  <span className="text-slate-400 block mb-0.5">Date Assessed</span>
                  <span className="font-bold text-slate-800">{selectedAssessmentForView.date}</span>
                </div>
                <div>
                  <span className="text-slate-400 block mb-0.5">Inherent Risk Level</span>
                  <span className={`font-bold uppercase ${
                    selectedAssessmentForView.risk === 'Low' ? 'text-emerald-600' :
                    selectedAssessmentForView.risk === 'Medium' ? 'text-amber-600' : 'text-rose-600'
                  }`}>{selectedAssessmentForView.risk} Risk</span>
                </div>
                <div>
                  <span className="text-slate-400 block mb-0.5">Audit Status</span>
                  <span className="font-bold text-indigo-600">{selectedAssessmentForView.status}</span>
                </div>
              </div>

              <div className="space-y-1 bg-slate-50 border border-slate-200/80 p-3.5 rounded-xl">
                <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 block">Processing Operations Description</span>
                <p className="text-xs text-slate-700 leading-relaxed font-semibold">
                  {selectedAssessmentForView.desc}
                </p>
              </div>

              <div className="bg-amber-50 border border-amber-200/60 p-3.5 rounded-xl flex items-start gap-2.5">
                <ShieldAlert className="w-4 h-4 text-amber-500 shrink-0 mt-0.5" />
                <div className="text-[11px] text-amber-800 space-y-1">
                  <p className="font-bold uppercase">Regulatory Pre-Audit Disclaimer</p>
                  <p className="leading-relaxed">
                    This is an active record in your compliance directory. Ensure all operational and data engineering flows match the declared mitigations prior to audit inspections.
                  </p>
                </div>
              </div>
            </div>
            <div className="bg-slate-50 border-t border-slate-200 px-4 sm:px-6 py-3 flex justify-end gap-2">
              <button 
                onClick={() => setSelectedAssessmentForView(null)}
                className="px-4 py-1.5 bg-slate-900 hover:bg-slate-800 text-white font-bold text-xs rounded-lg transition-colors cursor-pointer"
              >
                Close View
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

// Simple X icon for modal close
const X = ({ className }: { className?: string }) => (
  <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" className={className}>
    <line x1="18" y1="6" x2="6" y2="18"></line>
    <line x1="6" y1="6" x2="18" y2="18"></line>
  </svg>
);
