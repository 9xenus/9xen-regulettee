import React, { useState, useEffect } from 'react';
import { SubEntity } from './types';
import { SubEntityForm } from './SubEntityForm';
import { SubEntityComparison } from './SubEntityComparison';
import { 
  Building2, 
  Plus, 
  Search, 
  ArrowRightLeft, 
  Server, 
  Trash2, 
  Edit3,
  MoreVertical,
  CheckCircle2,
  AlertTriangle,
  XCircle,
  Activity,
  ShieldCheck,
  Cpu,
  Settings
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';

export const SubEntitiesManager: React.FC = () => {
  const [entities, setEntities] = useState<SubEntity[]>([]);
  const [showForm, setShowForm] = useState(false);
  const [editingEntity, setEditingEntity] = useState<SubEntity | undefined>(undefined);
  const [comparisonPair, setComparisonPair] = useState<[SubEntity, SubEntity] | null>(null);
  const [selectedForComparison, setSelectedForComparison] = useState<string[]>([]);
  const [searchTerm, setSearchTerm] = useState('');

  useEffect(() => {
    const saved = localStorage.getItem('9xen-regulettee_sub_entities');
    if (saved) {
      setEntities(JSON.parse(saved));
    } else {
      // Mock initial data
      const initial: SubEntity[] = [
        {
          id: 'ent_1',
          name: '9Xen Regulettee Germany GmbH',
          industry: 'Technology',
          complianceScore: 94,
          status: 'Active',
          infrastructure: {
            serverLocations: ['Frankfurt', 'Berlin'],
            dataProcessingNodes: [
              { id: 'node_1', name: 'DE-Processing-01', location: 'Frankfurt', processingType: 'PII Scrubbing', recordCount: 142000 }
            ],
            cloudProviders: [
              { id: 'cloud_1', provider: 'AWS', region: 'eu-central-1', configType: 'Enclave', status: 'Healthy' }
            ],
            updatedAt: new Date().toISOString()
          }
        },
        {
          id: 'ent_2',
          name: '9Xen Regulettee France SAS',
          industry: 'Technology',
          complianceScore: 89,
          status: 'Under Review',
          infrastructure: {
            serverLocations: ['Paris'],
            dataProcessingNodes: [
              { id: 'node_2', name: 'FR-Core-Node', location: 'Paris', processingType: 'Encryption', recordCount: 88000 }
            ],
            cloudProviders: [
              { id: 'cloud_2', provider: 'Azure', region: 'france-central', configType: 'Shared', status: 'Warning' }
            ],
            updatedAt: new Date().toISOString()
          }
        }
      ];
      setEntities(initial);
      localStorage.setItem('9xen-regulettee_sub_entities', JSON.stringify(initial));
    }
  }, []);

  const saveEntities = (newEntities: SubEntity[]) => {
    setEntities(newEntities);
    localStorage.setItem('9xen-regulettee_sub_entities', JSON.stringify(newEntities));
  };

  const handleSave = (entity: SubEntity) => {
    if (editingEntity) {
      saveEntities(entities.map(e => e.id === entity.id ? entity : e));
    } else {
      saveEntities([...entities, entity]);
    }
    setShowForm(false);
    setEditingEntity(undefined);
  };

  const handleDelete = (id: string) => {
    if (window.confirm('Are you sure you want to delete this sub-entity? This action is irreversible.')) {
      saveEntities(entities.filter(e => e.id !== id));
    }
  };

  const handleToggleComparison = (id: string) => {
    if (selectedForComparison.includes(id)) {
      setSelectedForComparison(selectedForComparison.filter(i => i !== id));
    } else if (selectedForComparison.length < 2) {
      setSelectedForComparison([...selectedForComparison, id]);
    }
  };

  const runComparison = () => {
    if (selectedForComparison.length === 2) {
      const a = entities.find(e => e.id === selectedForComparison[0])!;
      const b = entities.find(e => e.id === selectedForComparison[1])!;
      setComparisonPair([a, b]);
    }
  };

  const filteredEntities = entities.filter(e => 
    e.name.toLowerCase().includes(searchTerm.toLowerCase()) || 
    e.industry.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="space-y-4 sm:space-y-6">
      {/* Header Section */}
      <div className="bg-white border border-slate-200 rounded-3xl p-5 sm:p-6 lg:p-8 shadow-sm flex flex-col md:flex-row md:items-center justify-between gap-4 sm:gap-6 overflow-hidden relative">
        <div className="absolute top-0 right-0 w-64 h-64 bg-indigo-50 rounded-full -mr-32 -mt-32 opacity-50 blur-3xl pointer-events-none"></div>
        <div className="relative z-10 text-left">
          <div className="flex items-center gap-3 mb-2">
            <div className="p-2.5 bg-indigo-600 text-white rounded-2xl shadow-lg shadow-indigo-600/20">
              <Building2 className="w-6 h-6" />
            </div>
            <h2 className="text-2xl font-black text-slate-900 tracking-tight">Corporate Sub-Entities</h2>
          </div>
          <p className="text-sm text-slate-500 max-w-xl leading-relaxed">
            Manage regional infrastructure profiles, data processing nodes, and cloud configurations for multi-jurisdictional compliance auditing.
          </p>
        </div>
        <div className="flex items-center gap-3 relative z-10">
          <button 
            onClick={() => {
              setEditingEntity(undefined);
              setShowForm(true);
            }}
            className="px-6 py-3 bg-indigo-600 text-white rounded-2xl text-sm font-black shadow-lg shadow-indigo-600/20 hover:bg-indigo-700 transition-all flex items-center gap-2 group"
          >
            <Plus className="w-5 h-5 group-hover:rotate-90 transition-transform" />
            Register Entity
          </button>
        </div>
      </div>

      {/* Control Bar */}
      <div className="flex flex-col md:flex-row items-center justify-between gap-4">
        <div className="relative w-full md:w-96">
          <Search className="absolute left-3.5 top-3 h-4 w-4 text-slate-400" />
          <input 
            type="text" 
            placeholder="Search by name or industry..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-10 pr-4 py-2.5 border border-slate-200 rounded-2xl text-sm focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 outline-none transition-all bg-white"
          />
        </div>

        <div className="flex items-center gap-3 w-full md:w-auto">
          <AnimatePresence>
            {selectedForComparison.length > 0 && (
              <motion.div 
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: 20 }}
                className="flex items-center gap-3 bg-indigo-50 px-4 py-2 rounded-2xl border border-indigo-100 shadow-sm"
              >
                <span className="text-xs font-black text-indigo-700">
                  {selectedForComparison.length} selected
                </span>
                <button 
                  onClick={runComparison}
                  disabled={selectedForComparison.length !== 2}
                  className="px-4 py-1.5 bg-indigo-600 text-white rounded-xl text-[10px] font-black uppercase tracking-wider disabled:opacity-50 disabled:cursor-not-allowed hover:bg-indigo-700 transition-all flex items-center gap-1.5"
                >
                  <ArrowRightLeft className="w-3.5 h-3.5" />
                  Run Comparison
                </button>
                <button 
                  onClick={() => setSelectedForComparison([])}
                  className="text-slate-400 hover:text-rose-500 p-1"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </div>

      {/* Entity Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6">
        {filteredEntities.map(entity => (
          <motion.div 
            layout
            key={entity.id}
            className={`bg-white border p-4 sm:p-5 lg:p-6 rounded-3xl transition-all relative group text-left ${selectedForComparison.includes(entity.id) ? 'border-indigo-500 ring-4 ring-indigo-500/10' : 'border-slate-200 hover:border-slate-300 shadow-sm hover:shadow-md'}`}
          >
            <div className="flex justify-between items-start mb-4">
              <div className="p-2.5 bg-slate-50 rounded-2xl border border-slate-100 group-hover:bg-indigo-50 group-hover:border-indigo-100 transition-colors">
                <Building2 className="w-6 h-6 text-slate-400 group-hover:text-indigo-600" />
              </div>
              <div className="flex items-center gap-2">
                <button 
                  onClick={() => handleToggleComparison(entity.id)}
                  className={`p-2 rounded-xl transition-all ${selectedForComparison.includes(entity.id) ? 'bg-indigo-600 text-white' : 'bg-slate-50 text-slate-400 hover:bg-indigo-50 hover:text-indigo-600'}`}
                  title="Compare"
                >
                  <ArrowRightLeft className="w-4 h-4" />
                </button>
                <button 
                  onClick={() => {
                    setEditingEntity(entity);
                    setShowForm(true);
                  }}
                  className="p-2 bg-slate-50 text-slate-400 hover:bg-slate-100 hover:text-slate-700 rounded-xl transition-all"
                >
                  <Edit3 className="w-4 h-4" />
                </button>
                <button 
                  onClick={() => handleDelete(entity.id)}
                  className="p-2 bg-slate-50 text-slate-400 hover:bg-rose-50 hover:text-rose-600 rounded-xl transition-all"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
            </div>

            <div className="space-y-4">
              <div>
                <h3 className="text-lg font-black text-slate-900 group-hover:text-indigo-600 transition-colors">{entity.name}</h3>
                <p className="text-xs text-slate-400 font-bold uppercase tracking-widest mt-1">{entity.industry} Sector</p>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div className="p-3 bg-slate-50 rounded-2xl border border-slate-100">
                  <div className="text-[9px] font-black text-slate-400 uppercase tracking-widest mb-1">Compliance</div>
                  <div className="flex items-center gap-1.5">
                    <span className={`text-sm font-black ${entity.complianceScore >= 90 ? 'text-emerald-600' : entity.complianceScore >= 70 ? 'text-amber-600' : 'text-rose-600'}`}>
                      {entity.complianceScore}%
                    </span>
                    <ShieldCheck className={`w-3.5 h-3.5 ${entity.complianceScore >= 90 ? 'text-emerald-500' : 'text-amber-500'}`} />
                  </div>
                </div>
                <div className="p-3 bg-slate-50 rounded-2xl border border-slate-100">
                  <div className="text-[9px] font-black text-slate-400 uppercase tracking-widest mb-1">Status</div>
                  <div className="flex items-center gap-1.5">
                    <span className={`text-sm font-black ${entity.status === 'Active' ? 'text-emerald-600' : 'text-amber-600'}`}>
                      {entity.status}
                    </span>
                  </div>
                </div>
              </div>

              <div className="space-y-3 pt-2">
                <div className="flex items-center justify-between text-xs">
                  <span className="text-slate-400 font-bold flex items-center gap-1.5">
                    <Server className="w-3.5 h-3.5" /> Nodes
                  </span>
                  <span className="font-mono font-bold text-slate-700">{entity.infrastructure.dataProcessingNodes.length} Active</span>
                </div>
                <div className="flex items-center justify-between text-xs">
                  <span className="text-slate-400 font-bold flex items-center gap-1.5">
                    <Activity className="w-3.5 h-3.5" /> Vol
                  </span>
                  <span className="font-mono font-bold text-indigo-600">
                    {(entity.infrastructure.dataProcessingNodes.reduce((acc, n) => acc + n.recordCount, 0) / 1000).toFixed(1)}k
                  </span>
                </div>
              </div>

              <div className="pt-4 border-t border-slate-100 flex items-center justify-between">
                <div className="flex -space-x-2">
                  {entity.infrastructure.cloudProviders.map(p => (
                    <div 
                      key={p.id} 
                      className={`w-7 h-7 rounded-full border-2 border-white flex items-center justify-center text-[8px] font-black text-white shadow-sm ${p.provider === 'AWS' ? 'bg-orange-500' : p.provider === 'Azure' ? 'bg-blue-500' : 'bg-red-500'}`}
                      title={`${p.provider} - ${p.region}`}
                    >
                      {p.provider.charAt(0)}
                    </div>
                  ))}
                </div>
                <span className="text-[10px] text-slate-300 font-bold">Updated: {new Date(entity.infrastructure.updatedAt).toLocaleDateString()}</span>
              </div>
            </div>
          </motion.div>
        ))}

        {filteredEntities.length === 0 && (
          <div className="col-span-full py-16 border-2 border-dashed border-slate-200 rounded-3xl flex flex-col items-center justify-center space-y-3 bg-slate-50/50">
            <Building2 className="w-12 h-12 text-slate-200" />
            <div className="text-center">
              <h4 className="text-sm font-black text-slate-900">No entities found</h4>
              <p className="text-xs text-slate-400 mt-1">Try adjusting your search or register a new sub-entity.</p>
            </div>
          </div>
        )}
      </div>

      {/* Actionable Suggestions Section */}
      <div className="bg-emerald-50 border border-emerald-100 rounded-3xl p-5 sm:p-6 lg:p-8 shadow-sm text-left">
        <div className="flex items-center gap-3 mb-6">
          <div className="p-2 bg-emerald-600 text-white rounded-2xl shadow-lg shadow-emerald-600/20">
            <Cpu className="w-6 h-6" />
          </div>
          <div>
            <h3 className="text-xl font-black text-slate-900 tracking-tight">Auto-Optimization Engine</h3>
            <p className="text-xs text-slate-500 mt-1">Sovereign AI identifying cross-entity efficiency and compliance discrepancies.</p>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6">
          <div className="bg-white p-5 rounded-2xl border border-emerald-100 space-y-3 group hover:border-emerald-300 transition-colors">
            <div className="flex justify-between items-start">
              <span className="text-[10px] font-black text-emerald-600 uppercase tracking-widest">Efficiency Gap</span>
              <span className="text-[10px] bg-amber-100 text-amber-700 px-2 py-0.5 rounded-full font-bold">Suggestion</span>
            </div>
            <h4 className="text-sm font-bold text-slate-900">Node Consolidation</h4>
            <p className="text-xs text-slate-500 leading-relaxed">
              Detected 3 low-volume processing nodes in eu-west-1 across 2 sub-entities. Recommending consolidation into a single dedicated Sovereign Enclave.
            </p>
            <button className="text-xs font-black text-emerald-600 flex items-center gap-1 hover:underline group-hover:gap-2 transition-all">
              Apply Fix <Settings className="w-3.5 h-3.5" />
            </button>
          </div>

          <div className="bg-white p-5 rounded-2xl border border-emerald-100 space-y-3 group hover:border-emerald-300 transition-colors">
            <div className="flex justify-between items-start">
              <span className="text-[10px] font-black text-emerald-600 uppercase tracking-widest">Residency Drift</span>
              <span className="text-[10px] bg-rose-100 text-rose-700 px-2 py-0.5 rounded-full font-bold">Critical</span>
            </div>
            <h4 className="text-sm font-bold text-slate-900">Cloud Configuration Drift</h4>
            <p className="text-xs text-slate-500 leading-relaxed">
              Sub-entity '9Xen Regulettee France' is utilizing a Shared Instance for PII processing. Regulatory guidelines mandate 'Dedicated' or 'Enclave' topology.
            </p>
            <button className="text-xs font-black text-emerald-600 flex items-center gap-1 hover:underline group-hover:gap-2 transition-all">
              Re-provision Enclave <Settings className="w-3.5 h-3.5" />
            </button>
          </div>

          <div className="bg-white p-5 rounded-2xl border border-emerald-100 space-y-3 group hover:border-emerald-300 transition-colors">
            <div className="flex justify-between items-start">
              <span className="text-[10px] font-black text-emerald-600 uppercase tracking-widest">Latency Optimization</span>
              <span className="text-[10px] bg-indigo-100 text-indigo-700 px-2 py-0.5 rounded-full font-bold">Performance</span>
            </div>
            <h4 className="text-sm font-bold text-slate-900">Regional Edge Nodes</h4>
            <p className="text-xs text-slate-500 leading-relaxed">
              Detected high inter-region latency between DE and FR nodes. Recommending deployment of a shared edge-gateway in eu-central-2.
            </p>
            <button className="text-xs font-black text-emerald-600 flex items-center gap-1 hover:underline group-hover:gap-2 transition-all">
              Launch Gateway <Settings className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>
      </div>

      {/* Modals */}
      <AnimatePresence>
        {showForm && (
          <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setShowForm(false)}
              className="absolute inset-0 bg-slate-900/60 backdrop-blur-sm"
            />
            <motion.div 
              initial={{ opacity: 0, scale: 0.95, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 20 }}
              className="relative z-10 w-full max-w-4xl"
            >
              <SubEntityForm 
                initialData={editingEntity}
                onSave={handleSave}
                onCancel={() => {
                  setShowForm(false);
                  setEditingEntity(undefined);
                }}
              />
            </motion.div>
          </div>
        )}

        {comparisonPair && (
          <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setComparisonPair(null)}
              className="absolute inset-0 bg-slate-900/60 backdrop-blur-sm"
            />
            <motion.div 
              initial={{ opacity: 0, scale: 0.95, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 20 }}
              className="relative z-10 w-full max-w-6xl"
            >
              <SubEntityComparison 
                entityA={comparisonPair[0]}
                entityB={comparisonPair[1]}
                onClose={() => setComparisonPair(null)}
              />
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
};
