import React, { useState } from 'react';
import { Leaf, Users, Award, Plus, Download, BarChart2, X, Edit2, Trash2 } from 'lucide-react';
import { useNotification } from '../../context/NotificationContext';
import { generatePdfExport } from '../../utils/pdfGenerator';

export const EsgSustainabilityManager: React.FC = () => {
  const { showToast } = useNotification();
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingInitiative, setEditingInitiative] = useState<any>(null);
  const [formData, setFormData] = useState({
    name: "",
    pillar: "Environmental",
    status: "Planned",
    impact: "Medium",
    date: new Date().toISOString().split('T')[0]
  });

  const [initiatives, setInitiatives] = useState([
    { id: 'ESG-001', name: 'Server Infrastructure Migration to EU Green Cloud', pillar: 'Environmental', status: 'In Progress', impact: 'High', date: '2026-02-15' },
    { id: 'ESG-002', name: 'Annual Diversity & Inclusion Reporting', pillar: 'Social', status: 'Completed', impact: 'Medium', date: '2026-01-10' },
    { id: 'ESG-003', name: 'AI Ethics Board Establishment', pillar: 'Governance', status: 'Planned', impact: 'High', date: '2026-08-01' },
    { id: 'ESG-004', name: 'Supply Chain Carbon Audit', pillar: 'Environmental', status: 'In Progress', impact: 'Medium', date: '2026-05-20' },
  ]);

  const handleOpenNew = () => {
    setEditingInitiative(null);
    setFormData({
      name: "",
      pillar: "Environmental",
      status: "Planned",
      impact: "Medium",
      date: new Date().toISOString().split('T')[0]
    });
    setIsModalOpen(true);
  };

  const handleEdit = (initiative: any) => {
    setEditingInitiative(initiative);
    setFormData({
      name: initiative.name,
      pillar: initiative.pillar,
      status: initiative.status,
      impact: initiative.impact,
      date: initiative.date
    });
    setIsModalOpen(true);
  };

  const handleDelete = (id: string) => {
    if (confirm("Are you sure you want to delete this ESG initiative record?")) {
      setInitiatives(prev => prev.filter(i => i.id !== id));
      showToast(`Initiative ${id} removed.`, "success");
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (editingInitiative) {
      setInitiatives(prev => prev.map(i => i.id === editingInitiative.id ? { ...i, ...formData } : i));
      showToast("ESG Initiative updated.", "success");
    } else {
      const newId = `ESG-${String(initiatives.length + 1).padStart(3, '0')}`;
      setInitiatives(prev => [...prev, { id: newId, ...formData }]);
      showToast("New ESG Initiative logged.", "success");
    }
    setIsModalOpen(false);
  };

  const handleExportPdf = () => {
    const headers = ['ID', 'Initiative Name', 'Pillar', 'Status', 'Impact', 'Date'];
    const data = initiatives.map(i => [i.id, i.name, i.pillar, i.status, i.impact, i.date]);
    generatePdfExport('ESG & Sustainability Report', headers, data, 'esg-export');
    showToast('ESG report generated successfully.', 'info');
  };

  const handleStatusChange = (id: string, newStatus: string) => {
    setInitiatives(prev => prev.map(i => i.id === id ? { ...i, status: newStatus } : i));
    showToast(`Initiative ${id} status updated to ${newStatus}.`, 'success');
  };

  return (
    <div className="p-4 sm:p-5 lg:p-6 space-y-4 sm:space-y-6">
      <div className="flex flex-col md:flex-row justify-between md:items-center gap-4">
        <div>
          <h3 className="text-lg font-bold text-slate-900 flex items-center gap-2">
            <Leaf className="w-5 h-5 text-emerald-600" />
            ESG & Sustainability
          </h3>
          <p className="text-xs text-slate-500 mt-1">Track corporate Environmental, Social, and Governance initiatives.</p>
        </div>
        <div className="flex gap-2">
          <button 
            onClick={handleOpenNew}
            className="px-4 py-2 bg-emerald-600 text-white rounded-lg text-sm font-bold hover:bg-emerald-700 transition-colors flex items-center gap-2"
          >
            <Plus className="w-4 h-4" />
            Add Initiative
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
        <div className="fixed inset-0 bg-slate-950/40 backdrop-blur-sm z-[100] flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md border border-slate-200 overflow-hidden animate-in fade-in zoom-in duration-200">
            <div className="p-5 border-b border-slate-100 flex justify-between items-center bg-slate-50/50">
              <h4 className="font-black text-slate-900 uppercase tracking-tight">{editingInitiative ? 'Edit Initiative' : 'New ESG Initiative'}</h4>
              <button onClick={() => setIsModalOpen(false)} className="text-slate-400 hover:text-slate-600"><X className="w-5 h-5" /></button>
            </div>
            <form onSubmit={handleSubmit} className="p-5 space-y-4">
              <div>
                <label className="block text-[10px] font-black text-slate-400 uppercase mb-1 tracking-widest">Initiative Name</label>
                <input 
                  required
                  type="text" 
                  value={formData.name}
                  onChange={e => setFormData({...formData, name: e.target.value})}
                  className="w-full p-2.5 border border-slate-200 rounded-xl text-sm focus:border-emerald-500 outline-none transition-all shadow-sm"
                  placeholder="e.g. Net Zero 2030 Roadmap"
                />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-[10px] font-black text-slate-400 uppercase mb-1 tracking-widest">Pillar</label>
                  <select 
                    value={formData.pillar}
                    onChange={e => setFormData({...formData, pillar: e.target.value})}
                    className="w-full p-2.5 border border-slate-200 rounded-xl text-sm outline-none bg-white cursor-pointer hover:border-emerald-300 transition-all"
                  >
                    <option>Environmental</option>
                    <option>Social</option>
                    <option>Governance</option>
                  </select>
                </div>
                <div>
                  <label className="block text-[10px] font-black text-slate-400 uppercase mb-1 tracking-widest">Impact</label>
                  <select 
                    value={formData.impact}
                    onChange={e => setFormData({...formData, impact: e.target.value})}
                    className="w-full p-2.5 border border-slate-200 rounded-xl text-sm outline-none bg-white cursor-pointer hover:border-emerald-300 transition-all"
                  >
                    <option>Low</option>
                    <option>Medium</option>
                    <option>High</option>
                    <option>Transformational</option>
                  </select>
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-[10px] font-black text-slate-400 uppercase mb-1 tracking-widest">Target Date</label>
                  <input 
                    type="date"
                    value={formData.date}
                    onChange={e => setFormData({...formData, date: e.target.value})}
                    className="w-full p-2.5 border border-slate-200 rounded-xl text-sm outline-none bg-white hover:border-emerald-300 transition-all shadow-sm"
                  />
                </div>
                <div>
                  <label className="block text-[10px] font-black text-slate-400 uppercase mb-1 tracking-widest">Initial Status</label>
                  <select 
                    value={formData.status}
                    onChange={e => setFormData({...formData, status: e.target.value})}
                    className="w-full p-2.5 border border-slate-200 rounded-xl text-sm outline-none bg-white cursor-pointer hover:border-emerald-300 transition-all"
                  >
                    <option>Planned</option>
                    <option>In Progress</option>
                    <option>Completed</option>
                    <option>On Hold</option>
                  </select>
                </div>
              </div>
              <div className="flex gap-3 pt-4">
                <button type="button" onClick={() => setIsModalOpen(false)} className="flex-1 py-3 border border-slate-200 rounded-2xl text-sm font-bold text-slate-600 hover:bg-slate-50 transition-all">Cancel</button>
                <button type="submit" className="flex-1 py-3 bg-emerald-600 text-white rounded-2xl text-sm font-black uppercase tracking-widest shadow-lg shadow-emerald-200 hover:bg-emerald-700 hover:shadow-xl transition-all">
                  {editingInitiative ? 'Save Record' : 'Log Initiative'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 sm:gap-6 mb-6">
        <div className="bg-gradient-to-br from-emerald-50 to-emerald-100 border border-emerald-200 p-5 rounded-2xl shadow-sm flex flex-col justify-between h-32 relative overflow-hidden group">
          <Leaf className="w-16 h-16 text-emerald-500/10 absolute -right-4 -bottom-4 group-hover:scale-110 transition-transform duration-500" />
          <div>
            <p className="text-emerald-700 font-bold text-sm uppercase tracking-wider">Environmental</p>
            <p className="text-xs text-emerald-600 font-medium">Net Zero Path Tracking</p>
          </div>
          <div className="flex justify-between items-end">
            <p className="text-3xl font-black text-emerald-900">{initiatives.filter(i => i.pillar === 'Environmental').length}</p>
            <span className="text-[10px] font-bold bg-emerald-200 text-emerald-800 px-2 py-1 rounded">Active</span>
          </div>
        </div>
        
        <div className="bg-gradient-to-br from-blue-50 to-blue-100 border border-blue-200 p-5 rounded-2xl shadow-sm flex flex-col justify-between h-32 relative overflow-hidden group">
          <Users className="w-16 h-16 text-blue-500/10 absolute -right-4 -bottom-4 group-hover:scale-110 transition-transform duration-500" />
          <div>
            <p className="text-blue-700 font-bold text-sm uppercase tracking-wider">Social</p>
            <p className="text-xs text-blue-600 font-medium">DEI & Labor Metrics</p>
          </div>
          <div className="flex justify-between items-end">
            <p className="text-3xl font-black text-blue-900">{initiatives.filter(i => i.pillar === 'Social').length}</p>
            <span className="text-[10px] font-bold bg-blue-200 text-blue-800 px-2 py-1 rounded">Active</span>
          </div>
        </div>

        <div className="bg-gradient-to-br from-amber-50 to-amber-100 border border-amber-200 p-5 rounded-2xl shadow-sm flex flex-col justify-between h-32 relative overflow-hidden group">
          <Award className="w-16 h-16 text-amber-500/10 absolute -right-4 -bottom-4 group-hover:scale-110 transition-transform duration-500" />
          <div>
            <p className="text-amber-700 font-bold text-sm uppercase tracking-wider">Governance</p>
            <p className="text-xs text-amber-600 font-medium">Ethics & Compliance</p>
          </div>
          <div className="flex justify-between items-end">
            <p className="text-3xl font-black text-amber-900">{initiatives.filter(i => i.pillar === 'Governance').length}</p>
            <span className="text-[10px] font-bold bg-amber-200 text-amber-800 px-2 py-1 rounded">Active</span>
          </div>
        </div>
      </div>

      <div className="border border-slate-200 rounded-2xl overflow-hidden bg-white shadow-sm">
        <table className="w-full text-left text-sm">
          <thead className="bg-slate-50 border-b border-slate-200 text-slate-400 font-black text-[10px] uppercase tracking-widest">
            <tr>
              <th className="px-5 py-4 w-10 text-center">Actions</th>
              <th className="px-4 py-4">Initiative Name</th>
              <th className="px-4 py-4">Pillar</th>
              <th className="px-4 py-4">Impact</th>
              <th className="px-4 py-4">Date</th>
              <th className="px-4 py-4 text-right">Status</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100">
            {initiatives.map(i => (
              <tr key={i.id} className="hover:bg-slate-50 transition-colors group">
                <td className="px-5 py-4">
                  <div className="flex gap-1 justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                    <button onClick={() => handleEdit(i)} className="p-1.5 text-slate-400 hover:text-emerald-600 hover:bg-emerald-50 rounded-lg transition-all"><Edit2 className="w-3.5 h-3.5" /></button>
                    <button onClick={() => handleDelete(i.id)} className="p-1.5 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded-lg transition-all"><Trash2 className="w-3.5 h-3.5" /></button>
                  </div>
                </td>
                <td className="px-4 py-4">
                  <p className="font-bold text-slate-900 group-hover:text-emerald-700 transition-colors">{i.name}</p>
                  <p className="text-[10px] text-slate-400 font-mono">{i.id}</p>
                </td>
                <td className="px-4 py-4">
                  <span className={`text-[10px] font-black px-2.5 py-1 rounded-full uppercase tracking-tight ${
                    i.pillar === 'Environmental' ? 'bg-emerald-100 text-emerald-700' : 
                    i.pillar === 'Social' ? 'bg-blue-100 text-blue-700' : 
                    'bg-amber-100 text-amber-700'
                  }`}>
                    {i.pillar}
                  </span>
                </td>
                <td className="px-4 py-4">
                  <span className={`text-[11px] font-bold ${
                    i.impact === 'High' || i.impact === 'Transformational' ? 'text-rose-600' : 'text-slate-600'
                  }`}>{i.impact}</span>
                </td>
                <td className="px-4 py-4 text-slate-500 font-mono text-xs">
                  {i.date}
                </td>
                <td className="px-4 py-4 text-right">
                  <select 
                    value={i.status}
                    onChange={(e) => handleStatusChange(i.id, e.target.value)}
                    className="text-[10px] font-black uppercase tracking-widest border border-slate-200 rounded-lg px-2 py-1.5 bg-white shadow-sm cursor-pointer hover:border-emerald-300 transition-all outline-none"
                  >
                    <option value="Planned">Planned</option>
                    <option value="In Progress">In Progress</option>
                    <option value="Completed">Completed</option>
                    <option value="On Hold">On Hold</option>
                  </select>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};
