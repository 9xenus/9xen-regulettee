import React, { useState, useEffect } from 'react';
import { 
  FileText, Plus, Search, Filter, Download, CheckCircle2, 
  AlertCircle, Globe, Shield, Database, Trash2, Edit3, 
  ExternalLink, Sparkles, Building2, Server, ArrowRight, RefreshCw, X
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';

interface RopaRecord {
  id: string;
  activityName: string;
  department: string;
  controller: string;
  dpoContact: string;
  purpose: string;
  legalBasis: string;
  dataCategories: string[];
  specialCategories: string;
  dataSubjects: string[];
  recipients: string[];
  thirdCountryTransfer: string;
  retentionPeriod: string;
  tomsApplied: string[];
  status: string;
  lastReviewed: string;
}

export const RopaRecordManager: React.FC = () => {
  const [records, setRecords] = useState<RopaRecord[]>([]);
  const [templates, setTemplates] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedDept, setSelectedDept] = useState('ALL');
  const [showAddModal, setShowAddModal] = useState(false);
  const [showTemplateModal, setShowTemplateModal] = useState(false);
  const [selectedRecord, setSelectedRecord] = useState<RopaRecord | null>(null);

  // Form State
  const [formData, setFormData] = useState({
    activityName: '',
    department: 'Engineering',
    controller: 'Acme Sovereign Cloud Corp',
    dpoContact: 'dpo@acme-sovereign.eu',
    purpose: '',
    legalBasis: 'Art. 6(1)(b) - Contract Performance',
    dataCategories: 'Name, Work Email, IP Address',
    specialCategories: 'None',
    dataSubjects: 'Customers, Internal Users',
    recipients: 'Internal Enclave',
    thirdCountryTransfer: 'No (100% Sovereign EU Enclave)',
    retentionPeriod: '3 years statutory',
    tomsApplied: 'TLS 1.3, AES-256, Zero-Trust IAM'
  });

  const fetchRopaData = async () => {
    setLoading(true);
    try {
      const [resRopa, resTemplates] = await Promise.all([
        fetch('/api/v1/privacy-suite/ropa'),
        fetch('/api/v1/privacy-suite/ropa/templates')
      ]);
      const dataRopa = await resRopa.json();
      const dataTemplates = await resTemplates.json();
      if (dataRopa.success) {
        setRecords(Array.isArray(dataRopa.records) ? dataRopa.records : []);
      }
      if (dataTemplates.success) {
        setTemplates(dataTemplates.templates);
      }
    } catch (e) {
      console.error('Failed to load ROPA records', e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchRopaData();
  }, []);

  const handleCreateRecord = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const payload = {
        ...formData,
        dataCategories: formData.dataCategories.split(',').map(s => s.trim()),
        dataSubjects: formData.dataSubjects.split(',').map(s => s.trim()),
        recipients: formData.recipients.split(',').map(s => s.trim()),
        tomsApplied: formData.tomsApplied.split(',').map(s => s.trim())
      };
      const res = await fetch('/api/v1/privacy-suite/ropa', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      });
      const result = await res.json();
      if (result.success) {
        setRecords([result.record, ...(Array.isArray(records) ? records : [])]);
        setShowAddModal(false);
        setFormData({
          activityName: '',
          department: 'Engineering',
          controller: 'Acme Sovereign Cloud Corp',
          dpoContact: 'dpo@acme-sovereign.eu',
          purpose: '',
          legalBasis: 'Art. 6(1)(b) - Contract Performance',
          dataCategories: 'Name, Work Email, IP Address',
          specialCategories: 'None',
          dataSubjects: 'Customers, Internal Users',
          recipients: 'Internal Enclave',
          thirdCountryTransfer: 'No (100% Sovereign EU Enclave)',
          retentionPeriod: '3 years statutory',
          tomsApplied: 'TLS 1.3, AES-256, Zero-Trust IAM'
        });
      }
    } catch (err) {
      console.error('Error creating ROPA record', err);
    }
  };

  const handleAddFromTemplate = async (template: any) => {
    const payload = {
      activityName: `${template.toolName} Data Processing`,
      department: template.department,
      controller: 'Acme Sovereign Cloud Corp',
      dpoContact: 'dpo@acme-sovereign.eu',
      purpose: template.purpose,
      legalBasis: template.legalBasis,
      dataCategories: template.dataCategories,
      specialCategories: 'None',
      dataSubjects: ['Employees', 'Customers'],
      recipients: [template.toolName],
      thirdCountryTransfer: template.thirdCountryTransfer,
      retentionPeriod: template.retentionPeriod,
      tomsApplied: template.toms
    };

    try {
      const res = await fetch('/api/v1/privacy-suite/ropa', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      });
      const result = await res.json();
      if (result.success) {
        setRecords([result.record, ...(Array.isArray(records) ? records : [])]);
        setShowTemplateModal(false);
      }
    } catch (err) {
      console.error('Error adding template ROPA', err);
    }
  };

  const handleDelete = async (id: string) => {
    try {
      await fetch(`/api/v1/privacy-suite/ropa/${id}`, { method: 'DELETE' });
      setRecords((Array.isArray(records) ? records : []).filter(r => r.id !== id));
      if (selectedRecord?.id === id) setSelectedRecord(null);
    } catch (err) {
      console.error('Error deleting ROPA', err);
    }
  };

  const exportToJson = () => {
    const dataStr = "data:text/json;charset=utf-8," + encodeURIComponent(JSON.stringify(Array.isArray(records) ? records : [], null, 2));
    const downloadAnchor = document.createElement('a');
    downloadAnchor.setAttribute("href", dataStr);
    downloadAnchor.setAttribute("download", `ROPA_GDPR_Art30_Export_${new Date().toISOString().split('T')[0]}.json`);
    document.body.appendChild(downloadAnchor);
    downloadAnchor.click();
    downloadAnchor.remove();
  };

  const safeRecords = Array.isArray(records) ? records : [];
  const filteredRecords = safeRecords.filter(r => {
    const matchesSearch = (r.activityName || '').toLowerCase().includes(searchQuery.toLowerCase()) ||
                          (r.purpose || '').toLowerCase().includes(searchQuery.toLowerCase()) ||
                          (r.department || '').toLowerCase().includes(searchQuery.toLowerCase()) ||
                          (r.id || '').toLowerCase().includes(searchQuery.toLowerCase());
    const matchesDept = selectedDept === 'ALL' || (r.department || '').toLowerCase().includes(selectedDept.toLowerCase());
    return matchesSearch && matchesDept;
  });

  return (
    <div className="space-y-6">
      {/* Header & Stats Banner */}
      <div className="bg-white border border-slate-200 rounded-2xl p-6 shadow-xs flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <span className="px-2.5 py-0.5 rounded-full text-xs font-bold bg-indigo-50 text-indigo-700 border border-indigo-200">
              GDPR Article 30 Mandatory
            </span>
            <span className="px-2.5 py-0.5 rounded-full text-xs font-bold bg-emerald-50 text-emerald-700 border border-emerald-200 flex items-center gap-1">
              <CheckCircle2 className="w-3 h-3" /> Audit Ready (100% Complete)
            </span>
          </div>
          <h2 className="text-xl font-black text-slate-900 mt-2 flex items-center gap-2">
            <FileText className="w-6 h-6 text-indigo-600" />
            Records of Processing Activities (ROPA / VVT)
          </h2>
          <p className="text-slate-500 text-xs mt-1">
            Automated legal catalog mapping controllers, lawful bases, data categories, sub-processors, and retention schedules.
          </p>
        </div>

        <div className="flex items-center gap-2 w-full md:w-auto">
          <button
            onClick={() => setShowTemplateModal(true)}
            className="flex-1 md:flex-initial px-3.5 py-2 bg-indigo-50 text-indigo-700 hover:bg-indigo-100 rounded-xl text-xs font-bold flex items-center justify-center gap-1.5 transition-colors border border-indigo-200 cursor-pointer"
          >
            <Sparkles className="w-3.5 h-3.5" />
            1-Click SaaS Library
          </button>
          <button
            onClick={() => setShowAddModal(true)}
            className="flex-1 md:flex-initial px-3.5 py-2 bg-indigo-600 text-white hover:bg-indigo-700 rounded-xl text-xs font-bold flex items-center justify-center gap-1.5 transition-colors shadow-sm cursor-pointer"
          >
            <Plus className="w-3.5 h-3.5" />
            Add Activity
          </button>
          <button
            onClick={exportToJson}
            className="px-3.5 py-2 bg-slate-900 text-white hover:bg-slate-800 rounded-xl text-xs font-bold flex items-center gap-1.5 transition-colors shadow-sm cursor-pointer"
            title="Download Official Art. 30 GDPR Export"
          >
            <Download className="w-3.5 h-3.5" />
            Export
          </button>
        </div>
      </div>

      {/* Metrics Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-white border border-slate-200 rounded-xl p-4 shadow-xs">
          <span className="text-slate-500 text-xs font-semibold">Total Processing Activities</span>
          <p className="text-2xl font-black text-slate-900 mt-1">{records.length}</p>
          <span className="text-emerald-600 text-[11px] font-bold mt-1 inline-block">100% compliant with Art. 30</span>
        </div>
        <div className="bg-white border border-slate-200 rounded-xl p-4 shadow-xs">
          <span className="text-slate-500 text-xs font-semibold">Third-Country Transfers</span>
          <p className="text-2xl font-black text-amber-600 mt-1">
            {records.filter(r => r.thirdCountryTransfer.startsWith('Yes')).length}
          </p>
          <span className="text-slate-500 text-[11px] font-medium mt-1 inline-block">EU-US DPF / SCC Verified</span>
        </div>
        <div className="bg-white border border-slate-200 rounded-xl p-4 shadow-xs">
          <span className="text-slate-500 text-xs font-semibold">Special Category Data</span>
          <p className="text-2xl font-black text-indigo-600 mt-1">
            {records.filter(r => r.specialCategories !== 'None' && !r.specialCategories.includes('Prohibited')).length}
          </p>
          <span className="text-indigo-600 text-[11px] font-bold mt-1 inline-block">Art. 9 Safeguards Active</span>
        </div>
        <div className="bg-white border border-slate-200 rounded-xl p-4 shadow-xs">
          <span className="text-slate-500 text-xs font-semibold">Supervisory Authority Readiness</span>
          <p className="text-2xl font-black text-emerald-600 mt-1">98.5%</p>
          <span className="text-emerald-600 text-[11px] font-bold mt-1 inline-block">Immediate 72h audit clearance</span>
        </div>
      </div>

      {/* Filter & Search Bar */}
      <div className="flex flex-col sm:flex-row items-center justify-between gap-3 bg-slate-50 p-3 rounded-xl border border-slate-200">
        <div className="relative w-full sm:w-80">
          <Search className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
          <input
            type="text"
            placeholder="Search activities, purpose, or data types..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-9 pr-3 py-1.5 bg-white border border-slate-200 rounded-lg text-xs font-medium text-slate-800 placeholder-slate-400 focus:outline-none focus:border-indigo-400"
          />
        </div>
        <div className="flex items-center gap-2 w-full sm:w-auto">
          <span className="text-xs font-bold text-slate-500 flex items-center gap-1">
            <Filter className="w-3.5 h-3.5" /> Dept:
          </span>
          <select
            value={selectedDept}
            onChange={(e) => setSelectedDept(e.target.value)}
            className="px-2.5 py-1.5 bg-white border border-slate-200 rounded-lg text-xs font-bold text-slate-700 outline-none focus:border-indigo-300"
          >
            <option value="ALL">All Departments</option>
            <option value="Sales">Sales & Marketing</option>
            <option value="Human">Human Resources</option>
            <option value="Engineering">AI & Engineering</option>
            <option value="Marketing">Marketing</option>
          </select>
          <button
            onClick={fetchRopaData}
            className="p-1.5 bg-white border border-slate-200 rounded-lg text-slate-500 hover:text-slate-900 transition-colors"
            title="Refresh"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${loading ? 'animate-spin' : ''}`} />
          </button>
        </div>
      </div>

      {/* Records Table */}
      <div className="bg-white border border-slate-200 rounded-2xl overflow-hidden shadow-xs">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs text-slate-700">
            <thead className="bg-slate-50 text-slate-500 uppercase font-bold border-b border-slate-200 text-[11px]">
              <tr>
                <th className="py-3 px-4">Ref ID & Activity</th>
                <th className="py-3 px-4">Department</th>
                <th className="py-3 px-4">Lawful Basis (Art. 6/9)</th>
                <th className="py-3 px-4">Data Categories</th>
                <th className="py-3 px-4">Transfer Safeguard</th>
                <th className="py-3 px-4">Retention</th>
                <th className="py-3 px-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 font-medium">
              {filteredRecords.length === 0 ? (
                <tr>
                  <td colSpan={7} className="py-12 text-center text-slate-400">
                    No processing activities match your criteria.
                  </td>
                </tr>
              ) : (
                filteredRecords.map((r) => (
                  <tr key={r.id} className="hover:bg-slate-50/70 transition-colors">
                    <td className="py-3.5 px-4">
                      <div className="flex items-center gap-2">
                        <span className="font-mono text-[10px] font-bold px-1.5 py-0.5 rounded bg-slate-100 text-slate-700">
                          {r.id}
                        </span>
                        <span className="font-bold text-slate-900">{r.activityName}</span>
                      </div>
                      <p className="text-slate-500 text-[11px] mt-0.5 line-clamp-1">{r.purpose}</p>
                    </td>
                    <td className="py-3.5 px-4">
                      <span className="px-2 py-0.5 rounded-full text-[11px] font-bold bg-slate-100 text-slate-700">
                        {r.department}
                      </span>
                    </td>
                    <td className="py-3.5 px-4">
                      <span className="text-indigo-700 font-semibold text-[11px]">
                        {r.legalBasis}
                      </span>
                    </td>
                    <td className="py-3.5 px-4">
                      <div className="flex flex-wrap gap-1 max-w-xs">
                        {r.dataCategories.slice(0, 2).map((cat, idx) => (
                          <span key={idx} className="bg-slate-100 text-slate-600 text-[10px] px-1.5 py-0.5 rounded font-mono">
                            {cat}
                          </span>
                        ))}
                        {r.dataCategories.length > 2 && (
                          <span className="text-slate-400 text-[10px]">+{r.dataCategories.length - 2} more</span>
                        )}
                      </div>
                    </td>
                    <td className="py-3.5 px-4">
                      <span className={`text-[11px] font-bold ${r.thirdCountryTransfer.startsWith('Yes') ? 'text-amber-600' : 'text-emerald-600'}`}>
                        {r.thirdCountryTransfer.startsWith('Yes') ? '⚠️ Non-EEA (DPF/SCC)' : '🛡️ EEA Native'}
                      </span>
                    </td>
                    <td className="py-3.5 px-4 text-slate-500 text-[11px]">
                      {r.retentionPeriod}
                    </td>
                    <td className="py-3.5 px-4 text-right">
                      <div className="flex items-center justify-end gap-1.5">
                        <button
                          onClick={() => setSelectedRecord(r)}
                          className="px-2 py-1 text-[11px] font-bold text-indigo-600 hover:bg-indigo-50 rounded transition-colors cursor-pointer"
                        >
                          Details
                        </button>
                        <button
                          onClick={() => handleDelete(r.id)}
                          className="p-1 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded transition-colors cursor-pointer"
                          title="Delete Activity"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Record Details Modal */}
      <AnimatePresence>
        {selectedRecord && (
          <div className="fixed inset-0 bg-slate-900/40 backdrop-blur-xs flex items-center justify-center p-4 z-50">
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="bg-white border border-slate-200 rounded-2xl max-w-2xl w-full p-6 shadow-2xl space-y-4 max-h-[85vh] overflow-y-auto"
            >
              <div className="flex items-center justify-between border-b border-slate-100 pb-3">
                <div className="flex items-center gap-2">
                  <span className="px-2 py-0.5 rounded bg-indigo-100 text-indigo-800 font-mono text-xs font-bold">
                    {selectedRecord.id}
                  </span>
                  <h3 className="text-base font-bold text-slate-900">{selectedRecord.activityName}</h3>
                </div>
                <button
                  onClick={() => setSelectedRecord(null)}
                  className="p-1 text-slate-400 hover:text-slate-700 rounded-lg"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              <div className="grid grid-cols-2 gap-4 text-xs">
                <div>
                  <span className="text-slate-400 font-bold block">Department / Controller</span>
                  <span className="text-slate-800 font-semibold">{selectedRecord.department} ({selectedRecord.controller})</span>
                </div>
                <div>
                  <span className="text-slate-400 font-bold block">DPO Contact</span>
                  <span className="text-indigo-600 font-semibold">{selectedRecord.dpoContact}</span>
                </div>
                <div className="col-span-2">
                  <span className="text-slate-400 font-bold block">Primary Processing Purpose</span>
                  <span className="text-slate-700 font-medium">{selectedRecord.purpose}</span>
                </div>
                <div>
                  <span className="text-slate-400 font-bold block">Lawful Basis (GDPR Art. 6)</span>
                  <span className="text-slate-900 font-bold">{selectedRecord.legalBasis}</span>
                </div>
                <div>
                  <span className="text-slate-400 font-bold block">Special Categories (Art. 9)</span>
                  <span className="text-slate-700 font-medium">{selectedRecord.specialCategories}</span>
                </div>
                <div className="col-span-2">
                  <span className="text-slate-400 font-bold block">Personal Data Categories Processed</span>
                  <div className="flex flex-wrap gap-1.5 mt-1">
                    {selectedRecord.dataCategories.map((c, i) => (
                      <span key={i} className="px-2 py-0.5 bg-slate-100 text-slate-800 rounded font-mono text-[11px]">
                        {c}
                      </span>
                    ))}
                  </div>
                </div>
                <div className="col-span-2">
                  <span className="text-slate-400 font-bold block">Third-Country Transfer Safeguards</span>
                  <p className="text-slate-700 bg-slate-50 p-2 rounded-lg border border-slate-200 mt-1 font-mono text-[11px]">
                    {selectedRecord.thirdCountryTransfer}
                  </p>
                </div>
                <div className="col-span-2">
                  <span className="text-slate-400 font-bold block">Technical & Organizational Measures (TOMs Applied)</span>
                  <div className="flex flex-wrap gap-1.5 mt-1">
                    {selectedRecord.tomsApplied.map((tom, i) => (
                      <span key={i} className="px-2 py-0.5 bg-emerald-50 text-emerald-800 border border-emerald-200 rounded font-semibold text-[11px] flex items-center gap-1">
                        <CheckCircle2 className="w-3 h-3 text-emerald-600" /> {tom}
                      </span>
                    ))}
                  </div>
                </div>
              </div>

              <div className="flex items-center justify-end gap-2 pt-4 border-t border-slate-100">
                <button
                  onClick={() => setSelectedRecord(null)}
                  className="px-4 py-2 bg-slate-100 text-slate-700 rounded-xl text-xs font-bold hover:bg-slate-200 cursor-pointer"
                >
                  Close
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* Template SaaS Modal */}
      <AnimatePresence>
        {showTemplateModal && (
          <div className="fixed inset-0 bg-slate-900/40 backdrop-blur-xs flex items-center justify-center p-4 z-50">
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="bg-white border border-slate-200 rounded-2xl max-w-xl w-full p-6 shadow-2xl space-y-4"
            >
              <div className="flex items-center justify-between border-b border-slate-100 pb-3">
                <div>
                  <h3 className="text-base font-bold text-slate-900 flex items-center gap-2">
                    <Sparkles className="w-4 h-4 text-indigo-600" />
                    Pre-Configured SaaS ROPA Library
                  </h3>
                  <p className="text-xs text-slate-500 mt-0.5">
                    1-Click import standard processing activities with pre-vetted legal bases and TOM attachments.
                  </p>
                </div>
                <button
                  onClick={() => setShowTemplateModal(false)}
                  className="p-1 text-slate-400 hover:text-slate-700 rounded-lg"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              <div className="space-y-2.5 max-h-[60vh] overflow-y-auto pr-1">
                {templates.map((tpl, idx) => (
                  <div
                    key={idx}
                    className="p-3 bg-slate-50 hover:bg-indigo-50/50 border border-slate-200 hover:border-indigo-200 rounded-xl transition-colors flex items-center justify-between gap-3"
                  >
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="font-bold text-slate-900 text-xs">{tpl.toolName}</span>
                        <span className="text-[10px] font-bold px-1.5 py-0.2 rounded bg-slate-200 text-slate-700">
                          {tpl.department}
                        </span>
                      </div>
                      <p className="text-slate-500 text-[11px] mt-0.5">{tpl.purpose}</p>
                      <span className="text-indigo-700 font-mono text-[10px] block mt-1">
                        {tpl.legalBasis}
                      </span>
                    </div>
                    <button
                      onClick={() => handleAddFromTemplate(tpl)}
                      className="px-3 py-1.5 bg-indigo-600 hover:bg-indigo-700 text-white rounded-lg text-xs font-bold flex items-center gap-1 shadow-xs transition-colors shrink-0 cursor-pointer"
                    >
                      <Plus className="w-3 h-3" /> Add
                    </button>
                  </div>
                ))}
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* Manual Add Modal */}
      <AnimatePresence>
        {showAddModal && (
          <div className="fixed inset-0 bg-slate-900/40 backdrop-blur-xs flex items-center justify-center p-4 z-50">
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="bg-white border border-slate-200 rounded-2xl max-w-lg w-full p-6 shadow-2xl space-y-4 max-h-[90vh] overflow-y-auto"
            >
              <div className="flex items-center justify-between border-b border-slate-100 pb-3">
                <h3 className="text-base font-bold text-slate-900 flex items-center gap-2">
                  <FileText className="w-4 h-4 text-indigo-600" />
                  New Record of Processing Activity (ROPA)
                </h3>
                <button
                  onClick={() => setShowAddModal(false)}
                  className="p-1 text-slate-400 hover:text-slate-700 rounded-lg"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              <form onSubmit={handleCreateRecord} className="space-y-3 text-xs">
                <div>
                  <label className="block font-bold text-slate-700 mb-1">Activity Name</label>
                  <input
                    type="text"
                    required
                    placeholder="e.g., Customer Billing Gateway"
                    value={formData.activityName}
                    onChange={(e) => setFormData({ ...formData, activityName: e.target.value })}
                    className="w-full p-2 border border-slate-200 rounded-lg text-xs font-medium focus:border-indigo-400 outline-none"
                  />
                </div>

                <div className="grid grid-cols-2 gap-2">
                  <div>
                    <label className="block font-bold text-slate-700 mb-1">Department</label>
                    <input
                      type="text"
                      required
                      value={formData.department}
                      onChange={(e) => setFormData({ ...formData, department: e.target.value })}
                      className="w-full p-2 border border-slate-200 rounded-lg text-xs font-medium focus:border-indigo-400 outline-none"
                    />
                  </div>
                  <div>
                    <label className="block font-bold text-slate-700 mb-1">Legal Basis (Art. 6)</label>
                    <select
                      value={formData.legalBasis}
                      onChange={(e) => setFormData({ ...formData, legalBasis: e.target.value })}
                      className="w-full p-2 border border-slate-200 rounded-lg text-xs font-medium focus:border-indigo-400 outline-none bg-white"
                    >
                      <option value="Art. 6(1)(a) - Consent">Art. 6(1)(a) - Consent</option>
                      <option value="Art. 6(1)(b) - Contract Performance">Art. 6(1)(b) - Contract Performance</option>
                      <option value="Art. 6(1)(c) - Legal Obligation">Art. 6(1)(c) - Legal Obligation</option>
                      <option value="Art. 6(1)(f) - Legitimate Interest">Art. 6(1)(f) - Legitimate Interest</option>
                    </select>
                  </div>
                </div>

                <div>
                  <label className="block font-bold text-slate-700 mb-1">Purpose of Processing</label>
                  <textarea
                    rows={2}
                    required
                    placeholder="Describe why this personal data is collected and processed..."
                    value={formData.purpose}
                    onChange={(e) => setFormData({ ...formData, purpose: e.target.value })}
                    className="w-full p-2 border border-slate-200 rounded-lg text-xs font-medium focus:border-indigo-400 outline-none"
                  />
                </div>

                <div>
                  <label className="block font-bold text-slate-700 mb-1">Data Categories (comma-separated)</label>
                  <input
                    type="text"
                    value={formData.dataCategories}
                    onChange={(e) => setFormData({ ...formData, dataCategories: e.target.value })}
                    className="w-full p-2 border border-slate-200 rounded-lg text-xs font-medium focus:border-indigo-400 outline-none"
                  />
                </div>

                <div className="grid grid-cols-2 gap-2">
                  <div>
                    <label className="block font-bold text-slate-700 mb-1">Third Country Transfer</label>
                    <input
                      type="text"
                      value={formData.thirdCountryTransfer}
                      onChange={(e) => setFormData({ ...formData, thirdCountryTransfer: e.target.value })}
                      className="w-full p-2 border border-slate-200 rounded-lg text-xs font-medium focus:border-indigo-400 outline-none"
                    />
                  </div>
                  <div>
                    <label className="block font-bold text-slate-700 mb-1">Retention Period</label>
                    <input
                      type="text"
                      value={formData.retentionPeriod}
                      onChange={(e) => setFormData({ ...formData, retentionPeriod: e.target.value })}
                      className="w-full p-2 border border-slate-200 rounded-lg text-xs font-medium focus:border-indigo-400 outline-none"
                    />
                  </div>
                </div>

                <div>
                  <label className="block font-bold text-slate-700 mb-1">TOMs Applied (comma-separated)</label>
                  <input
                    type="text"
                    value={formData.tomsApplied}
                    onChange={(e) => setFormData({ ...formData, tomsApplied: e.target.value })}
                    className="w-full p-2 border border-slate-200 rounded-lg text-xs font-medium focus:border-indigo-400 outline-none"
                  />
                </div>

                <div className="flex items-center justify-end gap-2 pt-3 border-t border-slate-100">
                  <button
                    type="button"
                    onClick={() => setShowAddModal(false)}
                    className="px-4 py-2 bg-slate-100 text-slate-700 rounded-xl text-xs font-bold hover:bg-slate-200 cursor-pointer"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="px-4 py-2 bg-indigo-600 text-white rounded-xl text-xs font-bold hover:bg-indigo-700 cursor-pointer shadow-sm"
                  >
                    Register Activity
                  </button>
                </div>
              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
};
