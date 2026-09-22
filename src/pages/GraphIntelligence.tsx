import React, { useState } from 'react';
import { 
  Network, 
  Search, 
  Database, 
  Zap, 
  Activity, 
  Share2, 
  Layers, 
  Terminal, 
  Cpu, 
  Globe,
  Filter,
  ArrowRight,
  ShieldCheck,
  BrainCircuit,
  MessageSquareShare,
  RefreshCcw,
  ShieldAlert,
  Fingerprint
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';

interface KnowledgeEdge {
  id: string;
  source: string;
  target: string;
  relation: string;
}

interface KnowledgeNode {
  id: string;
  label: string;
  type: 'ENTITY' | 'THREAT' | 'ASSET';
  summary: string;
}

export const GraphIntelligence: React.FC = () => {
  const [nodes] = useState<KnowledgeNode[]>([
    { id: '1', label: 'API_GATEWAY', type: 'ASSET', summary: 'Critical entry point for all sovereign traffic.' },
    { id: '2', label: 'LOG4J_EXPLOIT', type: 'THREAT', summary: 'Historical RCE vulnerability (CVE-2021-44228).' },
    { id: '3', label: 'FR_NODE_01', type: 'ENTITY', summary: 'Compute node located in Frankfurt data center.' },
    { id: '4', label: 'USER_ADMIN_LEO', type: 'ENTITY', summary: 'Identity with superadmin privileges.' }
  ]);

  const [edges] = useState<KnowledgeEdge[]>([
    { id: 'e1', source: '1', target: '3', relation: 'RUNS_ON' },
    { id: 'e2', source: '2', target: '1', relation: 'TARGETS' },
    { id: 'e3', source: '4', target: '1', relation: 'MANAGES' }
  ]);

  const [searchQuery, setSearchQuery] = useState('');
  const [searching, setSearching] = useState(false);

  const handleSearch = () => {
    setSearching(true);
    setTimeout(() => setSearching(false), 1500);
  };

  return (
    <div className="p-4 sm:p-5 lg:p-6 max-w-7xl mx-auto space-y-5 sm:space-y-8">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-black text-slate-900 tracking-tight flex items-center gap-2">
            <BrainCircuit className="w-8 h-8 text-indigo-600" />
            Sovereign Graph & Vector Intel
          </h1>
          <p className="text-slate-500 text-sm mt-1 italic">
            Integrated <strong>Kuzu Graph</strong> & <strong>Chroma Vector</strong> Search Engine.
          </p>
        </div>
        <div className="flex gap-2">
          <button className="px-4 py-2 bg-white border border-slate-200 rounded-xl text-slate-600 text-xs font-bold hover:bg-slate-50 flex items-center gap-2 shadow-sm transition-all">
            <Database className="w-3.5 h-3.5" />
            Rebuild Embeddings
          </button>
          <button className="px-4 py-2 bg-indigo-600 text-white rounded-xl text-xs font-bold hover:bg-indigo-700 flex items-center gap-2 shadow-lg shadow-indigo-200">
            <Share2 className="w-3.5 h-3.5" />
            Graph Explorer
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-4 gap-5 sm:gap-8">
        <div className="lg:col-span-3 space-y-4 sm:space-y-6">
          {/* Neural Search Bar */}
          <div className="bg-white p-5 rounded-[2rem] border border-slate-200 shadow-xl shadow-indigo-50/50 flex gap-4">
            <div className="flex-1 relative">
              <Search className="w-5 h-5 absolute left-4 top-1/2 -translate-y-1/2 text-indigo-400" />
              <input 
                type="text" 
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && handleSearch()}
                placeholder="Ask about infrastructure relations (e.g., 'What assets are at risk from CVE-2021-44228?')..." 
                className="w-full pl-12 pr-4 py-3 bg-slate-50 border border-slate-100 rounded-2xl text-sm focus:ring-2 focus:ring-indigo-500/20 outline-none transition-all"
              />
            </div>
            <button 
              onClick={handleSearch}
              className="px-6 py-3 bg-slate-900 text-white text-xs font-black uppercase tracking-widest rounded-2xl hover:bg-slate-800 transition-all flex items-center gap-2"
            >
              {searching ? <RefreshCcw className="w-4 h-4 animate-spin" /> : <Zap className="w-4 h-4 text-indigo-400" />}
              {searching ? 'Querying Vector Space...' : 'Semantic Search'}
            </button>
          </div>

          {/* Graph Visualization Mock */}
          <div className="bg-slate-950 rounded-[3rem] p-12 min-h-[450px] relative overflow-hidden shadow-2xl flex items-center justify-center">
            <div className="absolute inset-0 opacity-10">
              <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,_var(--tw-gradient-from)_0%,_transparent_100%)] from-indigo-500/40" />
              <div className="w-full h-full" style={{ backgroundImage: 'radial-gradient(circle, #4f46e5 0.5px, transparent 0.5px)', backgroundSize: '30px 30px' }} />
            </div>

            <div className="relative z-10 w-full max-w-2xl h-full flex items-center justify-center">
              <AnimatePresence>
                {!searching && (
                  <motion.div 
                    initial={{ opacity: 0, scale: 0.9 }}
                    animate={{ opacity: 1, scale: 1 }}
                    className="relative w-full aspect-video flex items-center justify-center"
                  >
                    {/* Simulated Graph Nodes */}
                    <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2">
                      <div className="w-20 h-20 bg-indigo-600 rounded-full flex items-center justify-center shadow-[0_0_30px_rgba(79,70,229,0.5)] border-4 border-white animate-pulse">
                        <Cpu className="w-10 h-10 text-white" />
                      </div>
                      <span className="absolute -bottom-8 left-1/2 -translate-x-1/2 text-white text-[10px] font-black uppercase tracking-widest">API_GATEWAY</span>
                    </div>

                    <div className="absolute top-0 left-1/4">
                      <div className="w-16 h-16 bg-rose-500 rounded-full flex items-center justify-center shadow-[0_0_20px_rgba(244,63,94,0.4)] border-2 border-white">
                        <ShieldAlert className="w-8 h-8 text-white" />
                      </div>
                      <span className="absolute -top-6 left-1/2 -translate-x-1/2 text-white text-[9px] font-bold uppercase tracking-widest">CVE-2021-44228</span>
                    </div>

                    <div className="absolute bottom-10 right-1/4">
                      <div className="w-16 h-16 bg-emerald-500 rounded-full flex items-center justify-center shadow-[0_0_20px_rgba(16,185,129,0.4)] border-2 border-white">
                        <Fingerprint className="w-8 h-8 text-white" />
                      </div>
                      <span className="absolute -bottom-6 left-1/2 -translate-x-1/2 text-white text-[9px] font-bold uppercase tracking-widest">ADMIN_LEO</span>
                    </div>

                    {/* SVG Connections */}
                    <svg className="absolute inset-0 w-full h-full pointer-events-none overflow-visible">
                      <motion.line 
                        initial={{ pathLength: 0 }}
                        animate={{ pathLength: 1 }}
                        x1="30%" y1="20%" x2="50%" y2="50%" 
                        stroke="rgba(244,63,94,0.5)" strokeWidth="2" strokeDasharray="5,5" 
                      />
                      <motion.line 
                        initial={{ pathLength: 0 }}
                        animate={{ pathLength: 1 }}
                        x1="70%" y1="80%" x2="50%" y2="50%" 
                        stroke="rgba(16,185,129,0.5)" strokeWidth="2" 
                      />
                    </svg>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          </div>

          <div className="bg-white rounded-3xl border border-slate-200 overflow-hidden shadow-sm">
            <div className="px-6 py-4 border-b border-slate-100 flex items-center justify-between">
              <h3 className="font-bold text-slate-800 text-sm flex items-center gap-2">
                <Terminal className="w-4 h-4 text-indigo-500" />
                Cypher Query Terminal
              </h3>
              <div className="flex items-center gap-2">
                <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Engine: Kuzu 0.1.0</span>
              </div>
            </div>
            <div className="p-4 bg-slate-900 text-indigo-300 font-mono text-[11px] leading-relaxed">
              <p className="text-slate-500"># Querying relations for FR_NODE_01</p>
              <p><span className="text-emerald-400">MATCH</span> (n:Node)-[r:RUNS_ON]-(a:Asset) <span className="text-emerald-400">WHERE</span> n.id = <span className="text-amber-400">'FR_NODE_01'</span> <span className="text-emerald-400">RETURN</span> a.label, r.type;</p>
              <div className="mt-4 p-3 bg-slate-800 rounded-lg text-slate-300 border border-slate-700">
                <p>&gt; Result: [ &#123; "label": "API_GATEWAY", "type": "RUNS_ON" &#125; ]</p>
              </div>
            </div>
          </div>
        </div>

        <div className="space-y-4 sm:space-y-6">
          <div className="bg-indigo-600 p-4 sm:p-5 lg:p-6 rounded-[2rem] text-white shadow-2xl relative overflow-hidden group">
            <div className="absolute top-0 right-0 p-4 opacity-10 group-hover:opacity-20 transition-opacity">
              <BrainCircuit className="w-24 h-24 text-white" />
            </div>
            <h3 className="text-lg font-black italic mb-4 flex items-center gap-2">
              <MessageSquareShare className="w-5 h-5" />
              Sovereign LLM
            </h3>
            <p className="text-indigo-100 text-xs leading-relaxed mb-6">
              Security metadata is converted to high-dimensional vectors and stored in a local <strong>ChromaDB</strong>. RAG (Retrieval Augmented Generation) ensures zero data leakage to external models.
            </p>
            <div className="space-y-3">
              <div className="flex items-center justify-between text-[10px] font-black">
                <span className="text-indigo-200 uppercase tracking-widest">Vector Embedding Depth</span>
                <span>1,536 DIM</span>
              </div>
              <div className="w-full h-1 bg-indigo-800 rounded-full overflow-hidden">
                <motion.div 
                  initial={{ width: 0 }}
                  animate={{ width: '100%' }}
                  className="h-full bg-white"
                />
              </div>
            </div>
          </div>

          <div className="bg-white p-4 sm:p-5 lg:p-6 rounded-2xl border border-slate-200 shadow-sm space-y-4">
            <h3 className="text-xs font-black text-slate-400 uppercase tracking-widest flex items-center gap-2">
              <Layers className="w-4 h-4 text-indigo-500" />
              Entity Catalog
            </h3>
            <div className="space-y-3">
              {nodes.map((node) => (
                <div key={node.id} className="flex items-center justify-between group cursor-pointer">
                  <div className="flex items-center gap-3">
                    <div className={`w-1.5 h-1.5 rounded-full ${node.type === 'THREAT' ? 'bg-rose-500' : node.type === 'ASSET' ? 'bg-indigo-500' : 'bg-emerald-500'}`} />
                    <span className="text-[10px] font-bold text-slate-700 group-hover:text-indigo-600 transition-colors">{node.label}</span>
                  </div>
                  <ArrowRight className="w-3 h-3 text-slate-300 group-hover:text-indigo-500 transition-colors" />
                </div>
              ))}
            </div>
          </div>

          <div className="bg-emerald-50 p-4 rounded-xl border border-emerald-100 flex items-start gap-3">
            <ShieldCheck className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
            <p className="text-[10px] text-emerald-700 leading-normal italic">
              "Relationship-based access control (ReBAC) is enforced via graph traversal at runtime."
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};
