import React, { useState, useEffect } from 'react';
import { 
  Building2, 
  Search, 
  Filter, 
  ShieldCheck, 
  AlertTriangle, 
  XCircle, 
  CheckCircle2, 
  ExternalLink, 
  FileText, 
  Scale, 
  RefreshCw,
  Sliders,
  ChevronRight,
  Sparkles,
  Plus,
  Edit2,
  Trash2,
  X
} from 'lucide-react';
import { useNotification } from '../context/NotificationContext';

export interface CompanyEntity {
  id: string;
  name: string;
  lei: string;
  jurisdiction: string;
  industry: string;
  complianceScore: number;
  riskTier: 'LOW' | 'MEDIUM' | 'HIGH' | 'CRITICAL';
  status: 'Compliant' | 'Investigation Active' | 'Pending Audit' | 'Notice Issued';
  lastAudit: string;
  dataResidency: string;
}

const defaultEntities: CompanyEntity[] = [
  {
    id: 'ENT-901',
    name: 'AeroNordic Logistics SE',
    lei: '5493006MHB84DD0ZWV18',
    jurisdiction: 'Germany (BfDI)',
    industry: 'Logistics & Supply Chain',
    complianceScore: 94.2,
    riskTier: 'LOW',
    status: 'Compliant',
    lastAudit: '2026-08-28',
    dataResidency: 'Frankfurt Enclave (AWS EU)'
  },
  {
    id: 'ENT-902',
    name: 'Helios MedTech Labs GmbH',
    lei: '9845007YTR99LL12AQ34',
    jurisdiction: 'France (CNIL)',
    industry: 'Healthcare & Biotech',
    complianceScore: 78.4,
    riskTier: 'HIGH',
    status: 'Investigation Active',
    lastAudit: '2026-09-01',
    dataResidency: 'Paris Sovereign Cloud (OVH)'
  },
  {
    id: 'ENT-903',
    name: 'EuroFintech Settlement Bank N.V.',
    lei: '7245009QWE44ZZ56BC78',
    jurisdiction: 'Netherlands (AP)',
    industry: 'Financial Services',
    complianceScore: 89.6,
    riskTier: 'MEDIUM',
    status: 'Pending Audit',
    lastAudit: '2026-08-15',
    dataResidency: 'Amsterdam Equinix Sovereign'
  },
  {
    id: 'ENT-904',
    name: 'VoxelAI Cognitive Robotics Oy',
    lei: '2138008UIO11XX90DE12',
    jurisdiction: 'Finland (Tietosuoja)',
    industry: 'High-Risk AI Systems',
    complianceScore: 68.9,
    riskTier: 'CRITICAL',
    status: 'Notice Issued',
    lastAudit: '2026-09-02',
    dataResidency: 'Helsinki Nordic Vault'
  },
  {
    id: 'ENT-905',
    name: 'Balkan Telecom Direct d.o.o.',
    lei: '8945004PLK33JJ67GH90',
    jurisdiction: 'Austria (DSB)',
    industry: 'Telecommunications',
    complianceScore: 91.5,
    riskTier: 'LOW',
    status: 'Compliant',
    lastAudit: '2026-08-30',
    dataResidency: 'Vienna Interxion Core'
  }
];

export interface CompaniesListProps {
  selectedCountry?: string;
  role?: string;
  onSelectEntity?: (entity: CompanyEntity) => void;
}

