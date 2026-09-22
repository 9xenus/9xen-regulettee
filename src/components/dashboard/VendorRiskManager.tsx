import React, { useState } from 'react';
import { ShieldAlert, AlertCircle, Search, ShieldCheck, Settings, Download, Plus, X, Edit2, Trash2 } from 'lucide-react';
import { generatePdfExport } from '../../utils/pdfGenerator';
import { useNotification } from '../../context/NotificationContext';

export const VendorRiskManager: React.FC = () => {
  const { showToast } = useNotification();
  const [searchTerm, setSearchTerm] = useState("");
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingVendor, setEditingVendor] = useState<any>(null);
  const [formData, setFormData] = useState({
    name: "",
    category: "Infrastructure",
    risk: "Low",
    status: "Pending Review",
    dpaSigned: false
  });

  const [vendors, setVendors] = useState([
    { id: 'V-01', name: 'Cloud Provider A', category: 'Infrastructure', risk: 'Low', status: 'Compliant', dpaSigned: true },
    { id: 'V-02', name: 'Marketing Agency B', category: 'Marketing', risk: 'High', status: 'Pending Review', dpaSigned: false },
    { id: 'V-03', name: 'Analytics Platform C', category: 'Analytics', risk: 'Medium', status: 'In Review', dpaSigned: true },
    { id: 'V-04', name: 'Payment Processor D', category: 'Finance', risk: 'Low', status: 'Compliant', dpaSigned: true },
  ]);

  const filteredVendors = vendors.filter(v => 
    v.name.toLowerCase().includes(searchTerm.toLowerCase()) || 
    v.category.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const handleStatusChange = (id: string, newStatus: string) => {
    setVendors(prev => prev.map(v => v.id === id ? { ...v, status: newStatus } : v));
    showToast(`Vendor ${id} status updated to ${newStatus}.`, 'success');
  };

  const handleDelete = (id: string) => {
    if (confirm("Are you sure you want to remove this vendor?")) {
      setVendors(prev => prev.filter(v => v.id !== id));
      showToast(`Vendor ${id} removed from registry.`, 'success');
    }
  };

  const handleEdit = (vendor: any) => {
    setEditingVendor(vendor);
    setFormData({
      name: vendor.name,
      category: vendor.category,
      risk: vendor.risk,
      status: vendor.status,
      dpaSigned: vendor.dpaSigned
    });
    setIsModalOpen(true);
  };

  const handleOpenNew = () => {
    setEditingVendor(null);
    setFormData({
      name: "",
      category: "Infrastructure",
      risk: "Low",
      status: "Pending Review",
      dpaSigned: false
    });
    setIsModalOpen(true);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (editingVendor) {
      setVendors(prev => prev.map(v => v.id === editingVendor.id ? { ...v, ...formData } : v));
      showToast("Vendor profile updated successfully.", "success");
    } else {
      const newId = `V-${String(vendors.length + 1).padStart(2, '0')}`;
      setVendors(prev => [...prev, { id: newId, ...formData }]);
      showToast("New vendor registered successfully.", "success");
    }
    setIsModalOpen(false);
  };

  const handleExportPdf = () => {
    const headers = ['Vendor ID', 'Name', 'Category', 'Risk', 'Status', 'DPA Signed'];
    const data = vendors.map(v => [v.id, v.name, v.category, v.risk, v.status, v.dpaSigned ? 'Yes' : 'No']);
    generatePdfExport('Vendor Risk Assessment', headers, data, 'vendor-risk-export');
    showToast('Vendor Risk report generated successfully.', 'info');
  };

  return (
    <div className="p-4 sm:p-5 lg:p-6 space-y-4 sm:space-y-6">
      <div className="flex flex-col md:flex-row justify-between md:items-center gap-4">
        <div>
          <h3 className="text-lg font-bold text-slate-900 flex items-center gap-2">
            <ShieldAlert className="w-5 h-5 text-indigo-600" />
            Vendor Risk Management
          </h3>
          <p className="text-xs text-slate-500 mt-1">Assess and monitor third-party processor compliance (DPA, SCCs).</p>
        </div>
        <div className="flex gap-2">
          <div className="relative">
            <Search className="w-4 h-4 absolute left-3 top-2.5 text-slate-400" />
            <input 
              type="text" 
              placeholder="Search vendors..." 
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-9 pr-4 py-2 border border-slate-200 rounded-lg text-sm focus:outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500"
            />
          </div>
          <button 
            onClick={handleOpenNew}
            className="px-4 py-2 bg-indigo-600 text-white rounded-lg text-sm font-bold hover:bg-indigo-700 transition-colors flex items-center gap-2"
          >
            <Plus className="w-4 h-4" />
            New Vendor
          </button>
          <button 
            onClick={handleExportPdf}
            className="px-4 py-2 bg-slate-900 text-white rounded-lg text-sm font-bold hover:bg-slate-800 transition-colors flex items-center gap-2"
          >
            <Download className="w-4 h-4" />
            Export
          </button>
        </div>
      </div>

      {isModalOpen && (
        <div className="fixed inset-0 bg-slate-950/50 backdrop-blur-sm z-[100] flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md border border-slate-200 overflow-hidden">
            <div className="p-5 border-b border-slate-100 flex justify-between items-center bg-slate-50">
              <h4 className="font-black text-slate-900">{editingVendor ? 'Edit Vendor Profile' : 'Register New Vendor'}</h4>
              <button onClick={() => setIsModalOpen(false)} className="text-slate-400 hover:text-slate-600"><X className="w-5 h-5" /></button>
            </div>
            <form onSubmit={handleSubmit} className="p-5 space-y-4">
              <div>
                <label className="block text-xs font-bold text-slate-500 uppercase mb-1">Vendor Name</label>
                <input 
                  required
                  type="text" 
                  value={formData.name}
                  onChange={e => setFormData({...formData, name: e.target.value})}
                  className="w-full p-2.5 border border-slate-200 rounded-lg text-sm focus:border-indigo-500 outline-none"
                  placeholder="e.g. Amazon Web Services"
                />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold text-slate-500 uppercase mb-1">Category</label>
                  <select 
                    value={formData.category}
                    onChange={e => setFormData({...formData, category: e.target.value})}
                    className="w-full p-2.5 border border-slate-200 rounded-lg text-sm outline-none"
                  >
                    <option>Infrastructure</option>
                    <option>Marketing</option>
                    <option>Analytics</option>
                    <option>Finance</option>
                    <option>HR</option>
                    <option>Legal</option>
                  </select>
                </div>
                <div>
                  <label className="block text-xs font-bold text-slate-500 uppercase mb-1">Risk Level</label>
                  <select 
                    value={formData.risk}
                    onChange={e => setFormData({...formData, risk: e.target.value})}
                    className="w-full p-2.5 border border-slate-200 rounded-lg text-sm outline-none"
                  >
                    <option>Low</option>
                    <option>Medium</option>
                    <option>High</option>
                    <option>Critical</option>
                  </select>
                </div>
              </div>
              <div className="flex items-center gap-3 p-3 bg-slate-50 rounded-xl border border-slate-100">
                <input 
                  type="checkbox" 
                  id="dpaSigned"
                  checked={formData.dpaSigned}
                  onChange={e => setFormData({...formData, dpaSigned: e.target.checked})}
                  className="w-4 h-4 rounded text-indigo-600"
                />
                <label htmlFor="dpaSigned" className="text-sm font-medium text-slate-700 cursor-pointer">
                  Data Processing Agreement (DPA) Signed
                </label>
              </div>
              <div className="flex gap-3 pt-2">
                <button type="button" onClick={() => setIsModalOpen(false)} className="flex-1 py-2.5 border border-slate-200 rounded-xl text-sm font-bold text-slate-600 hover:bg-slate-50 transition-colors">Cancel</button>
                <button type="submit" className="flex-1 py-2.5 bg-indigo-600 text-white rounded-xl text-sm font-bold hover:bg-indigo-700 transition-all">
                  {editingVendor ? 'Save Changes' : 'Register Vendor'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
        <div className="bg-white border border-slate-200 p-4 rounded-xl shadow-sm">
          <p className="text-slate-500 font-bold text-xs uppercase">Total Vendors</p>
          <p className="text-2xl font-black text-slate-900">{vendors.length}</p>
        </div>
        <div className="bg-emerald-50 border border-emerald-100 p-4 rounded-xl shadow-sm">
          <p className="text-emerald-600 font-bold text-xs uppercase">Compliant</p>
          <p className="text-2xl font-black text-emerald-900">{vendors.filter(v => v.status === 'Compliant').length}</p>
        </div>
        <div className="bg-amber-50 border border-amber-100 p-4 rounded-xl shadow-sm">
          <p className="text-amber-600 font-bold text-xs uppercase">In Review</p>
          <p className="text-2xl font-black text-amber-900">{vendors.filter(v => v.status === 'In Review').length}</p>
        </div>
        <div className="bg-rose-50 border border-rose-100 p-4 rounded-xl shadow-sm">
          <p className="text-rose-600 font-bold text-xs uppercase">High Risk</p>
          <p className="text-2xl font-black text-rose-900">{vendors.filter(v => v.risk === 'High' || v.risk === 'Critical').length}</p>
        </div>
      </div>

      <div className="border border-slate-200 rounded-xl overflow-x-auto bg-white">
        <table className="w-full text-left text-sm">
          <thead className="bg-slate-50 border-b border-slate-200 text-slate-600 font-bold text-xs uppercase tracking-wider">
            <tr>
              <th className="px-4 py-3 text-right w-10">Actions</th>
              <th className="px-4 py-3">Vendor</th>
              <th className="px-4 py-3">Category</th>
              <th className="px-4 py-3">Risk Level</th>
              <th className="px-4 py-3">DPA Status</th>
              <th className="px-4 py-3 text-right">Review Status</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100">
            {filteredVendors.map(v => (
              <tr key={v.id} className="hover:bg-slate-50 transition-colors group">
                <td className="px-4 py-3">
                  <div className="flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                    <button onClick={() => handleEdit(v)} className="p-1.5 text-slate-400 hover:text-indigo-600 hover:bg-indigo-50 rounded-lg transition-all"><Edit2 className="w-3.5 h-3.5" /></button>
                    <button onClick={() => handleDelete(v.id)} className="p-1.5 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded-lg transition-all"><Trash2 className="w-3.5 h-3.5" /></button>
                  </div>
                </td>
                <td className="px-4 py-3">
                  <p className="font-bold text-slate-900">{v.name}</p>
                  <p className="text-[10px] text-slate-500 font-mono tracking-tighter">{v.id}</p>
                </td>
                <td className="px-4 py-3 text-slate-700 font-medium">{v.category}</td>
                <td className="px-4 py-3">
                  <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${
                    v.risk === 'Low' ? 'bg-emerald-100 text-emerald-700' : 
                    v.risk === 'Medium' ? 'bg-amber-100 text-amber-700' : 
                    v.risk === 'High' ? 'bg-orange-100 text-orange-700' :
                    'bg-rose-100 text-rose-700'
                  }`}>
                    {v.risk}
                  </span>
                </td>
                <td className="px-4 py-3">
                  {v.dpaSigned ? (
                    <span className="flex items-center gap-1 text-emerald-600 text-[11px] font-black">
                      <ShieldCheck className="w-3.5 h-3.5" /> SIGNED
                    </span>
                  ) : (
                    <span className="flex items-center gap-1 text-rose-600 text-[11px] font-black">
                      <AlertCircle className="w-3.5 h-3.5" /> MISSING
                    </span>
                  )}
                </td>
                <td className="px-4 py-3 text-right">
                  <select 
                    value={v.status}
                    onChange={(e) => handleStatusChange(v.id, e.target.value)}
                    className="text-[11px] border border-slate-200 rounded-lg p-1.5 bg-white font-black uppercase tracking-tight shadow-sm cursor-pointer hover:border-slate-300"
                  >
                    <option value="Compliant">Compliant</option>
                    <option value="In Review">In Review</option>
                    <option value="Pending Review">Pending Review</option>
                    <option value="Rejected">Rejected</option>
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
