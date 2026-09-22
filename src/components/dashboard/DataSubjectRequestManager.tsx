import React, { useState } from 'react';
import { UserCheck, Clock, CheckCircle, Search, Shield, X, RefreshCw, ChevronDown, ChevronUp, ExternalLink, Edit2, Trash2 } from 'lucide-react';
import { generatePdfExport } from '../../utils/pdfGenerator';
import { useNotification } from '../../context/NotificationContext';
import { DsarProgressTracker, getDsarSteps } from './DsarProgressTracker';
import { motion, AnimatePresence } from 'motion/react';

export const DataSubjectRequestManager: React.FC = () => {
  const { showToast } = useNotification();
  const [searchTerm, setSearchTerm] = useState("");
  const [expandedId, setExpandedId] = useState<string | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingRequest, setEditingRequest] = useState<any>(null);
  const [formData, setFormData] = useState({
    subject: "",
    type: "Access",
    status: "Pending",
    date: new Date().toISOString().split('T')[0],
    deadline: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
    details: ""
  });

  const [requests, setRequests] = useState([
    { id: 'DSR-001', subject: 'John Doe', type: 'Access', status: 'Pending', date: '2026-06-25', deadline: '2026-07-25', details: 'Requests all data related to marketing interactions.' },
    { id: 'DSR-002', subject: 'Jane Smith', type: 'Erasure', status: 'In Progress', date: '2026-06-20', deadline: '2026-07-20', details: 'Right to be forgotten request.' },
    { id: 'DSR-003', subject: 'Michael Brown', type: 'Rectification', status: 'Completed', date: '2026-05-15', deadline: '2026-06-15', details: 'Update home address.' },
  ]);

  const filteredRequests = requests.filter(req => 
    req.id.toLowerCase().includes(searchTerm.toLowerCase()) || 
    req.subject.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const handleOpenNew = () => {
    setEditingRequest(null);
    setFormData({
      subject: "",
      type: "Access",
      status: "Pending",
      date: new Date().toISOString().split('T')[0],
      deadline: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
      details: ""
    });
    setIsModalOpen(true);
  };

  const handleEdit = (e: React.MouseEvent, req: any) => {
    e.stopPropagation();
    setEditingRequest(req);
    setFormData({
      subject: req.subject,
      type: req.type,
      status: req.status,
      date: req.date,
      deadline: req.deadline,
      details: req.details
    });
    setIsModalOpen(true);
  };

  const handleDelete = (e: React.MouseEvent, id: string) => {
    e.stopPropagation();
    if (confirm("Are you sure you want to remove this DSAR record?")) {
      setRequests(prev => prev.filter(r => r.id !== id));
      showToast(`Request ${id} deleted from ledger.`, "success");
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (editingRequest) {
      setRequests(prev => prev.map(r => r.id === editingRequest.id ? { ...r, ...formData } : r));
      showToast("DSAR request updated successfully.", "success");
    } else {
      const newId = `DSR-${String(requests.length + 1).padStart(3, '0')}`;
      setRequests(prev => [{ id: newId, ...formData }, ...prev]);
      showToast("New DSAR request registered and tracked.", "success");
    }
    setIsModalOpen(false);
  };

  const handleStatusChange = (id: string, newStatus: string) => {
    setRequests(prev => prev.map(req => req.id === id ? { ...req, status: newStatus } : req));
    showToast(`Request ${id} status updated to ${newStatus}.`, 'success');
  };

  const toggleExpand = (id: string) => {
    setExpandedId(expandedId === id ? null : id);
  };

  const handleExportPdf = () => {
    const headers = ['Request ID', 'Subject', 'Type', 'Status', 'Date', 'Deadline'];
    const data = requests.map(req => [req.id, req.subject, req.type, req.status, req.date, req.deadline]);
    generatePdfExport('Data Subject Requests', headers, data, 'dsar-export');
    showToast('DSAR report generated successfully.', 'info');
  };

  const getStepIndex = (status: string) => {
    const map: Record<string, number> = {
      'Pending': 0,
      'In Progress': 2,
      'Completed': 5
    };
    return map[status] ?? 0;
  };

  return (
    <div className="p-4 sm:p-5 lg:p-6 space-y-4 sm:space-y-6">
      <div className="flex flex-col md:flex-row justify-between md:items-center gap-4">
        <div>
          <h3 className="text-lg font-bold text-slate-900 flex items-center gap-2">
            <Shield className="w-5 h-5 text-indigo-600" />
            Data Subject Requests (DSAR)
          </h3>
          <p className="text-xs text-slate-500 mt-1">Manage and track GDPR/CCPA requests from data subjects in real-time.</p>
        </div>
        <div className="flex gap-2">
          <div className="relative">
            <Search className="w-4 h-4 absolute left-3 top-2.5 text-slate-400" />
            <input 
              type="text" 
              placeholder="Search requests..." 
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-9 pr-4 py-2 border border-slate-200 rounded-lg text-sm focus:outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500"
            />
          </div>
          <button 
            onClick={handleOpenNew}
            className="px-4 py-2 bg-indigo-600 text-white rounded-lg text-sm font-bold hover:bg-indigo-700 transition-colors"
          >
            Register Request
          </button>
          <button 
            onClick={handleExportPdf}
            className="px-4 py-2 bg-slate-900 text-white rounded-lg text-sm font-bold hover:bg-slate-800 transition-colors"
          >
            Export Logs
          </button>
        </div>
      </div>

      {isModalOpen && (
        <div className="fixed inset-0 bg-slate-950/40 backdrop-blur-sm z-[100] flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md border border-slate-200 overflow-hidden">
            <div className="p-5 border-b border-slate-100 flex justify-between items-center bg-slate-50/50">
              <h4 className="font-black text-slate-900 uppercase tracking-tight">{editingRequest ? 'Edit DSAR Record' : 'Register New DSAR'}</h4>
              <button onClick={() => setIsModalOpen(false)} className="text-slate-400 hover:text-slate-600"><X className="w-5 h-5" /></button>
            </div>
            <form onSubmit={handleSubmit} className="p-5 space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-[10px] font-black text-slate-400 uppercase mb-1 tracking-widest">Subject Name</label>
                  <input 
                    required
                    type="text" 
                    value={formData.subject}
                    onChange={e => setFormData({...formData, subject: e.target.value})}
                    className="w-full p-2 border border-slate-200 rounded-lg text-sm focus:border-indigo-500 outline-none"
                    placeholder="e.g. John Doe"
                  />
                </div>
                <div>
                  <label className="block text-[10px] font-black text-slate-400 uppercase mb-1 tracking-widest">Request Type</label>
                  <select 
                    value={formData.type}
                    onChange={e => setFormData({...formData, type: e.target.value})}
                    className="w-full p-2 border border-slate-200 rounded-lg text-sm outline-none bg-white"
                  >
                    <option>Access</option>
                    <option>Erasure</option>
                    <option>Rectification</option>
                    <option>Portability</option>
                    <option>Restriction</option>
                  </select>
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-[10px] font-black text-slate-400 uppercase mb-1 tracking-widest">Received Date</label>
                  <input 
                    type="date"
                    value={formData.date}
                    onChange={e => setFormData({...formData, date: e.target.value})}
                    className="w-full p-2 border border-slate-200 rounded-lg text-sm outline-none bg-white"
                  />
                </div>
                <div>
                  <label className="block text-[10px] font-black text-slate-400 uppercase mb-1 tracking-widest">Deadline</label>
                  <input 
                    type="date"
                    value={formData.deadline}
                    onChange={e => setFormData({...formData, deadline: e.target.value})}
                    className="w-full p-2 border border-slate-200 rounded-lg text-sm outline-none bg-white"
                  />
                </div>
              </div>
              <div>
                <label className="block text-[10px] font-black text-slate-400 uppercase mb-1 tracking-widest">Request Details</label>
                <textarea 
                  required
                  rows={3}
                  value={formData.details}
                  onChange={e => setFormData({...formData, details: e.target.value})}
                  className="w-full p-2 border border-slate-200 rounded-lg text-sm focus:border-indigo-500 outline-none resize-none font-sans"
                  placeholder="Summarize the subject's request..."
                />
              </div>
              <div className="flex gap-3 pt-2">
                <button type="button" onClick={() => setIsModalOpen(false)} className="flex-1 py-2.5 border border-slate-200 rounded-xl text-sm font-bold text-slate-600 hover:bg-slate-50 transition-all">Cancel</button>
                <button type="submit" className="flex-1 py-2.5 bg-indigo-600 text-white rounded-xl text-sm font-bold hover:bg-indigo-700 transition-all shadow-md shadow-indigo-100">
                  {editingRequest ? 'Save Changes' : 'Register Request'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
        <div className="bg-indigo-50 border border-indigo-100 p-4 rounded-xl">
          <p className="text-indigo-600 font-bold text-sm uppercase tracking-tight">Open Requests</p>
          <p className="text-2xl font-black text-indigo-900">{requests.filter(r => r.status !== 'Completed').length}</p>
        </div>
        <div className="bg-emerald-50 border border-emerald-100 p-4 rounded-xl">
          <p className="text-emerald-600 font-bold text-sm uppercase tracking-tight">Completed</p>
          <p className="text-2xl font-black text-emerald-900">{requests.filter(r => r.status === 'Completed').length}</p>
        </div>
        <div className="bg-rose-50 border border-rose-100 p-4 rounded-xl">
          <p className="text-rose-600 font-bold text-sm uppercase tracking-tight">Approaching Deadline</p>
          <p className="text-2xl font-black text-rose-900">1</p>
        </div>
      </div>

      <div className="border border-slate-200 rounded-xl overflow-x-auto bg-white">
        <table className="w-full text-left text-sm">
          <thead className="bg-slate-50 border-b border-slate-200 text-slate-400 font-black text-[10px] uppercase tracking-widest">
            <tr>
              <th className="px-4 py-3 w-10"></th>
              <th className="px-4 py-3">ID / Subject</th>
              <th className="px-4 py-3">Request Type</th>
              <th className="px-4 py-3">Timeline</th>
              <th className="px-4 py-3">Status</th>
              <th className="px-4 py-3 text-right">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100">
            {filteredRequests.map(req => (
              <React.Fragment key={req.id}>
                <tr 
                  className={`hover:bg-slate-50 cursor-pointer transition-colors group ${expandedId === req.id ? 'bg-indigo-50/30' : ''}`}
                  onClick={() => toggleExpand(req.id)}
                >
                  <td className="px-4 py-3">
                    {expandedId === req.id ? <ChevronUp className="w-4 h-4 text-slate-400" /> : <ChevronDown className="w-4 h-4 text-slate-400" />}
                  </td>
                  <td className="px-4 py-3">
                    <p className="font-bold text-slate-900">{req.id}</p>
                    <p className="text-xs text-slate-500 font-medium">{req.subject}</p>
                  </td>
                  <td className="px-4 py-3 font-black text-[11px] text-slate-700 uppercase tracking-tight">
                    <span className="bg-slate-100 px-2 py-0.5 rounded-full border border-slate-200">{req.type}</span>
                  </td>
                  <td className="px-4 py-3">
                    <p className="text-[10px] text-slate-400 font-mono">REC: {req.date}</p>
                    <p className="text-[10px] text-rose-600 font-black uppercase">DUE: {req.deadline}</p>
                  </td>
                  <td className="px-4 py-3">
                    <span className={`text-[10px] font-black px-2.5 py-1 rounded-full uppercase tracking-tighter ${
                      req.status === 'Pending' ? 'bg-amber-100 text-amber-700' : 
                      req.status === 'In Progress' ? 'bg-blue-100 text-blue-700' : 
                      'bg-emerald-100 text-emerald-700'
                    }`}>
                      {req.status}
                    </span>
                  </td>
                  <td className="px-4 py-3 text-right">
                    <div className="flex items-center justify-end gap-2" onClick={e => e.stopPropagation()}>
                      <select 
                        value={req.status}
                        onChange={(e) => handleStatusChange(req.id, e.target.value)}
                        className="text-[10px] font-black uppercase border border-slate-200 rounded-lg p-1.5 bg-white cursor-pointer hover:border-indigo-300"
                      >
                        <option value="Pending">Pending</option>
                        <option value="In Progress">In Progress</option>
                        <option value="Completed">Completed</option>
                      </select>
                      <button onClick={(e) => handleEdit(e, req)} className="p-1.5 text-slate-400 hover:text-indigo-600 hover:bg-indigo-50 rounded-lg"><Edit2 className="w-3.5 h-3.5" /></button>
                      <button onClick={(e) => handleDelete(e, req.id)} className="p-1.5 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded-lg"><Trash2 className="w-3.5 h-3.5" /></button>
                    </div>
                  </td>
                </tr>
                <AnimatePresence>
                  {expandedId === req.id && (
                    <tr>
                      <td colSpan={6} className="px-8 py-4 sm:py-6 bg-slate-50/50 border-l-4 border-l-indigo-500">
                        <motion.div
                          initial={{ opacity: 0, height: 0 }}
                          animate={{ opacity: 1, height: 'auto' }}
                          exit={{ opacity: 0, height: 0 }}
                          className="overflow-hidden"
                        >
                          <div className="flex justify-between items-center mb-6">
                            <div>
                              <h4 className="text-sm font-bold text-slate-900">Request Lifecycle Progress</h4>
                              <p className="text-xs text-slate-500">Real-time status of data processing and fulfillment steps.</p>
                            </div>
                            <div className="flex gap-2">
                              <button className="flex items-center gap-1 text-xs font-bold text-indigo-600 hover:text-indigo-700">
                                <ExternalLink className="w-3 h-3" /> Full Audit Trail
                              </button>
                            </div>
                          </div>

                          <DsarProgressTracker 
                            steps={getDsarSteps(req.status)} 
                            currentStepIndex={getStepIndex(req.status)}
                          />

                          <div className="mt-6 p-4 bg-white rounded-xl border border-slate-200 shadow-sm">
                            <h5 className="text-[10px] font-black text-slate-400 mb-2 uppercase tracking-widest">Request Details</h5>
                            <p className="text-sm text-slate-600 leading-relaxed font-medium italic">
                              "{req.details}"
                            </p>
                          </div>
                        </motion.div>
                      </td>
                    </tr>
                  )}
                </AnimatePresence>
              </React.Fragment>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};

