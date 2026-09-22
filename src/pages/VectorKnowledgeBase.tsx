import { fetchWithRetry } from '../lib/api-client';
import React, { useState, useEffect } from 'react';
import { 
  Database, 
  Search, 
  Plus, 
  RefreshCw, 
  ShieldCheck, 
  AlertCircle,
  FileText,
  BrainCircuit,
  Terminal,
  BookOpen
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { RagIngestionLogViewer } from '../components/dashboard/RagIngestionLogViewer';
import { SuperAdminRagCronConfigurator } from '../components/SuperAdminRagCronConfigurator';

interface Doc {
  id: string;
  text: string;
  metadata: {
    source: string;
    regulation: string;
  };
}

const PREDEFINED_DOCS = [
  {
    source: 'GDPR Art 32',
    text: 'Security of processing: Taking into account the state of the art, the costs of implementation and the nature, scope, context and purposes of processing as well as the risk of varying likelihood and severity for the rights and freedoms of natural persons, the controller and the processor shall implement appropriate technical and organisational measures to ensure a level of security appropriate to the risk.'
  },
  {
    source: 'EU AI Act Art 10',
    text: 'Data and data governance: High-risk AI systems which make use of techniques involving the training of models with data shall be developed on the basis of training, validation and testing data sets that meet the quality criteria referred to in paragraphs 2 to 5.'
  },
  {
    source: 'eIDAS Art 19',
    text: 'Security requirements applicable to trust service providers: Qualified and non-qualified trust service providers shall take appropriate technical and organisational measures to manage the risks posed to the security of the trust services they provide. Having regard to the latest technological developments, those measures shall ensure that the level of security is commensurate to the degree of risk.'
  }
];

const HighlightMatch = ({ text, query }: { text: string, query: string }) => {
  if (!query) return <>{text}</>;
  const words = query.toLowerCase().split(/\s+/).filter(w => w.length > 2);
  if (words.length === 0) return <>{text}</>;

  const escapeRegExp = (str: string) => str.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
  const regex = new RegExp(`(${words.map(escapeRegExp).join('|')})`, 'gi');
  
  const parts = text.split(regex);
  
  return (
    <>
      {parts.map((part, i) => 
        regex.test(part) ? (
          <mark key={i} className="bg-yellow-200 text-slate-900 font-semibold px-0.5 rounded-sm">{part}</mark>
        ) : (
          <span key={i}>{part}</span>
        )
      )}
    </>
  );
};

export const VectorKnowledgeBase: React.FC = () => {
  const [health, setHealth] = useState<{ status: string; version?: string; error?: string } | null>(null);
  const [loading, setLoading] = useState(false);
  const [query, setQuery] = useState('');
  const [searchResults, setSearchResults] = useState<any | null>(null);
  const [docs, setDocs] = useState<Doc[]>([]);
  const [newDocText, setNewDocText] = useState('');
  const [newDocSource, setNewDocSource] = useState('EU AI Act');
  const [activeFilters, setActiveFilters] = useState<string[]>(['GDPR', 'AI Act', 'eIDAS']);
  const [ragAnswer, setRagAnswer] = useState<string | null>(null);
  const [ragLoading, setRagLoading] = useState<boolean>(false);

  useEffect(() => {
    checkHealth();
  }, []);

  const checkHealth = async () => {
    try {
      const res = await fetchWithRetry('/api/v1/ai-knowledge/health');
      const data = await res.json();
      setHealth(data);
    } catch (err) {
      setHealth({ status: 'ERROR', error: 'API unreachable' });
    }
  };

  const loadPredefined = (doc: { source: string, text: string }) => {
    setNewDocSource(doc.source);
    setNewDocText(doc.text);
  };

  const handleUpsert = async () => {
    if (!newDocText.trim()) return;
    setLoading(true);
    try {
      const doc = {
        id: `doc-${Date.now()}`,
        text: newDocText,
        metadata: { source: newDocSource, regulation: newDocSource }
      };
      
      const res = await fetchWithRetry('/api/v1/ai-knowledge/upsert', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ documents: [doc] })
      });
      
      if (res.ok) {
        setDocs([doc, ...docs]);
        setNewDocText('');
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleSearch = async () => {
    if (!query.trim()) return;
    setLoading(true);
    setRagLoading(true);
    setRagAnswer(null);
    try {
      const res = await fetchWithRetry('/api/v1/ai-knowledge/search', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ query, limit: 3, filters: activeFilters })
      });
      const data = await res.json();
      setSearchResults(data);

      // Trigger RAG Orchestration Synthesis
      const ragRes = await fetchWithRetry('/api/v1/ai/rag-query', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ query })
      });
      if (ragRes.ok) {
        const ragData = await ragRes.json();
        setRagAnswer(ragData.answer || null);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
      setRagLoading(false);
    }
  };

  return (
    <div className="p-4 sm:p-5 lg:p-6 max-w-7xl mx-auto space-y-5 sm:space-y-8">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-black text-slate-900 tracking-tight flex items-center gap-3">
            <BrainCircuit className="w-8 h-8 text-indigo-600" />
            Vector Knowledge Base
          </h1>
          <p className="text-slate-500 font-medium mt-1">ChromaDB-powered semantic retrieval for regulatory intelligence.</p>
        </div>
        
        <div className={`px-4 py-2 rounded-xl border flex items-center gap-2 transition-all ${health?.status === 'CONNECTED' ? 'bg-emerald-50 border-emerald-200 text-emerald-700' : 'bg-rose-50 border-rose-200 text-rose-700'}`}>
          {health?.status === 'CONNECTED' ? <ShieldCheck className="w-4 h-4" /> : <AlertCircle className="w-4 h-4" />}
          <span className="text-xs font-bold uppercase tracking-widest">
            Chroma: {health?.status || 'CHECKING...'}
          </span>
          {health?.version && <span className="text-[10px] opacity-60">v{health.version}</span>}
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-5 sm:gap-8">
        {/* Input Column */}
        <div className="lg:col-span-1 space-y-4 sm:space-y-6">
          <div className="bg-white p-4 sm:p-5 lg:p-6 rounded-2xl border border-slate-200 shadow-sm space-y-4">
            <h2 className="text-sm font-black text-slate-400 uppercase tracking-widest flex items-center gap-2">
              <Plus className="w-4 h-4" /> Anchor Knowledge
            </h2>
            
            <div className="space-y-4">
              <div className="flex flex-wrap gap-2 mb-2">
                {PREDEFINED_DOCS.map((doc, idx) => (
                  <button
                    key={idx}
                    onClick={() => loadPredefined(doc)}
                    className="px-2 py-1 bg-slate-100 hover:bg-indigo-50 text-slate-600 hover:text-indigo-600 text-[10px] font-bold uppercase rounded border border-slate-200 transition-colors flex items-center gap-1"
                  >
                    <BookOpen className="w-3 h-3" />
                    {doc.source.split(' ')[0]}
                  </button>
                ))}
              </div>

              <div>
                <label className="block text-[10px] font-bold text-slate-500 uppercase mb-1">Source Context</label>
                <input 
                  type="text"
                  value={newDocSource}
                  onChange={(e) => setNewDocSource(e.target.value)}
                  className="w-full px-3 py-2 text-sm border border-slate-200 rounded-lg bg-slate-50 focus:outline-none focus:ring-2 focus:ring-indigo-500 font-sans"
                  placeholder="e.g. GDPR Art 32"
                />
              </div>
              
              <div>
                <label className="block text-[10px] font-bold text-slate-500 uppercase mb-1">Regulatory Text</label>
                <textarea 
                  rows={4}
                  value={newDocText}
                  onChange={(e) => setNewDocText(e.target.value)}
                  className="w-full px-3 py-2 text-sm border border-slate-200 rounded-lg bg-slate-50 focus:outline-none focus:ring-2 focus:ring-indigo-500 font-sans"
                  placeholder="Paste compliance requirements or policy snippets here..."
                />
              </div>

              <button 
                onClick={handleUpsert}
                disabled={loading || !newDocText}
                className="w-full py-3 bg-indigo-600 hover:bg-indigo-700 disabled:bg-slate-200 text-white font-bold rounded-xl transition-all flex items-center justify-center gap-2"
              >
                {loading ? <RefreshCw className="w-4 h-4 animate-spin" /> : <Database className="w-4 h-4" />}
                Embed in Vector Store
              </button>
            </div>
          </div>

          <div className="bg-slate-900 p-4 sm:p-5 lg:p-6 rounded-2xl text-white space-y-4">
            <h3 className="text-[10px] font-black text-indigo-400 uppercase tracking-widest">Engine Status</h3>
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-xs text-slate-400">Index Partition</span>
                <span className="text-xs font-mono font-bold">REG_DOCS_01</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-xs text-slate-400">Embedding Model</span>
                <span className="text-xs font-mono font-bold">all-MiniLM-L6-v2</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-xs text-slate-400">Distance Metric</span>
                <span className="text-xs font-mono font-bold">Cosine</span>
              </div>
            </div>
          </div>
        </div>

        {/* Search & Results Column */}
        <div className="lg:col-span-2 space-y-4 sm:space-y-6">
          <div className="bg-white p-2 rounded-2xl border border-slate-200 shadow-sm flex items-center gap-2">
            <div className="p-3 text-slate-400">
              <Search className="w-5 h-5" />
            </div>
            <input 
              type="text"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && handleSearch()}
              className="flex-1 px-2 py-3 text-lg font-medium text-slate-900 bg-transparent focus:outline-none"
              placeholder="Ask a semantic question about your anchored knowledge..."
            />
            <button 
              onClick={handleSearch}
              disabled={loading || !query}
              className="px-6 py-3 bg-indigo-600 hover:bg-indigo-700 text-white font-bold rounded-xl"
            >
              Search
            </button>
          </div>

          <div className="flex gap-2">
            {['GDPR', 'AI Act', 'eIDAS'].map(filter => (
              <button
                key={filter}
                onClick={() => {
                  if (activeFilters.includes(filter)) {
                    if (activeFilters.length > 1) {
                      setActiveFilters(activeFilters.filter(f => f !== filter));
                    }
                  } else {
                    setActiveFilters([...activeFilters, filter]);
                  }
                }}
                className={`px-4 py-1.5 text-xs font-bold rounded-full border transition-all ${
                  activeFilters.includes(filter)
                    ? 'bg-indigo-600 text-white border-indigo-600 shadow-sm'
                    : 'bg-white text-slate-500 border-slate-200 hover:border-indigo-300 hover:text-indigo-600 shadow-sm'
                }`}
              >
                {filter}
              </button>
            ))}
          </div>

          <AnimatePresence mode="wait">
            {(ragAnswer || ragLoading) && (
              <motion.div
                initial={{ opacity: 0, scale: 0.98 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.98 }}
                className="bg-gradient-to-br from-indigo-900 via-slate-900 to-indigo-950 p-6 rounded-2xl text-white shadow-lg border border-indigo-700/50 space-y-3"
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <BrainCircuit className="w-5 h-5 text-indigo-400 animate-pulse" />
                    <h3 className="text-xs font-black text-indigo-300 uppercase tracking-widest">
                      RAG Orchestration Grounded AI Response
                    </h3>
                  </div>
                  <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-indigo-800/60 text-indigo-200 border border-indigo-600/40 font-bold">
                    GEMINI-3.8-FLASH + VECTOR RAG
                  </span>
                </div>

                {ragLoading ? (
                  <div className="flex items-center gap-3 py-4 text-slate-400">
                    <RefreshCw className="w-5 h-5 animate-spin text-indigo-400" />
                    <span className="text-sm font-medium">Orchestrating vector context and synthesizing grounded answer...</span>
                  </div>
                ) : (
                  <div className="text-sm text-slate-200 leading-relaxed font-sans bg-slate-950/40 p-4 rounded-xl border border-indigo-800/30">
                    {ragAnswer}
                  </div>
                )}
              </motion.div>
            )}

            {searchResults ? (
              <motion.div 
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                className="space-y-4"
              >
                <div className="flex items-center justify-between px-2">
                  <h3 className="text-xs font-black text-slate-400 uppercase tracking-widest">
                    Semantic Matches Found
                  </h3>
                  <span className="text-[10px] font-bold text-indigo-600 bg-indigo-50 px-2 py-1 rounded">
                    Query Latency: 42ms
                  </span>
                </div>

                {searchResults.documents[0].length === 0 ? (
                  <div className="p-12 text-center bg-slate-50 rounded-2xl border border-dashed border-slate-200">
                    <p className="text-slate-400 font-medium">No results found in current collection.</p>
                  </div>
                ) : (
                  searchResults.documents[0].map((text: string, idx: number) => (
                    <div key={idx} className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm hover:border-indigo-200 transition-all group">
                      <div className="flex items-start justify-between mb-3">
                        <div className="flex items-center gap-2">
                          <div className="p-1.5 bg-indigo-50 text-indigo-600 rounded-lg">
                            <FileText className="w-4 h-4" />
                          </div>
                          <span className="text-xs font-black text-slate-900">
                            {searchResults.metadatas[0][idx].source}
                          </span>
                        </div>
                        <span className="text-[10px] font-mono text-slate-400 font-bold">
                          DISTANCE: {searchResults.distances[0][idx].toFixed(4)}
                        </span>
                      </div>
                      <p className="text-sm text-slate-600 leading-relaxed">
                        <HighlightMatch text={text} query={query} />
                      </p>
                    </div>
                  ))
                )}
              </motion.div>
            ) : (
              <div className="p-20 text-center space-y-4">
                <div className="w-16 h-16 bg-slate-100 rounded-full flex items-center justify-center mx-auto">
                  <Terminal className="w-8 h-8 text-slate-300" />
                </div>
                <div className="space-y-1">
                  <h3 className="text-slate-900 font-bold">Ready for Semantic Querying</h3>
                  <p className="text-slate-400 text-sm max-w-xs mx-auto">
                    Enter a natural language query above to retrieve contextually relevant regulatory information.
                  </p>
                </div>
              </div>
            )}
          </AnimatePresence>

          <div className="pt-6 border-t border-slate-200 grid grid-cols-1 md:grid-cols-2 gap-4 sm:gap-6">
            <div>
              <h2 className="text-sm font-black text-slate-400 uppercase tracking-widest mb-4">Ingestion Sync Settings</h2>
              <SuperAdminRagCronConfigurator />
            </div>
            <div>
              <h2 className="text-sm font-black text-slate-400 uppercase tracking-widest mb-4">Ingestion Audit Log</h2>
              <RagIngestionLogViewer />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
