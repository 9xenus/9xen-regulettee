import React, { useState } from 'react';
import { AlertTriangle, Send, ShieldAlert, Lock, UserX, MessageSquare, Download, X, Edit2, Trash2 } from 'lucide-react';
import { generatePdfExport } from '../../utils/pdfGenerator';
import { useNotification } from '../../context/NotificationContext';

export const WhistleblowerPortal: React.FC<{ cases: any[], onSelectCase: (c: any) => void }> = ({ cases: initialCases, onSelectCase }) => {
  const { showToast } = useNotification();
  const [activeFilter, setActiveFilter] = useState('All');
  const [localCases, setLocalCases] = useState(initialCases);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingCase, setEditingCase] = useState<any>(null);
  const [formData, setFormData] = useState({
    category: "Financial Bribery",
    severity: "High",
    status: "New",
    desc: ""
  });

  const filteredCases = activeFilter === 'All' 
    ? localCases 
    : localCases.filter(c => c.status === activeFilter);

  const handleOpenNew = () => {
    setEditingCase(null);
    setFormData({
      category: "Financial Bribery",
      severity: "High",
      status: "New",
      desc: ""
    });
    setIsModalOpen(true);
  };

  const handleEdit = (e: React.MouseEvent, c: any) => {
    e.stopPropagation();
    setEditingCase(c);
    setFormData({
      category: c.category,
      severity: c.severity,
      status: c.status,
      desc: c.desc
    });
    setIsModalOpen(true);
  };

  const handleDelete = (e: React.MouseEvent, id: string) => {
    e.stopPropagation();
    if (confirm("Are you sure you want to permanently delete this case record?")) {
      setLocalCases(prev => prev.filter(c => c.id !== id));
      showToast(`Case ${id} deleted successfully.`, "success");
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (editingCase) {
      setLocalCases(prev => prev.map(c => c.id === editingCase.id ? { ...c, ...formData } : c));
      showToast("Whistleblower case updated.", "success");
    } else {
      const newId = `CASE-${Math.floor(1000 + Math.random() * 9000)}`;
      setLocalCases(prev => [{ id: newId, ...formData, date: new Date().toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' }) }, ...prev]);
      showToast("Anonymous tip submitted and encrypted.", "success");
    }
    setIsModalOpen(false);
  };

  const handleExportPdf = () => {
    const headers = ['Case ID', 'Category', 'Severity', 'Status', 'Date'];
    const data = localCases.map(c => [c.id, c.category, c.severity, c.status, c.date || '2026-06-25']);
    generatePdfExport('Ethics & Whistleblower Log', headers, data, 'whistleblower-export');
    showToast('Whistleblower report generated successfully.', 'info');
  };

  return (
    <div className="p-4 sm:p-5 lg:p-6 space-y-4 sm:space-y-6">
      <div className="flex flex-col md:flex-row justify-between md:items-center gap-4">
        <div>
          <h3 className="text-lg font-bold text-slate-900 flex items-center gap-2">
            <AlertTriangle className="w-5 h-5 text-rose-600" />
            Ethics & Whistleblower Cases
          </h3>
          <p className="text-xs text-slate-500 mt-1">Anonymous, encrypted routing of whistleblower reports and ethical violations.</p>
        </div>
        <div className="flex gap-2">
          <button 
            onClick={handleOpenNew}
            className="px-4 py-2 bg-rose-600 text-white rounded-lg text-sm font-bold hover:bg-rose-700 transition-colors flex items-center gap-2"
          >
            <Send className="w-4 h-4" />
            Submit Anonymous Tip
          </button>
          <button 
            onClick={handleExportPdf}
            className="p-2 text-slate-500 hover:bg-slate-100 rounded-lg transition-colors border border-slate-200"
            title="Export to PDF"
          >
            <Download className="w-4 h-4" />
          </button>
        </div>
      </div>

      {isModalOpen && (
        <div className="fixed inset-0 bg-slate-950/60 backdrop-blur-md z-[100] flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md border border-slate-200 overflow-hidden">
            <div className="p-5 border-b border-slate-100 flex justify-between items-center bg-slate-50">
              <h4 className="font-black text-slate-900">{editingCase ? 'Modify Case Record' : 'Submit New Anonymous Tip'}</h4>
              <button onClick={() => setIsModalOpen(false)} className="text-slate-400 hover:text-slate-600"><X className="w-5 h-5" /></button>
            </div>
            <form onSubmit={handleSubmit} className="p-5 space-y-4">
              <div>
                <label className="block text-xs font-bold text-slate-500 uppercase mb-1">Category</label>
                <select 
                  value={formData.category}
                  onChange={e => setFormData({...formData, category: e.target.value})}
                  className="w-full p-2.5 border border-slate-200 rounded-lg text-sm outline-none"
                >
                  <option>Financial Bribery</option>
                  <option>Executive Harassment</option>
                  <option>Compliance Violation</option>
                  <option>Security Breach</option>
                  <option>HR Grievance</option>
                </select>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold text-slate-500 uppercase mb-1">Severity</label>
                  <select 
                    value={formData.severity}
                    onChange={e => setFormData({...formData, severity: e.target.value})}
                    className="w-full p-2.5 border border-slate-200 rounded-lg text-sm outline-none"
                  >
                    <option>Low</option>
                    <option>Medium</option>
                    <option>High</option>
                    <option>Critical</option>
                  </select>
                </div>
                <div>
                  <label className="block text-xs font-bold text-slate-500 uppercase mb-1">Status</label>
                  <select 
                    value={formData.status}
                    onChange={e => setFormData({...formData, status: e.target.value})}
                    className="w-full p-2.5 border border-slate-200 rounded-lg text-sm outline-none"
                  >
                    <option>New</option>
                    <option>Investigating</option>
                    <option>Resolved</option>
                    <option>Dismissed</option>
                  </select>
                </div>
              </div>
              <div>
                <label className="block text-xs font-bold text-slate-500 uppercase mb-1">Detailed Description</label>
                <textarea 
                  required
                  value={formData.desc}
                  onChange={e => setFormData({...formData, desc: e.target.value})}
                  className="w-full h-24 p-2.5 border border-slate-200 rounded-lg text-sm focus:border-rose-500 outline-none"
                  placeholder="Provide context about the incident..."
                />
              </div>
              <div className="flex gap-3 pt-2">
                <button type="button" onClick={() => setIsModalOpen(false)} className="flex-1 py-2.5 border border-slate-200 rounded-xl text-sm font-bold text-slate-600 hover:bg-slate-50 transition-colors">Cancel</button>
                <button type="submit" className="flex-1 py-2.5 bg-rose-600 text-white rounded-xl text-sm font-bold hover:bg-rose-700 transition-all">
                  {editingCase ? 'Save Changes' : 'Submit Encrypted Tip'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
        <div className="bg-slate-50 border border-slate-200 p-4 rounded-xl shadow-sm">
          <p className="text-slate-500 font-bold text-xs uppercase">Total Cases</p>
          <p className="text-2xl font-black text-slate-900">{localCases.length}</p>
        </div>
        <div className="bg-rose-50 border border-rose-100 p-4 rounded-xl shadow-sm">
          <p className="text-rose-600 font-bold text-xs uppercase">Critical Level</p>
          <p className="text-2xl font-black text-rose-900">{localCases.filter(c => c.severity === 'Critical').length}</p>
        </div>
        <div className="bg-indigo-50 border border-indigo-100 p-4 rounded-xl shadow-sm">
          <p className="text-indigo-600 font-bold text-xs uppercase">Under Investigation</p>
          <p className="text-2xl font-black text-indigo-900">{localCases.filter(c => c.status === 'Investigating').length}</p>
        </div>
        <div className="bg-emerald-50 border border-emerald-100 p-4 rounded-xl shadow-sm">
          <p className="text-emerald-600 font-bold text-xs uppercase">Resolved</p>
          <p className="text-2xl font-black text-emerald-900">{localCases.filter(c => c.status === 'Resolved').length}</p>
        </div>
      </div>

      <div className="flex gap-2 mb-4">
        {['All', 'New', 'Investigating', 'Resolved'].map(filter => (
          <button
            key={filter}
            onClick={() => setActiveFilter(filter)}
            className={`px-3 py-1.5 text-xs font-bold rounded-full border transition-colors ${
              activeFilter === filter 
                ? 'bg-slate-800 text-white border-slate-800' 
                : 'bg-white text-slate-600 border-slate-200 hover:bg-slate-50'
            }`}
          >
            {filter}
          </button>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        {filteredCases.map((c) => (
          <div key={c.id} onClick={() => onSelectCase(c)} className="bg-white border border-slate-200 p-5 rounded-xl cursor-pointer hover:border-indigo-300 hover:shadow-md transition-all group relative">
            <div className="absolute top-4 right-4 flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
              <button onClick={(e) => handleEdit(e, c)} className="p-1.5 text-slate-400 hover:text-indigo-600 hover:bg-indigo-50 rounded-lg"><Edit2 className="w-3.5 h-3.5" /></button>
              <button onClick={(e) => handleDelete(e, c.id)} className="p-1.5 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded-lg"><Trash2 className="w-3.5 h-3.5" /></button>
            </div>

            <div className="flex justify-between items-start mb-3">
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-full bg-slate-100 flex items-center justify-center text-slate-500">
                  <UserX className="w-4 h-4" />
                </div>
                <div>
                  <span className="font-black text-sm text-slate-900 group-hover:text-indigo-600 transition-colors">{c.id}</span>
                  <p className="text-[10px] text-slate-500 font-bold flex items-center gap-1"><Lock className="w-3 h-3" /> Anonymous Sender</p>
                </div>
              </div>
              <span className={`text-[10px] font-bold px-2.5 py-1 rounded-full mr-12 ${
                c.severity === 'Critical' ? 'bg-rose-100 text-rose-700' : 
                c.severity === 'High' ? 'bg-orange-100 text-orange-700' : 
                'bg-amber-100 text-amber-700'
              }`}>
                {c.severity}
              </span>
            </div>
            
            <div className="mb-4">
              <h4 className="font-bold text-sm mb-1">{c.category}</h4>
              <p className="text-xs text-slate-600 line-clamp-2">{c.desc}</p>
            </div>

            <div className="flex justify-between items-center pt-3 border-t border-slate-100">
              <span className="text-xs text-slate-500 font-medium">{c.date || '2026-06-25'}</span>
              <span className={`text-[10px] font-bold px-2 py-0.5 rounded ${
                c.status === 'Resolved' ? 'bg-emerald-100 text-emerald-700' : 
                c.status === 'Investigating' ? 'bg-indigo-100 text-indigo-700' : 
                'bg-slate-100 text-slate-700'
              }`}>
                {c.status}
              </span>
            </div>
          </div>
        ))}
        
        {filteredCases.length === 0 && (
          <div className="col-span-1 lg:col-span-2 p-5 sm:p-6 lg:p-8 text-center text-slate-500 bg-slate-50 rounded-xl border border-dashed border-slate-300">
            <MessageSquare className="w-8 h-8 mx-auto mb-2 text-slate-400" />
            <p className="font-bold text-sm">No cases found.</p>
            <p className="text-xs mt-1">There are no whistleblower cases matching the selected filter.</p>
          </div>
        )}
      </div>
    </div>
  );
};
