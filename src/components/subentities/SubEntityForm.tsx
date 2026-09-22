import React, { useState } from 'react';
import { SubEntity, CloudProviderConfig, DataNode } from './types';
import { 
  Plus, 
  Trash2, 
  Globe, 
  Server, 
  Cloud, 
  Save, 
  AlertCircle,
  X,
  CheckCircle2
} from 'lucide-react';

interface SubEntityFormProps {
  initialData?: SubEntity;
  onSave: (data: SubEntity) => void;
  onCancel: () => void;
}

export const SubEntityForm: React.FC<SubEntityFormProps> = ({ initialData, onSave, onCancel }) => {
  const [formData, setFormData] = useState<SubEntity>(initialData || {
    id: `ent_${Math.random().toString(36).substr(2, 9)}`,
    name: '',
    industry: 'Technology',
    complianceScore: 100,
    status: 'Active',
    infrastructure: {
      serverLocations: [],
      dataProcessingNodes: [],
      cloudProviders: [],
      updatedAt: new Date().toISOString()
    }
  });

  const [errors, setErrors] = useState<Record<string, string>>({});

  const validate = () => {
    const newErrors: Record<string, string> = {};
    if (!formData.name) newErrors.name = 'Entity name is required';
    if (formData.infrastructure.serverLocations.length === 0) {
      newErrors.locations = 'At least one server location is required';
    }
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSave = () => {
    if (validate()) {
      onSave({
        ...formData,
        infrastructure: {
          ...formData.infrastructure,
          updatedAt: new Date().toISOString()
        }
      });
    }
  };

  const addLocation = (loc: string) => {
    if (!loc) return;
    if (!formData.infrastructure.serverLocations.includes(loc)) {
      setFormData({
        ...formData,
        infrastructure: {
          ...formData.infrastructure,
          serverLocations: [...formData.infrastructure.serverLocations, loc]
        }
      });
    }
  };

  const removeLocation = (loc: string) => {
    setFormData({
      ...formData,
      infrastructure: {
        ...formData.infrastructure,
        serverLocations: formData.infrastructure.serverLocations.filter(l => l !== loc)
      }
    });
  };

  const addCloudProvider = () => {
    const newProvider: CloudProviderConfig = {
      id: Math.random().toString(36).substr(2, 9),
      provider: 'AWS',
      region: 'eu-west-1',
      configType: 'Shared',
      status: 'Healthy'
    };
    setFormData({
      ...formData,
      infrastructure: {
        ...formData.infrastructure,
        cloudProviders: [...formData.infrastructure.cloudProviders, newProvider]
      }
    });
  };

  const updateCloudProvider = (id: string, updates: Partial<CloudProviderConfig>) => {
    setFormData({
      ...formData,
      infrastructure: {
        ...formData.infrastructure,
        cloudProviders: formData.infrastructure.cloudProviders.map(p => 
          p.id === id ? { ...p, ...updates } : p
        )
      }
    });
  };

  const removeCloudProvider = (id: string) => {
    setFormData({
      ...formData,
      infrastructure: {
        ...formData.infrastructure,
        cloudProviders: formData.infrastructure.cloudProviders.filter(p => p.id !== id)
      }
    });
  };

  const addDataNode = () => {
    const newNode: DataNode = {
      id: Math.random().toString(36).substr(2, 9),
      name: 'New Node',
      location: 'Frankfurt',
      processingType: 'PII Scrubbing',
      recordCount: 0
    };
    setFormData({
      ...formData,
      infrastructure: {
        ...formData.infrastructure,
        dataProcessingNodes: [...formData.infrastructure.dataProcessingNodes, newNode]
      }
    });
  };

  const updateDataNode = (id: string, updates: Partial<DataNode>) => {
    setFormData({
      ...formData,
      infrastructure: {
        ...formData.infrastructure,
        dataProcessingNodes: formData.infrastructure.dataProcessingNodes.map(n => 
          n.id === id ? { ...n, ...updates } : n
        )
      }
    });
  };

  const removeDataNode = (id: string) => {
    setFormData({
      ...formData,
      infrastructure: {
        ...formData.infrastructure,
        dataProcessingNodes: formData.infrastructure.dataProcessingNodes.filter(n => n.id !== id)
      }
    });
  };

  return (
    <div className="bg-white rounded-3xl border border-slate-200 shadow-xl overflow-hidden text-left flex flex-col max-h-[90vh]">
      <div className="p-4 sm:p-5 lg:p-6 border-b border-slate-100 flex items-center justify-between bg-slate-50">
        <div>
          <h2 className="text-xl font-extrabold text-slate-900 tracking-tight flex items-center gap-2">
            {initialData ? 'Edit Sub-Entity' : 'Register New Sub-Entity'}
          </h2>
          <p className="text-xs text-slate-500 mt-1">Configure detailed digital infrastructure and compliance parameters.</p>
        </div>
        <button onClick={onCancel} className="p-2 hover:bg-slate-200 rounded-full transition-colors">
          <X className="w-5 h-5 text-slate-400" />
        </button>
      </div>

      <div className="flex-1 overflow-y-auto p-4 sm:p-5 lg:p-6 space-y-5 sm:space-y-8 custom-scrollbar">
        {/* Basic Info */}
        <section className="space-y-4">
          <h3 className="text-sm font-bold text-slate-800 border-b border-slate-100 pb-2 flex items-center gap-2">
            <Server className="w-4 h-4 text-indigo-500" /> Basic Information
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-1.5">
              <label className="text-xs font-bold text-slate-700">Entity Name</label>
              <input 
                type="text" 
                value={formData.name}
                onChange={(e) => setFormData({...formData, name: e.target.value})}
                className={`w-full px-4 py-2 border rounded-xl text-sm focus:ring-2 outline-none transition-all ${errors.name ? 'border-rose-500 bg-rose-50' : 'border-slate-200 focus:ring-indigo-500/20 focus:border-indigo-500'}`}
                placeholder="e.g. Acme Germany Operations"
              />
              {errors.name && <p className="text-[10px] text-rose-600 font-bold">{errors.name}</p>}
            </div>
            <div className="space-y-1.5">
              <label className="text-xs font-bold text-slate-700">Industry Sector</label>
              <select 
                value={formData.industry}
                onChange={(e) => setFormData({...formData, industry: e.target.value})}
                className="w-full px-4 py-2 border border-slate-200 rounded-xl text-sm focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 outline-none transition-all"
              >
                <option value="Technology">Technology</option>
                <option value="Finance">Finance</option>
                <option value="Healthcare">Healthcare</option>
                <option value="Logistics">Logistics</option>
                <option value="Retail">Retail</option>
              </select>
            </div>
          </div>
        </section>

        {/* Infrastructure - Server Locations */}
        <section className="space-y-4">
          <h3 className="text-sm font-bold text-slate-800 border-b border-slate-100 pb-2 flex items-center gap-2">
            <Globe className="w-4 h-4 text-emerald-500" /> Regional Footprint
          </h3>
          <div className="space-y-3">
            <label className="text-xs font-bold text-slate-700">Server Locations (City/Country)</label>
            <div className="flex flex-wrap gap-2">
              {formData.infrastructure.serverLocations.map(loc => (
                <span key={loc} className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-slate-100 text-slate-700 rounded-full text-xs font-bold border border-slate-200 group">
                  {loc}
                  <button onClick={() => removeLocation(loc)} className="text-slate-400 hover:text-rose-500">
                    <Trash2 className="w-3 h-3" />
                  </button>
                </span>
              ))}
              <div className="flex items-center gap-2">
                <input 
                  type="text" 
                  id="new-loc-input"
                  className="px-3 py-1.5 border border-slate-200 rounded-full text-xs focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 outline-none transition-all w-32"
                  placeholder="Add location..."
                  onKeyDown={(e) => {
                    if (e.key === 'Enter') {
                      addLocation((e.target as HTMLInputElement).value);
                      (e.target as HTMLInputElement).value = '';
                    }
                  }}
                />
                <button 
                  onClick={() => {
                    const input = document.getElementById('new-loc-input') as HTMLInputElement;
                    addLocation(input.value);
                    input.value = '';
                  }}
                  className="p-1.5 bg-indigo-50 text-indigo-600 rounded-full hover:bg-indigo-100 transition-colors"
                >
                  <Plus className="w-4 h-4" />
                </button>
              </div>
            </div>
            {errors.locations && <p className="text-[10px] text-rose-600 font-bold">{errors.locations}</p>}
          </div>
        </section>

        {/* Infrastructure - Cloud Providers */}
        <section className="space-y-4">
          <div className="flex items-center justify-between border-b border-slate-100 pb-2">
            <h3 className="text-sm font-bold text-slate-800 flex items-center gap-2">
              <Cloud className="w-4 h-4 text-sky-500" /> Cloud Ecosystem
            </h3>
            <button 
              onClick={addCloudProvider}
              className="text-[10px] font-black text-indigo-600 hover:bg-indigo-50 px-2 py-1 rounded transition-colors uppercase tracking-wider"
            >
              + Add Provider
            </button>
          </div>
          <div className="space-y-3">
            {formData.infrastructure.cloudProviders.map(p => (
              <div key={p.id} className="p-4 border border-slate-100 rounded-2xl bg-slate-50/50 grid grid-cols-1 md:grid-cols-4 gap-3 items-end group relative">
                <div className="space-y-1">
                  <label className="text-[10px] font-black text-slate-400 uppercase">Provider</label>
                  <select 
                    value={p.provider}
                    onChange={(e) => updateCloudProvider(p.id, { provider: e.target.value as any })}
                    className="w-full px-2 py-1.5 border border-slate-200 rounded-lg text-xs bg-white"
                  >
                    <option value="AWS">AWS</option>
                    <option value="Azure">Azure</option>
                    <option value="GCP">GCP</option>
                    <option value="On-Premise">On-Premise</option>
                  </select>
                </div>
                <div className="space-y-1">
                  <label className="text-[10px] font-black text-slate-400 uppercase">Region</label>
                  <input 
                    type="text" 
                    value={p.region}
                    onChange={(e) => updateCloudProvider(p.id, { region: e.target.value })}
                    className="w-full px-2 py-1.5 border border-slate-200 rounded-lg text-xs"
                    placeholder="eu-central-1"
                  />
                </div>
                <div className="space-y-1">
                  <label className="text-[10px] font-black text-slate-400 uppercase">Config</label>
                  <select 
                    value={p.configType}
                    onChange={(e) => updateCloudProvider(p.id, { configType: e.target.value as any })}
                    className="w-full px-2 py-1.5 border border-slate-200 rounded-lg text-xs bg-white"
                  >
                    <option value="Shared">Shared Instance</option>
                    <option value="Dedicated">Dedicated Host</option>
                    <option value="Enclave">Sovereign Enclave</option>
                  </select>
                </div>
                <div className="flex items-center gap-2">
                  <div className="flex-1 space-y-1">
                    <label className="text-[10px] font-black text-slate-400 uppercase">Status</label>
                    <select 
                      value={p.status}
                      onChange={(e) => updateCloudProvider(p.id, { status: e.target.value as any })}
                      className={`w-full px-2 py-1.5 border rounded-lg text-xs bg-white font-bold ${p.status === 'Healthy' ? 'text-emerald-600' : p.status === 'Warning' ? 'text-amber-600' : 'text-rose-600'}`}
                    >
                      <option value="Healthy">Healthy</option>
                      <option value="Warning">Warning</option>
                      <option value="Critical">Critical</option>
                    </select>
                  </div>
                  <button 
                    onClick={() => removeCloudProvider(p.id)}
                    className="p-2 text-slate-300 hover:text-rose-500 transition-colors"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>
            ))}
            {formData.infrastructure.cloudProviders.length === 0 && (
              <div className="text-center py-4 sm:py-6 border border-dashed border-slate-200 rounded-2xl">
                <p className="text-xs text-slate-400 font-medium italic">No cloud providers configured.</p>
              </div>
            )}
          </div>
        </section>

        {/* Infrastructure - Data Nodes */}
        <section className="space-y-4 pb-4">
          <div className="flex items-center justify-between border-b border-slate-100 pb-2">
            <h3 className="text-sm font-bold text-slate-800 flex items-center gap-2">
              <Plus className="w-4 h-4 text-purple-500" /> Processing Nodes
            </h3>
            <button 
              onClick={addDataNode}
              className="text-[10px] font-black text-indigo-600 hover:bg-indigo-50 px-2 py-1 rounded transition-colors uppercase tracking-wider"
            >
              + Add Node
            </button>
          </div>
          <div className="space-y-3">
            {formData.infrastructure.dataProcessingNodes.map(n => (
              <div key={n.id} className="p-4 border border-slate-100 rounded-2xl bg-white shadow-xs grid grid-cols-1 md:grid-cols-4 gap-3 items-end group relative">
                <div className="space-y-1">
                  <label className="text-[10px] font-black text-slate-400 uppercase">Node Name</label>
                  <input 
                    type="text" 
                    value={n.name}
                    onChange={(e) => updateDataNode(n.id, { name: e.target.value })}
                    className="w-full px-2 py-1.5 border border-slate-200 rounded-lg text-xs"
                    placeholder="Worker-01"
                  />
                </div>
                <div className="space-y-1">
                  <label className="text-[10px] font-black text-slate-400 uppercase">Location</label>
                  <input 
                    type="text" 
                    value={n.location}
                    onChange={(e) => updateDataNode(n.id, { location: e.target.value })}
                    className="w-full px-2 py-1.5 border border-slate-200 rounded-lg text-xs"
                    placeholder="Dublin"
                  />
                </div>
                <div className="space-y-1">
                  <label className="text-[10px] font-black text-slate-400 uppercase">Process Type</label>
                  <input 
                    type="text" 
                    value={n.processingType}
                    onChange={(e) => updateDataNode(n.id, { processingType: e.target.value })}
                    className="w-full px-2 py-1.5 border border-slate-200 rounded-lg text-xs"
                    placeholder="Anonymization"
                  />
                </div>
                <div className="flex items-center gap-2">
                  <div className="flex-1 space-y-1">
                    <label className="text-[10px] font-black text-slate-400 uppercase">Rec Volume</label>
                    <input 
                      type="number" 
                      value={n.recordCount}
                      onChange={(e) => updateDataNode(n.id, { recordCount: parseInt(e.target.value) || 0 })}
                      className="w-full px-2 py-1.5 border border-slate-200 rounded-lg text-xs font-mono"
                    />
                  </div>
                  <button 
                    onClick={() => removeDataNode(n.id)}
                    className="p-2 text-slate-300 hover:text-rose-500 transition-colors"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>
            ))}
            {formData.infrastructure.dataProcessingNodes.length === 0 && (
              <div className="text-center py-4 sm:py-6 border border-dashed border-slate-200 rounded-2xl">
                <p className="text-xs text-slate-400 font-medium italic">No processing nodes configured.</p>
              </div>
            )}
          </div>
        </section>
      </div>

      <div className="p-4 sm:p-5 lg:p-6 border-t border-slate-100 flex items-center justify-between bg-slate-50 rounded-b-3xl">
        <div className="flex items-center gap-2 text-xs text-slate-400 font-medium italic">
          <AlertCircle className="w-4 h-4" />
          Last updated: {new Date(formData.infrastructure.updatedAt).toLocaleString()}
        </div>
        <div className="flex items-center gap-3">
          <button 
            onClick={onCancel}
            className="px-4 py-2 text-xs font-bold text-slate-600 hover:text-slate-800 transition-colors"
          >
            Cancel
          </button>
          <button 
            onClick={handleSave}
            className="px-6 py-2 bg-indigo-600 text-white rounded-xl text-xs font-black shadow-lg shadow-indigo-600/20 hover:bg-indigo-700 transition-all flex items-center gap-2"
          >
            <Save className="w-4 h-4" />
            Commit Configuration
          </button>
        </div>
      </div>
    </div>
  );
};
