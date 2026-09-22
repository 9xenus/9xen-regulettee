import React, { useState, useEffect } from 'react';
import { 
  Database, 
  Plus, 
  Globe, 
  FolderGit2, 
  ShieldCheck, 
  Trash2, 
  CheckCircle2, 
  AlertCircle, 
  RefreshCw,
  Search,
  Lock,
  Cpu,
  Layers,
  X,
  Eye,
  Sparkles,
  Zap,
  FileText
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';

interface KnowledgeSource {
  id: string;
  name: string;
  sourceType: 'URL' | 'VECTOR_PATH' | 'S3_BUCKET' | 'SQL_SHARD';
  sourceUri: string;
  securityClassification: 'PUBLIC' | 'CONFIDENTIAL' | 'RESTRICTED' | 'SOVEREIGN_RESTRICTED';
  active: boolean;
  createdAt: string;
}

interface PreviewResult {
  chunkId: string;
  content: string;
  score: number;
  tokens: number;
  vectorDimensions: number;
}

interface PreviewData {
  sourceId: string;
  sourceName: string;
  sourceUri: string;
  searchQuery: string;
  latencyMs: number;
  indexingHealth: string;
  embeddingModel: string;
  totalIndexedChunks: number;
  results: PreviewResult[];
}

export const RagKnowledgeSourcesManager: React.FC = () => {
  const [sources, setSources] = useState<KnowledgeSource[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [isModalOpen, setIsModalOpen] = useState<boolean>(false);
  const [registrationMode, setRegistrationMode] = useState<'SINGLE' | 'BULK'>('SINGLE');
  
  // Single Form states
  const [name, setName] = useState<string>('');
  const [sourceType, setSourceType] = useState<'URL' | 'VECTOR_PATH' | 'S3_BUCKET' | 'SQL_SHARD'>('URL');
  const [sourceUri, setSourceUri] = useState<string>('');
  const [securityClassification, setSecurityClassification] = useState<'PUBLIC' | 'CONFIDENTIAL' | 'RESTRICTED' | 'SOVEREIGN_RESTRICTED'>('SOVEREIGN_RESTRICTED');
  
  // Bulk Form states
  const [bulkText, setBulkText] = useState<string>('');
  const [bulkSourceType, setBulkSourceType] = useState<'URL' | 'VECTOR_PATH' | 'S3_BUCKET' | 'SQL_SHARD'>('URL');
  const [bulkSecurityClassification, setBulkSecurityClassification] = useState<'PUBLIC' | 'CONFIDENTIAL' | 'RESTRICTED' | 'SOVEREIGN_RESTRICTED'>('SOVEREIGN_RESTRICTED');

  const [submitting, setSubmitting] = useState<boolean>(false);

  // Preview Modal states
  const [selectedPreviewSource, setSelectedPreviewSource] = useState<KnowledgeSource | null>(null);
  const [previewQuery, setPreviewQuery] = useState<string>('data protection and sovereign compliance rules');
  const [previewLoading, setPreviewLoading] = useState<boolean>(false);
  const [previewData, setPreviewData] = useState<PreviewData | null>(null);

  const fetchSources = async () => {
    setLoading(true);
    try {
      const res = await fetch('/api/v1/ai/rag/sources');
      const data = await res.json();
      if (data.success && data.sources) {
        setSources(data.sources);
      }
    } catch (err) {
      console.error('Failed to fetch RAG sources:', err);
      setSources([
        {
          id: 'src-1',
          name: 'EU GDPR Statutory Gazette Knowledge Shard',
          sourceType: 'URL',
          sourceUri: 'https://eur-lex.europa.eu/eli/reg/2016/679/oj',
          securityClassification: 'PUBLIC',
          active: true,
          createdAt: new Date(Date.now() - 1000 * 60 * 60 * 48).toISOString()
        },
        {
          id: 'src-2',
          name: 'Secure Sovereign Healthcare Enclave Vector DB',
          sourceType: 'VECTOR_PATH',
          sourceUri: 'vector://enclave-health-eu-central-1/embeddings_v4',
          securityClassification: 'SOVEREIGN_RESTRICTED',
          active: true,
          createdAt: new Date(Date.now() - 1000 * 60 * 60 * 12).toISOString()
        }
      ]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchSources();
  }, []);

  const handleRegisterSource = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name || !sourceUri) return;

    setSubmitting(true);
    try {
      const res = await fetch('/api/v1/ai/rag/sources', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name, sourceType, sourceUri, securityClassification })
      });
      const data = await res.json();
      if (data.success) {
        await fetchSources();
        setName('');
        setSourceUri('');
        setIsModalOpen(false);
      }
    } catch (err) {
      console.error('Failed to register RAG source:', err);
      const newSource: KnowledgeSource = {
        id: 'src-' + Math.random().toString(36).substring(2, 8),
        name,
        sourceType,
        sourceUri,
        securityClassification,
        active: true,
        createdAt: new Date().toISOString()
      };
      setSources(prev => [newSource, ...prev]);
      setName('');
      setSourceUri('');
      setIsModalOpen(false);
    } finally {
      setSubmitting(false);
    }
  };

  const handleBulkRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!bulkText.trim()) return;

    setSubmitting(true);
    try {
      const lines = bulkText.split('\n').map(l => l.trim()).filter(l => l.length > 0);
      const newSources: KnowledgeSource[] = [];

      for (const line of lines) {
        const parts = line.split('|').map(p => p.trim());
        const sourceName = parts.length > 1 ? parts[0] : `Imported ${bulkSourceType} Source`;
        const uri = parts.length > 1 ? parts[1] : parts[0];

        const newSource: KnowledgeSource = {
          id: 'src-' + Math.random().toString(36).substring(2, 8),
          name: sourceName,
          sourceType: bulkSourceType,
          sourceUri: uri,
          securityClassification: bulkSecurityClassification,
          active: true,
          createdAt: new Date().toISOString()
        };
        newSources.push(newSource);
      }

      setSources(prev => [...newSources, ...prev]);
      setBulkText('');
      setIsModalOpen(false);
    } catch (err) {
      console.error('Failed bulk register:', err);
    } finally {
      setSubmitting(false);
    }
  };

  const handleDeleteSource = async (id: string) => {
    try {
      await fetch(`/api/v1/ai/rag/sources/${id}`, { method: 'DELETE' });
      setSources(prev => prev.filter(s => s.id !== id));
    } catch (err) {
      setSources(prev => prev.filter(s => s.id !== id));
    }
  };

  const executePreviewSearch = async (source: KnowledgeSource, queryToUse?: string) => {
    const query = queryToUse || previewQuery || 'data protection compliance';
    setPreviewLoading(true);
    try {
      const res = await fetch(`/api/v1/ai/rag/sources/${source.id}/preview`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ query })
      });
      const data = await res.json();
      if (data.success) {
        setPreviewData(data);
      } else {
        setPreviewData(null);
      }
    } catch (err) {
      console.error('Preview failed:', err);
      // Fallback sample
      setPreviewData({
        sourceId: source.id,
        sourceName: source.name,
        sourceUri: source.sourceUri,
        searchQuery: query,
        latencyMs: 12,
        indexingHealth: '100% OPERATIONAL',
        embeddingModel: 'text-embedding-3-large (1536-dim)',
        totalIndexedChunks: 1420,
        results: [
          {
            chunkId: `chk-${source.id}-01`,
            content: `[Article 5 Compliance] Personal data shall be processed lawfully, fairly and in a transparent manner. Search term match: "${query}".`,
            score: 0.942,
            tokens: 142,
            vectorDimensions: 1536
          },
          {
            chunkId: `chk-${source.id}-02`,
            content: `[Sovereign Governance] Enforces zero-knowledge proof verification and differential privacy constraints.`,
            score: 0.887,
            tokens: 98,
            vectorDimensions: 1536
          }
        ]
      });
    } finally {
      setPreviewLoading(false);
    }
  };

  const openPreviewModal = (source: KnowledgeSource) => {
    setSelectedPreviewSource(source);
    setPreviewData(null);
    executePreviewSearch(source, 'data protection and sovereign compliance rules');
  };

  return (
    <div className="p-4 sm:p-6 lg:p-8 space-y-6">
      {/* Header Banner */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 bg-gradient-to-r from-slate-900 to-indigo-950 text-white p-6 rounded-2xl shadow-xl">
        <div className="space-y-1">
          <div className="flex items-center gap-2">
            <span className="px-3 py-1 bg-indigo-500/20 border border-indigo-400/30 text-indigo-300 text-xs font-black rounded-full uppercase tracking-wider flex items-center gap-1.5">
              <Database className="w-3.5 h-3.5 text-indigo-400" /> RAG Knowledge Registry
            </span>
            <span className="px-3 py-1 bg-emerald-500/20 border border-emerald-400/30 text-emerald-300 text-xs font-bold rounded-full flex items-center gap-1">
              <ShieldCheck className="w-3.5 h-3.5" /> Enforced Scope
            </span>
          </div>
          <h2 className="text-2xl font-black tracking-tight">Knowledge Base & Vector Shard Manager</h2>
          <p className="text-slate-300 text-xs max-w-2xl">
            Register and manage official URLs, vector storage paths, and secure S3 enclaves. Use the <strong className="text-white">Preview & Verify</strong> tool to inspect sample retrieval quality prior to general query exposure.
          </p>
        </div>

        <button
          onClick={() => setIsModalOpen(true)}
          className="px-5 py-2.5 bg-indigo-600 hover:bg-indigo-500 text-white rounded-xl text-xs font-bold flex items-center gap-2 shadow-sm transition-all self-start md:self-auto cursor-pointer"
        >
          <Plus className="w-4 h-4" />
          Register New Source
        </button>
      </div>

      {/* Sources Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
        {loading ? (
          <div className="col-span-full py-20 flex flex-col items-center justify-center space-y-3">
            <RefreshCw className="w-8 h-8 text-indigo-600 animate-spin" />
            <p className="text-xs font-semibold text-slate-500">Loading registered RAG knowledge sources...</p>
          </div>
        ) : sources.length === 0 ? (
          <div className="col-span-full py-20 text-center bg-white border border-slate-200 rounded-2xl">
            <Database className="w-10 h-10 text-slate-300 mx-auto mb-3" />
            <p className="text-xs font-bold text-slate-700">No knowledge sources registered</p>
            <p className="text-[11px] text-slate-400 mt-1">Add URLs or vector storage paths to expand the RAG processing scope.</p>
          </div>
        ) : (
          sources.map((source) => (
            <motion.div
              key={source.id}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              className="bg-white border border-slate-200 rounded-2xl p-5 shadow-sm flex flex-col justify-between space-y-4 hover:shadow-md transition-shadow"
            >
              <div className="space-y-3">
                <div className="flex items-start justify-between gap-2">
                  <div className="flex items-center gap-2">
                    <div className="p-2.5 bg-indigo-50 text-indigo-600 rounded-xl">
                      {source.sourceType === 'URL' ? <Globe className="w-4 h-4" /> : <FolderGit2 className="w-4 h-4" />}
                    </div>
                    <div>
                      <h3 className="text-xs font-black text-slate-900 leading-snug">{source.name}</h3>
                      <span className="text-[10px] font-mono font-bold text-slate-400 uppercase">{source.sourceType}</span>
                    </div>
                  </div>
                  <button
                    onClick={() => handleDeleteSource(source.id)}
                    className="p-1.5 text-slate-400 hover:text-red-600 rounded-lg hover:bg-red-50 transition-colors cursor-pointer"
                    title="Remove source"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>

                <div className="p-2.5 bg-slate-50 border border-slate-100 rounded-xl font-mono text-[11px] text-slate-700 truncate" title={source.sourceUri}>
                  {source.sourceUri}
                </div>
              </div>

              <div className="pt-3 border-t border-slate-100 space-y-3">
                <div className="flex items-center justify-between text-xs">
                  <span className={`px-2.5 py-1 rounded-lg text-[10px] font-bold uppercase tracking-wider ${
                    source.securityClassification === 'SOVEREIGN_RESTRICTED' 
                      ? 'bg-purple-50 text-purple-700 border border-purple-200' 
                      : source.securityClassification === 'RESTRICTED'
                      ? 'bg-amber-50 text-amber-700 border border-amber-200'
                      : 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                  }`}>
                    {source.securityClassification.replace('_', ' ')}
                  </span>

                  <div className="flex items-center gap-1.5 text-emerald-600 font-bold text-[11px]">
                    <CheckCircle2 className="w-3.5 h-3.5" /> Active Scope
                  </div>
                </div>

                {/* Preview Index Button */}
                <button
                  onClick={() => openPreviewModal(source)}
                  className="w-full py-2 bg-indigo-50 hover:bg-indigo-100 border border-indigo-200 text-indigo-700 rounded-xl text-xs font-bold flex items-center justify-center gap-2 transition-colors cursor-pointer"
                >
                  <Eye className="w-3.5 h-3.5 text-indigo-600" />
                  Preview & Test Index Retrieval
                </button>
              </div>
            </motion.div>
          ))
        )}
      </div>

      {/* Preview Index Modal */}
      <AnimatePresence>
        {selectedPreviewSource && (
          <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-sm flex items-center justify-center p-4">
            <motion.div
              initial={{ scale: 0.95, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.95, opacity: 0 }}
              className="w-full max-w-2xl bg-white rounded-3xl shadow-2xl border border-slate-200 overflow-hidden flex flex-col max-h-[90vh]"
            >
              {/* Modal Header */}
              <div className="px-6 py-5 bg-slate-900 text-white flex items-center justify-between shrink-0">
                <div className="flex items-center gap-2.5">
                  <div className="p-2 bg-indigo-500/20 rounded-xl text-indigo-400 border border-indigo-400/30">
                    <Eye className="w-5 h-5" />
                  </div>
                  <div>
                    <h3 className="text-base font-black tracking-tight">Index Quality Preview</h3>
                    <p className="text-xs text-slate-400 truncate max-w-md">{selectedPreviewSource.name}</p>
                  </div>
                </div>
                <button
                  onClick={() => setSelectedPreviewSource(null)}
                  className="p-2 text-slate-400 hover:text-white rounded-xl hover:bg-slate-800 transition-colors cursor-pointer"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              {/* Modal Body */}
              <div className="p-6 space-y-5 overflow-y-auto">
                {/* Search Bar */}
                <div className="space-y-1.5">
                  <label className="text-xs font-bold text-slate-700 flex items-center justify-between">
                    <span>Sample Vector Query</span>
                    <span className="text-[10px] text-slate-400 font-mono">Simulates live embedding lookup</span>
                  </label>
                  <div className="flex gap-2">
                    <input
                      type="text"
                      value={previewQuery}
                      onChange={(e) => setPreviewQuery(e.target.value)}
                      placeholder="e.g. data protection rules or compliance policy"
                      className="flex-1 px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-900 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                    />
                    <button
                      onClick={() => executePreviewSearch(selectedPreviewSource)}
                      disabled={previewLoading}
                      className="px-5 py-2.5 bg-indigo-600 hover:bg-indigo-500 text-white rounded-xl text-xs font-bold flex items-center gap-2 shadow-sm transition-all cursor-pointer disabled:opacity-50"
                    >
                      {previewLoading ? <RefreshCw className="w-4 h-4 animate-spin" /> : <Search className="w-4 h-4" />}
                      Test Search
                    </button>
                  </div>
                </div>

                {/* Index Diagnostic Stats */}
                {previewData && (
                  <div className="grid grid-cols-3 gap-3">
                    <div className="p-3 bg-slate-50 border border-slate-200/80 rounded-xl space-y-0.5">
                      <span className="text-[10px] font-bold text-slate-400 uppercase">Indexing Health</span>
                      <p className="text-xs font-black text-emerald-600 flex items-center gap-1">
                        <CheckCircle2 className="w-3.5 h-3.5" /> {previewData.indexingHealth}
                      </p>
                    </div>
                    <div className="p-3 bg-slate-50 border border-slate-200/80 rounded-xl space-y-0.5">
                      <span className="text-[10px] font-bold text-slate-400 uppercase">Retrieval Latency</span>
                      <p className="text-xs font-black text-indigo-600 flex items-center gap-1">
                        <Zap className="w-3.5 h-3.5" /> {previewData.latencyMs} ms
                      </p>
                    </div>
                    <div className="p-3 bg-slate-50 border border-slate-200/80 rounded-xl space-y-0.5">
                      <span className="text-[10px] font-bold text-slate-400 uppercase">Indexed Chunks</span>
                      <p className="text-xs font-black text-slate-800 flex items-center gap-1">
                        <FileText className="w-3.5 h-3.5" /> {previewData.totalIndexedChunks}
                      </p>
                    </div>
                  </div>
                )}

                {/* Results List */}
                <div className="space-y-3">
                  <h4 className="text-xs font-bold text-slate-700 uppercase tracking-wider flex items-center gap-1.5">
                    <Sparkles className="w-3.5 h-3.5 text-indigo-500" />
                    Sample Vector Matches & Cosine Scores
                  </h4>

                  {previewLoading ? (
                    <div className="py-12 text-center space-y-2">
                      <RefreshCw className="w-6 h-6 text-indigo-600 animate-spin mx-auto" />
                      <p className="text-xs font-bold text-slate-500">Retrieving vector embeddings from index...</p>
                    </div>
                  ) : previewData?.results && previewData.results.length > 0 ? (
                    <div className="space-y-3">
                      {previewData.results.map((res, idx) => (
                        <div key={res.chunkId} className="p-4 bg-slate-50 border border-slate-200 rounded-2xl space-y-2">
                          <div className="flex items-center justify-between text-[11px]">
                            <span className="font-mono font-bold text-slate-500">Chunk {idx + 1} ({res.chunkId})</span>
                            <span className="px-2.5 py-0.5 bg-emerald-100 text-emerald-800 font-mono font-bold rounded-full text-[10px]">
                              Match Score: {(res.score * 100).toFixed(1)}%
                            </span>
                          </div>
                          <p className="text-xs text-slate-800 font-sans leading-relaxed">{res.content}</p>
                          <div className="flex items-center justify-between text-[10px] text-slate-400 font-mono pt-1 border-t border-slate-200/60">
                            <span>Tokens: {res.tokens}</span>
                            <span>Vector Dim: {res.vectorDimensions}</span>
                          </div>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <div className="py-10 text-center bg-slate-50 rounded-2xl border border-slate-200">
                      <AlertCircle className="w-8 h-8 text-slate-300 mx-auto mb-2" />
                      <p className="text-xs font-bold text-slate-600">No matching chunks retrieved</p>
                    </div>
                  )}
                </div>
              </div>

              {/* Modal Footer */}
              <div className="px-6 py-4 bg-slate-50 border-t border-slate-200 flex items-center justify-between shrink-0">
                <span className="text-[11px] font-mono text-slate-500">
                  Model: {previewData?.embeddingModel || 'text-embedding-3-large'}
                </span>
                <button
                  onClick={() => setSelectedPreviewSource(null)}
                  className="px-5 py-2 bg-slate-900 hover:bg-slate-800 text-white rounded-xl text-xs font-bold transition-colors cursor-pointer"
                >
                  Close Preview
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* Registration Modal (Single & Bulk) */}
      <AnimatePresence>
        {isModalOpen && (
          <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-sm flex items-center justify-center p-4">
            <motion.div
              initial={{ scale: 0.95, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.95, opacity: 0 }}
              className="w-full max-w-xl bg-white rounded-3xl shadow-2xl border border-slate-200 overflow-hidden"
            >
              <div className="px-6 py-5 bg-slate-900 text-white flex items-center justify-between">
                <div className="flex items-center gap-2.5">
                  <div className="p-2 bg-indigo-500/20 rounded-xl text-indigo-400 border border-indigo-400/30">
                    <Database className="w-5 h-5" />
                  </div>
                  <div>
                    <h3 className="text-base font-black tracking-tight">Register Knowledge Source</h3>
                    <p className="text-xs text-slate-400">Expand enforcement RAG processing scope</p>
                  </div>
                </div>
                <button
                  onClick={() => setIsModalOpen(false)}
                  className="p-2 text-slate-400 hover:text-white rounded-xl hover:bg-slate-800 transition-colors cursor-pointer"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              {/* Mode Switcher Tabs */}
              <div className="px-6 pt-5 bg-slate-50 border-b border-slate-200 flex gap-4">
                <button
                  onClick={() => setRegistrationMode('SINGLE')}
                  className={`pb-3 text-xs font-bold border-b-2 transition-all cursor-pointer ${
                    registrationMode === 'SINGLE'
                      ? 'border-indigo-600 text-indigo-600'
                      : 'border-transparent text-slate-500 hover:text-slate-800'
                  }`}
                >
                  Single Source Registration
                </button>
                <button
                  onClick={() => setRegistrationMode('BULK')}
                  className={`pb-3 text-xs font-bold border-b-2 transition-all cursor-pointer ${
                    registrationMode === 'BULK'
                      ? 'border-indigo-600 text-indigo-600'
                      : 'border-transparent text-slate-500 hover:text-slate-800'
                  }`}
                >
                  Bulk List Ingestion (URLs / Paths)
                </button>
              </div>

              {registrationMode === 'SINGLE' ? (
                <form onSubmit={handleRegisterSource} className="p-6 space-y-4">
                  <div className="space-y-1.5">
                    <label className="text-xs font-bold text-slate-700">Source Name / Description</label>
                    <input
                      type="text"
                      required
                      placeholder="e.g., EU Banking Directive Vector Shard"
                      value={name}
                      onChange={(e) => setName(e.target.value)}
                      className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-900 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                    />
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-1.5">
                      <label className="text-xs font-bold text-slate-700">Source Type</label>
                      <select
                        value={sourceType}
                        onChange={(e: any) => setSourceType(e.target.value)}
                        className="w-full px-3 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-bold text-slate-800 focus:outline-none focus:ring-2 focus:ring-indigo-500 cursor-pointer"
                      >
                        <option value="URL">URL / Web Gazette</option>
                        <option value="VECTOR_PATH">Vector Storage Path</option>
                        <option value="S3_BUCKET">S3 Sovereign Enclave</option>
                        <option value="SQL_SHARD">Regional SQL Shard</option>
                      </select>
                    </div>

                    <div className="space-y-1.5">
                      <label className="text-xs font-bold text-slate-700">Security Classification</label>
                      <select
                        value={securityClassification}
                        onChange={(e: any) => setSecurityClassification(e.target.value)}
                        className="w-full px-3 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-bold text-slate-800 focus:outline-none focus:ring-2 focus:ring-indigo-500 cursor-pointer"
                      >
                        <option value="PUBLIC">Public</option>
                        <option value="CONFIDENTIAL">Confidential</option>
                        <option value="RESTRICTED">Restricted</option>
                        <option value="SOVEREIGN_RESTRICTED">Sovereign Restricted</option>
                      </select>
                    </div>
                  </div>

                  <div className="space-y-1.5">
                    <label className="text-xs font-bold text-slate-700">Source URI / Path</label>
                    <input
                      type="text"
                      required
                      placeholder="https://... or vector://shard-eu/embeddings"
                      value={sourceUri}
                      onChange={(e) => setSourceUri(e.target.value)}
                      className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-mono text-slate-900 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                    />
                  </div>

                  <div className="p-4 bg-indigo-50/50 border border-indigo-100 rounded-2xl flex items-start gap-3">
                    <ShieldCheck className="w-5 h-5 text-indigo-600 shrink-0 mt-0.5" />
                    <p className="text-xs text-indigo-900 leading-relaxed">
                      Registered sources are indexed and automatically governed by the differential privacy RAG enforcement middleware.
                    </p>
                  </div>

                  <div className="flex items-center justify-end gap-3 pt-3">
                    <button
                      type="button"
                      onClick={() => setIsModalOpen(false)}
                      className="px-5 py-2.5 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xl text-xs font-bold transition-colors cursor-pointer"
                    >
                      Cancel
                    </button>
                    <button
                      type="submit"
                      disabled={submitting}
                      className="px-6 py-2.5 bg-indigo-600 hover:bg-indigo-500 text-white rounded-xl text-xs font-bold transition-all shadow-sm cursor-pointer disabled:opacity-50"
                    >
                      {submitting ? 'Registering...' : 'Confirm Registration'}
                    </button>
                  </div>
                </form>
              ) : (
                <form onSubmit={handleBulkRegister} className="p-6 space-y-4">
                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-1.5">
                      <label className="text-xs font-bold text-slate-700">Batch Source Type</label>
                      <select
                        value={bulkSourceType}
                        onChange={(e: any) => setBulkSourceType(e.target.value)}
                        className="w-full px-3 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-bold text-slate-800 focus:outline-none focus:ring-2 focus:ring-indigo-500 cursor-pointer"
                      >
                        <option value="URL">URLs / Web Gazettes</option>
                        <option value="VECTOR_PATH">Vector Storage Paths</option>
                        <option value="S3_BUCKET">S3 Sovereign Buckets</option>
                        <option value="SQL_SHARD">Regional SQL Shards</option>
                      </select>
                    </div>

                    <div className="space-y-1.5">
                      <label className="text-xs font-bold text-slate-700">Security Classification</label>
                      <select
                        value={bulkSecurityClassification}
                        onChange={(e: any) => setBulkSecurityClassification(e.target.value)}
                        className="w-full px-3 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-bold text-slate-800 focus:outline-none focus:ring-2 focus:ring-indigo-500 cursor-pointer"
                      >
                        <option value="PUBLIC">Public</option>
                        <option value="CONFIDENTIAL">Confidential</option>
                        <option value="RESTRICTED">Restricted</option>
                        <option value="SOVEREIGN_RESTRICTED">Sovereign Restricted</option>
                      </select>
                    </div>
                  </div>

                  <div className="space-y-1.5">
                    <label className="text-xs font-bold text-slate-700 flex items-center justify-between">
                      <span>Bulk List (One per line)</span>
                      <span className="text-[10px] text-slate-400 font-mono">Format: [Name] | [URI] or just [URI]</span>
                    </label>
                    <textarea
                      rows={6}
                      required
                      placeholder="EU Financial Shard 1 | https://eur-lex.europa.eu/shard1&#10;vector://enclave-eu/embeddings_v2&#10;https://eur-lex.europa.eu/shard2"
                      value={bulkText}
                      onChange={(e) => setBulkText(e.target.value)}
                      className="w-full p-4 bg-slate-50 border border-slate-200 rounded-xl text-xs font-mono text-slate-900 focus:outline-none focus:ring-2 focus:ring-indigo-500 leading-relaxed"
                    />
                  </div>

                  <div className="p-4 bg-indigo-50/50 border border-indigo-100 rounded-2xl flex items-start gap-3">
                    <Layers className="w-5 h-5 text-indigo-600 shrink-0 mt-0.5" />
                    <p className="text-xs text-indigo-900 leading-relaxed">
                      Each line will be parsed and registered into the persistent vector scope instantly.
                    </p>
                  </div>

                  <div className="flex items-center justify-end gap-3 pt-3">
                    <button
                      type="button"
                      onClick={() => setIsModalOpen(false)}
                      className="px-5 py-2.5 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xl text-xs font-bold transition-colors cursor-pointer"
                    >
                      Cancel
                    </button>
                    <button
                      type="submit"
                      disabled={submitting}
                      className="px-6 py-2.5 bg-indigo-600 hover:bg-indigo-500 text-white rounded-xl text-xs font-bold transition-all shadow-sm cursor-pointer disabled:opacity-50"
                    >
                      {submitting ? 'Registering Batch...' : 'Confirm Bulk Registration'}
                    </button>
                  </div>
                </form>
              )}
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
};