export const CompaniesList: React.FC<CompaniesListProps> = ({
  selectedCountry,
  role,
  onSelectEntity
}) => {
  const { showToast } = useNotification();
  const [entities, setEntities] = useState<CompanyEntity[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  const [search, setSearch] = useState('');
  const [riskFilter, setRiskFilter] = useState<string>('ALL');
  const [selectedEntity, setSelectedEntity] = useState<CompanyEntity | null>(null);

  // Modal forms
  const [showAddModal, setShowAddModal] = useState(false);
  const [editingEntity, setEditingEntity] = useState<CompanyEntity | null>(null);

  // Form states
  const [formName, setFormName] = useState('');
  const [formLei, setFormLei] = useState('');
  const [formJurisdiction, setFormJurisdiction] = useState('Germany (BfDI)');
  const [formIndustry, setFormIndustry] = useState('High-Risk AI Systems');
  const [formComplianceScore, setFormComplianceScore] = useState<number>(85);
  const [formRiskTier, setFormRiskTier] = useState<CompanyEntity['riskTier']>('MEDIUM');
  const [formStatus, setFormStatus] = useState<CompanyEntity['status']>('Compliant');
  const [formLastAudit, setFormLastAudit] = useState('');
  const [formDataResidency, setFormDataResidency] = useState('');

  const fetchEntities = async () => {
    try {
      setLoading(true);
      setError(null);
      const res = await fetch('/api/v1/admin/supervised-companies', {
        headers: {
          'x-user-role': 'ADMIN'
        }
      });
      const data = await res.json();
      if (data.success) {
        setEntities(data.companies || []);
      } else {
        setError(data.error || 'Failed to fetch supervised companies.');
      }
    } catch (err: any) {
      setError(err?.message || 'Error connecting to sovereign compliance database.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchEntities();
  }, []);

  const resetForm = () => {
    setFormName('');
    setFormLei('LEI-' + Math.random().toString(36).substring(2, 12).toUpperCase());
    setFormJurisdiction('Germany (BfDI)');
    setFormIndustry('High-Risk AI Systems');
    setFormComplianceScore(85);
    setFormRiskTier('MEDIUM');
    setFormStatus('Compliant');
    setFormLastAudit(new Date().toISOString().split('T')[0]);
    setFormDataResidency('Frankfurt Enclave (AWS EU)');
  };

  const handleOpenAddModal = () => {
    resetForm();
    setShowAddModal(true);
  };

  const handleAddEntity = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formName.trim() || !formLei.trim() || !formJurisdiction.trim()) {
      showToast('Please fill in all mandatory fields.', 'warning');
      return;
    }

    try {
      const payload = {
        name: formName,
        lei: formLei,
        jurisdiction: formJurisdiction,
        industry: formIndustry,
        complianceScore: Number(formComplianceScore) || 0,
        riskTier: formRiskTier,
        status: formStatus,
        lastAudit: formLastAudit || new Date().toISOString().split('T')[0],
        dataResidency: formDataResidency || 'Frankfurt Enclave (AWS EU)'
      };

      const res = await fetch('/api/v1/admin/supervised-companies', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'x-user-role': 'ADMIN'
        },
        body: JSON.stringify(payload)
      });

      const data = await res.json();
      if (data.success) {
        setEntities(prev => [data.company, ...prev]);
        setShowAddModal(false);
      } else {
        showToast(data.error || 'Failed to register entity.', 'error');
      }
    } catch (err: any) {
      showToast(err?.message || 'Network error.', 'error');
    }
  };

  const handleOpenEditModal = (e: React.MouseEvent, ent: CompanyEntity) => {
    e.stopPropagation();
    setEditingEntity(ent);
    setFormName(ent.name);
    setFormLei(ent.lei);
    setFormJurisdiction(ent.jurisdiction);
    setFormIndustry(ent.industry);
    setFormComplianceScore(ent.complianceScore);
    setFormRiskTier(ent.riskTier);
    setFormStatus(ent.status);
    setFormLastAudit(ent.lastAudit);
    setFormDataResidency(ent.dataResidency);
  };

  const handleUpdateEntity = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingEntity) return;

    try {
      const payload = {
        name: formName,
        lei: formLei,
        jurisdiction: formJurisdiction,
        industry: formIndustry,
        complianceScore: Number(formComplianceScore) || 0,
        riskTier: formRiskTier,
        status: formStatus,
        lastAudit: formLastAudit,
        dataResidency: formDataResidency
      };

      const res = await fetch(`/api/v1/admin/supervised-companies/${editingEntity.id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'x-user-role': 'ADMIN'
        },
        body: JSON.stringify(payload)
      });

      const data = await res.json();
      if (data.success) {
        setEntities(prev => prev.map(ent => ent.id === editingEntity.id ? data.company : ent));
        if (selectedEntity?.id === editingEntity.id) {
          setSelectedEntity(data.company);
        }
        setEditingEntity(null);
      } else {
        showToast(data.error || 'Failed to update entity.', 'error');
      }
    } catch (err: any) {
      showToast(err?.message || 'Network error.', 'error');
    }
  };

  const handleDeleteEntity = async (e: React.MouseEvent, id: string, name: string) => {
    e.stopPropagation();
    if (confirm(`Are you sure you want to remove the entity profile: ${name}?`)) {
      try {
        const res = await fetch(`/api/v1/admin/supervised-companies/${id}`, {
          method: 'DELETE',
          headers: {
            'x-user-role': 'ADMIN'
          }
        });
        const data = await res.json();
        if (data.success) {
          setEntities(prev => prev.filter(ent => ent.id !== id));
          if (selectedEntity?.id === id) {
            setSelectedEntity(null);
          }
        } else {
          showToast(data.error || 'Failed to delete entity.', 'error');
        }
      } catch (err: any) {
        showToast(err?.message || 'Network error.', 'error');
      }
    }
  };

  const filtered = entities.filter(e => {
    const matchesSearch = e.name.toLowerCase().includes(search.toLowerCase()) || 
                          e.lei.toLowerCase().includes(search.toLowerCase()) || 
                          e.industry.toLowerCase().includes(search.toLowerCase());
    const matchesRisk = riskFilter === 'ALL' || e.riskTier === riskFilter;
    return matchesSearch && matchesRisk;
  });

  return (
    <div className="p-5 sm:p-7 rounded-3xl bg-slate-900 border border-slate-800 text-slate-100 shadow-xl space-y-5 text-left">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="p-1.5 bg-blue-950/80 border border-blue-700/60 rounded-lg text-blue-400 animate-pulse">
              <Building2 className="w-4 h-4" />
            </span>
            <span className="text-xs font-mono font-bold text-blue-400 uppercase tracking-wider">EU SUPERVISED ENTITY DIRECTORY</span>
          </div>
          <h3 className="text-lg sm:text-xl font-bold text-white">Supervised Companies &amp; Legal Entities</h3>
          <p className="text-xs text-slate-400">Real-time compliance monitoring, LEI verification, and sovereign residency tracking.</p>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={handleOpenAddModal}
            className="px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl text-xs font-bold flex items-center gap-1.5 shadow-lg shadow-indigo-500/10 transition-all cursor-pointer"
          >
            <Plus className="w-3.5 h-3.5" />
            Register Legal Entity
          </button>
          <span className="px-3 py-2 bg-slate-950 border border-slate-800 rounded-xl text-xs font-mono text-slate-300">
            Total Entities: <strong className="text-white">{entities.length}</strong>
          </span>
        </div>
      </div>

      {/* Filter & Search Bar */}
      <div className="flex flex-col sm:flex-row items-center gap-3">
        <div className="relative flex-1 w-full">
          <Search className="w-4 h-4 text-slate-500 absolute left-3.5 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            placeholder="Search by entity name, LEI identifier, industry..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full pl-10 pr-4 py-2.5 bg-slate-950 border border-slate-800 rounded-xl text-xs text-slate-200 focus:outline-none focus:border-indigo-500 placeholder-slate-500"
          />
        </div>

        <div className="flex items-center gap-1.5 p-1 bg-slate-950 border border-slate-800 rounded-xl w-full sm:w-auto">
          {['ALL', 'LOW', 'MEDIUM', 'HIGH', 'CRITICAL'].map((r) => (
            <button
              key={r}
              type="button"
              onClick={() => setRiskFilter(r)}
              className={`px-2.5 py-1 text-[11px] font-semibold rounded-lg transition-all cursor-pointer ${
                riskFilter === r ? 'bg-indigo-600 text-white shadow-xs' : 'text-slate-400 hover:text-white'
              }`}
            >
              {r}
            </button>
          ))}
        </div>
      </div>

      {/* Table */}
      <div className="overflow-x-auto rounded-2xl border border-slate-800">
        <table className="w-full text-left text-xs text-slate-300">
          <thead className="bg-slate-950/80 text-slate-400 uppercase font-mono text-[10px] border-b border-slate-800">
            <tr>
              <th className="px-4 py-3">Legal Entity &amp; LEI</th>
              <th className="px-4 py-3">Industry / Sector</th>
              <th className="px-4 py-3">Lead DPA</th>
              <th className="px-4 py-3">Compliance Score</th>
              <th className="px-4 py-3">Risk Tier</th>
              <th className="px-4 py-3">Status</th>
              <th className="px-4 py-3 text-right">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-800/60 bg-slate-900/50">
            {filtered.map((entity) => (
              <tr 
                key={entity.id} 
                className={`hover:bg-slate-800/40 transition-colors cursor-pointer ${selectedEntity?.id === entity.id ? 'bg-slate-800/20' : ''}`}
                onClick={() => {
                  setSelectedEntity(entity);
                  if (onSelectEntity) onSelectEntity(entity);
                }}
              >
                <td className="px-4 py-3.5">
                  <div className="font-bold text-white flex items-center gap-1.5">
                    {entity.name}
                  </div>
                  <div className="text-[11px] text-slate-400 font-mono">LEI: {entity.lei}</div>
                </td>
                <td className="px-4 py-3.5 text-slate-300">{entity.industry}</td>
                <td className="px-4 py-3.5 text-slate-300">{entity.jurisdiction}</td>
                <td className="px-4 py-3.5">
                  <div className="flex items-center gap-2">
                    <span className="font-bold font-mono text-white">{entity.complianceScore}%</span>
                    <div className="w-16 h-1.5 bg-slate-800 rounded-full overflow-hidden">
                      <div 
                        className={`h-full ${entity.complianceScore >= 90 ? 'bg-emerald-500' : entity.complianceScore >= 75 ? 'bg-amber-500' : 'bg-red-500'}`}
                        style={{ width: `${entity.complianceScore}%` }}
                      />
                    </div>
                  </div>
                </td>
                <td className="px-4 py-3.5">
                  <span className={`px-2 py-0.5 rounded text-[10px] font-bold font-mono ${
                    entity.riskTier === 'LOW' ? 'bg-emerald-950 text-emerald-300 border border-emerald-800' :
                    entity.riskTier === 'MEDIUM' ? 'bg-blue-950 text-blue-300 border border-blue-800' :
                    entity.riskTier === 'HIGH' ? 'bg-amber-950 text-amber-300 border border-amber-800' :
                    'bg-red-950 text-red-300 border border-red-800'
                  }`}>
                    {entity.riskTier}
                  </span>
                </td>
                <td className="px-4 py-3.5">
                  <span className="text-slate-200 font-medium">{entity.status}</span>
                </td>
                <td className="px-4 py-3.5 text-right">
                  <div className="flex items-center justify-end gap-1.5" onClick={e => e.stopPropagation()}>
                    <button 
                      type="button"
                      onClick={(e) => handleOpenEditModal(e, entity)}
                      className="p-1.5 hover:bg-slate-800 text-slate-400 hover:text-white rounded-lg border border-slate-800 transition-colors"
                      title="Edit Profile"
                    >
                      <Edit2 className="w-3.5 h-3.5" />
                    </button>
                    <button 
                      type="button"
                      onClick={(e) => handleDeleteEntity(e, entity.id, entity.name)}
                      className="p-1.5 hover:bg-red-950/40 text-slate-400 hover:text-red-400 rounded-lg border border-slate-800 transition-colors"
                      title="Delete Profile"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                    <button 
                      type="button"
                      onClick={(e) => {
                        e.stopPropagation();
                        showToast(`Opening Deep Audit Ledger for ${entity.name} (${entity.id})`, 'info');
                      }}
                      className="p-1.5 bg-slate-800 hover:bg-slate-700 text-slate-200 hover:text-white rounded-lg border border-slate-700 transition-colors"
                    >
                      <ChevronRight className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {selectedEntity && (
        <div className="p-4 rounded-2xl bg-slate-950 border border-indigo-900/60 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div>
            <div className="text-xs font-bold text-indigo-400 uppercase tracking-wider">Active Entity Focus</div>
            <div className="text-sm font-bold text-white">{selectedEntity.name} ({selectedEntity.lei})</div>
            <div className="text-xs text-slate-400">Residency: {selectedEntity.dataResidency} &bull; Last Audit: {selectedEntity.lastAudit}</div>
          </div>
          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={() => showToast(`Issuing Formal Injunction / Request for Information to ${selectedEntity.name}`, 'info')}
              className="px-3 py-1.5 bg-amber-600 hover:bg-amber-700 text-white rounded-xl text-xs font-bold transition-colors cursor-pointer"
            >
              Issue Inquiry Notice
            </button>
            <button
              type="button"
              onClick={() => showToast(`Simulating GDPR Art. 83 Fine for ${selectedEntity.name}`, 'info')}
              className="px-3 py-1.5 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl text-xs font-bold transition-colors cursor-pointer"
            >
              Calculate Penalty Exposure
            </button>
          </div>
        </div>
      )}

      {/* ADD MODAL */}
      {showAddModal && (
        <div className="fixed inset-0 bg-slate-950/80 backdrop-blur-xs flex items-center justify-center z-[100] p-4 text-slate-100">
          <div className="bg-slate-900 border border-slate-800 rounded-3xl p-6 w-full max-w-md shadow-2xl space-y-4">
            <div className="flex justify-between items-center border-b border-slate-800 pb-3">
              <h3 className="text-md font-bold flex items-center gap-2 text-white">
                <Building2 className="w-5 h-5 text-indigo-400" />
                Register Legal Entity
              </h3>
              <button onClick={() => setShowAddModal(false)} className="text-slate-400 hover:text-white transition-colors cursor-pointer">
                <X className="w-5 h-5" />
              </button>
            </div>
            <form onSubmit={handleAddEntity} className="space-y-4">
              <div>
                <label className="block text-[10px] font-black text-slate-400 uppercase tracking-wider mb-1">Company Name</label>
                <input 
                  type="text" 
                  value={formName} 
                  onChange={e => setFormName(e.target.value)} 
                  placeholder="e.g. AeroNordic Logistics SE" 
                  className="w-full px-3 py-2 bg-slate-950 border border-slate-800 rounded-xl text-xs text-white focus:outline-none"
                  required 
                />
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-[10px] font-black text-slate-400 uppercase tracking-wider mb-1">LEI Code</label>
                  <input 
                    type="text" 
                    value={formLei} 
                    onChange={e => setFormLei(e.target.value)} 
                    className="w-full px-3 py-2 bg-slate-950 border border-slate-800 rounded-xl text-xs text-white focus:outline-none"
                    required 
                  />
                </div>
                <div>
                  <label className="block text-[10px] font-black text-slate-400 uppercase tracking-wider mb-1">Risk Tier</label>
                  <select 
                    value={formRiskTier} 
                    onChange={e => setFormRiskTier(e.target.value as any)} 
                    className="w-full px-3 py-2 bg-slate-950 border border-slate-800 rounded-xl text-xs text-white focus:outline-none"
                  >
                    <option value="LOW">LOW</option>
                    <option value="MEDIUM">MEDIUM</option>
                    <option value="HIGH">HIGH</option>
                    <option value="CRITICAL">CRITICAL</option>
                  </select>
                </div>
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-[10px] font-black text-slate-400 uppercase tracking-wider mb-1">Lead DPA</label>
                  <input 
                    type="text" 
                    value={formJurisdiction} 
                    onChange={e => setFormJurisdiction(e.target.value)} 
                    className="w-full px-3 py-2 bg-slate-950 border border-slate-800 rounded-xl text-xs text-white focus:outline-none"
                    required 
                  />
                </div>
                <div>
                  <label className="block text-[10px] font-black text-slate-400 uppercase tracking-wider mb-1">Industry Sector</label>
                  <input 
                    type="text" 
                    value={formIndustry} 
                    onChange={e => setFormIndustry(e.target.value)} 
                    className="w-full px-3 py-2 bg-slate-950 border border-slate-800 rounded-xl text-xs text-white focus:outline-none"
                    required 
                  />
                </div>
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-[10px] font-black text-slate-400 uppercase tracking-wider mb-1">Compliance Score (%)</label>
                  <input 
                    type="number" 
                    value={formComplianceScore} 
                    onChange={e => setFormComplianceScore(Number(e.target.value))} 
                    className="w-full px-3 py-2 bg-slate-950 border border-slate-800 rounded-xl text-xs text-white focus:outline-none"
                    min="0" 
                    max="100" 
                  />
                </div>
                <div>
                  <label className="block text-[10px] font-black text-slate-400 uppercase tracking-wider mb-1">Status</label>
                  <select 
                    value={formStatus} 
                    onChange={e => setFormStatus(e.target.value as any)} 
                    className="w-full px-3 py-2 bg-slate-950 border border-slate-800 rounded-xl text-xs text-white focus:outline-none"
                  >
                    <option value="Compliant">Compliant</option>
                    <option value="Investigation Active">Investigation Active</option>
                    <option value="Pending Audit">Pending Audit</option>
                    <option value="Notice Issued">Notice Issued</option>
                  </select>
                </div>
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-[10px] font-black text-slate-400 uppercase tracking-wider mb-1">Last Audit</label>
                  <input 
                    type="date" 
                    value={formLastAudit} 
                    onChange={e => setFormLastAudit(e.target.value)} 
                    className="w-full px-3 py-2 bg-slate-950 border border-slate-800 rounded-xl text-xs text-white focus:outline-none" 
                  />
                </div>
                <div>
                  <label className="block text-[10px] font-black text-slate-400 uppercase tracking-wider mb-1">Data Residency Node</label>
                  <input 
                    type="text" 
                    value={formDataResidency} 
                    onChange={e => setFormDataResidency(e.target.value)} 
                    className="w-full px-3 py-2 bg-slate-950 border border-slate-800 rounded-xl text-xs text-white focus:outline-none" 
                  />
                </div>
              </div>
              <div className="flex justify-end gap-2 pt-3 border-t border-slate-800">
                <button 
                  type="button" 
                  onClick={() => setShowAddModal(false)}
                  className="px-4 py-2 bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white rounded-xl text-xs font-bold cursor-pointer"
                >
                  Cancel
                </button>
                <button 
                  type="submit" 
                  className="px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl text-xs font-bold cursor-pointer"
                >
                  Register Entity
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* EDIT MODAL */}
      {editingEntity && (
        <div className="fixed inset-0 bg-slate-950/80 backdrop-blur-xs flex items-center justify-center z-[100] p-4 text-slate-100">
          <div className="bg-slate-900 border border-slate-800 rounded-3xl p-6 w-full max-w-md shadow-2xl space-y-4">
            <div className="flex justify-between items-center border-b border-slate-800 pb-3">
              <h3 className="text-md font-bold flex items-center gap-2 text-white">
                <Edit2 className="w-4 h-4 text-indigo-400" />
                Modify Legal Entity: {editingEntity.name}
              </h3>
              <button onClick={() => setEditingEntity(null)} className="text-slate-400 hover:text-white transition-colors cursor-pointer">
                <X className="w-5 h-5" />
              </button>
            </div>
            <form onSubmit={handleUpdateEntity} className="space-y-4">
              <div>
                <label className="block text-[10px] font-black text-slate-400 uppercase tracking-wider mb-1">Company Name</label>
                <input 
                  type="text" 
                  value={formName} 
                  onChange={e => setFormName(e.target.value)} 
                  className="w-full px-3 py-2 bg-slate-950 border border-slate-800 rounded-xl text-xs text-white focus:outline-none"
                  required 
                />
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-[10px] font-black text-slate-400 uppercase tracking-wider mb-1">LEI Code</label>
                  <input 
                    type="text" 
                    value={formLei} 
                    onChange={e => setFormLei(e.target.value)} 
                    className="w-full px-3 py-2 bg-slate-950 border border-slate-800 rounded-xl text-xs text-white focus:outline-none"
                    required 
                  />
                </div>
                <div>
                  <label className="block text-[10px] font-black text-slate-400 uppercase tracking-wider mb-1">Risk Tier</label>
                  <select 
                    value={formRiskTier} 
                    onChange={e => setFormRiskTier(e.target.value as any)} 
                    className="w-full px-3 py-2 bg-slate-950 border border-slate-800 rounded-xl text-xs text-white focus:outline-none"
                  >
                    <option value="LOW">LOW</option>
                    <option value="MEDIUM">MEDIUM</option>
                    <option value="HIGH">HIGH</option>
                    <option value="CRITICAL">CRITICAL</option>
                  </select>
                </div>
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-[10px] font-black text-slate-400 uppercase tracking-wider mb-1">Lead DPA</label>
                  <input 
                    type="text" 
                    value={formJurisdiction} 
                    onChange={e => setFormJurisdiction(e.target.value)} 
                    className="w-full px-3 py-2 bg-slate-950 border border-slate-800 rounded-xl text-xs text-white focus:outline-none"
                    required 
                  />
                </div>
                <div>
                  <label className="block text-[10px] font-black text-slate-400 uppercase tracking-wider mb-1">Industry Sector</label>
                  <input 
                    type="text" 
                    value={formIndustry} 
                    onChange={e => setFormIndustry(e.target.value)} 
                    className="w-full px-3 py-2 bg-slate-950 border border-slate-800 rounded-xl text-xs text-white focus:outline-none"
                    required 
                  />
                </div>
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-[10px] font-black text-slate-400 uppercase tracking-wider mb-1">Compliance Score (%)</label>
                  <input 
                    type="number" 
                    value={formComplianceScore} 
                    onChange={e => setFormComplianceScore(Number(e.target.value))} 
                    className="w-full px-3 py-2 bg-slate-950 border border-slate-800 rounded-xl text-xs text-white focus:outline-none"
                    min="0" 
                    max="100" 
                  />
                </div>
                <div>
                  <label className="block text-[10px] font-black text-slate-400 uppercase tracking-wider mb-1">Status</label>
                  <select 
                    value={formStatus} 
                    onChange={e => setFormStatus(e.target.value as any)} 
                    className="w-full px-3 py-2 bg-slate-950 border border-slate-800 rounded-xl text-xs text-white focus:outline-none"
                  >
                    <option value="Compliant">Compliant</option>
                    <option value="Investigation Active">Investigation Active</option>
                    <option value="Pending Audit">Pending Audit</option>
                    <option value="Notice Issued">Notice Issued</option>
                  </select>
                </div>
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-[10px] font-black text-slate-400 uppercase tracking-wider mb-1">Last Audit</label>
                  <input 
                    type="date" 
                    value={formLastAudit} 
                    onChange={e => setFormLastAudit(e.target.value)} 
                    className="w-full px-3 py-2 bg-slate-950 border border-slate-800 rounded-xl text-xs text-white focus:outline-none" 
                  />
                </div>
                <div>
                  <label className="block text-[10px] font-black text-slate-400 uppercase tracking-wider mb-1">Data Residency Node</label>
                  <input 
                    type="text" 
                    value={formDataResidency} 
                    onChange={e => setFormDataResidency(e.target.value)} 
                    className="w-full px-3 py-2 bg-slate-950 border border-slate-800 rounded-xl text-xs text-white focus:outline-none" 
                  />
                </div>
              </div>
              <div className="flex justify-end gap-2 pt-3 border-t border-slate-800">
                <button 
                  type="button" 
                  onClick={() => setEditingEntity(null)}
                  className="px-4 py-2 bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white rounded-xl text-xs font-bold cursor-pointer"
                >
                  Cancel
                </button>
                <button 
                  type="submit" 
                  className="px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl text-xs font-bold cursor-pointer"
                >
                  Save Changes
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default CompaniesList;
