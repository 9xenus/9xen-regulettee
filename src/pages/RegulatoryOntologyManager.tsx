import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import {
  Database, Shield, BookOpen, AlertCircle, History,
  CheckCircle2, FileText, Globe, Key, Scale, Plus, Settings
} from 'lucide-react';
import { fetchWithRetry } from '../lib/api-client';

interface Obligation {
  obligation_id: string;
  source_regulation: string;
  article_ref: string;
  title: string;
  description: string;
  applicable_industries: string[];
  evidence_required: string[];
  penalty_range: string;
  effective_date: string;
  status: string;
  version: string;
  verified_by?: string;
  verified_at?: string;
}

export function RegulatoryOntologyManager() {
  const [obligations, setObligations] = useState<Obligation[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedObligation, setSelectedObligation] = useState<Obligation | null>(null);
  const [activeTab, setActiveTab] = useState<'details' | 'interpretations' | 'history'>('details');

  const [interpretations, setInterpretations] = useState<any[]>([]);
  const [history, setHistory] = useState<any[]>([]);
  const [showVerifyModal, setShowVerifyModal] = useState(false);
  const [verifyNotes, setVerifyNotes] = useState('');
  const [verifyTitle, setVerifyTitle] = useState('');
  const [verifyDesc, setVerifyDesc] = useState('');

  useEffect(() => {
    loadObligations();
  }, []);

  const loadObligations = async () => {
    setLoading(true);
    try {
      const res = await fetchWithRetry('/api/v1/regulatory/ontology/obligations');
      const data = await res.json();
      if (data && data.data) {
        setObligations(data.data);
      }
    } catch (err) {
      console.error('Failed to load obligations:', err);
    } finally {
      setLoading(false);
    }
  };

  const loadObligationDetails = async (id: string) => {
    try {
      const res = await fetchWithRetry(`/api/v1/regulatory/ontology/obligations/${id}`);
      const data = await res.json();
      if (data && data.data) {
        setInterpretations(data.data.interpretations || []);
        setHistory(data.data.history || []);
        setVerifyTitle(data.data.title);
        setVerifyDesc(data.data.description);
      }
    } catch (err) {
      console.error('Failed to load obligation details:', err);
    }
  };

  const handleSelect = (obl: Obligation) => {
    setSelectedObligation(obl);
    loadObligationDetails(obl.obligation_id);
    setActiveTab('details');
  };

  const handleVerify = async () => {
    if (!selectedObligation) return;
    try {
      await fetchWithRetry('/api/v1/regulatory/ontology/verify', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          obligation_id: selectedObligation.obligation_id,
          reviewer_name: 'Super Admin (Current User)',
          notes: verifyNotes,
          approved_title: verifyTitle,
          approved_description: verifyDesc,
          new_version: 'v2.0'
        })
      });
      setShowVerifyModal(false);
      loadObligations();
      loadObligationDetails(selectedObligation.obligation_id);
      
      const updated = { ...selectedObligation, status: 'HUMAN_VERIFIED', title: verifyTitle, description: verifyDesc };
      setSelectedObligation(updated);
    } catch (err) {
      console.error('Verification failed', err);
    }
  };

  return (
    <div className="p-6 max-w-7xl mx-auto space-y-6">
      <div className="flex justify-between items-center mb-6">
        <div>
          <h1 className="text-2xl font-black text-slate-900 dark:text-white flex items-center gap-2">
            <Database className="w-6 h-6 text-indigo-600" />
            Regulatory Ontology & Moat Engine
          </h1>
          <p className="text-slate-500 mt-1">Structured, verified, industry-mapped knowledge asset management.</p>
        </div>
        <button className="px-4 py-2 bg-indigo-600 text-white rounded-lg font-semibold flex items-center gap-2">
          <Plus className="w-4 h-4" />
          Add Draft Obligation
        </button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-1 border border-slate-200 dark:border-slate-800 rounded-xl bg-white dark:bg-slate-900 overflow-hidden flex flex-col h-[800px]">
          <div className="p-4 border-b border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-800/50">
            <h2 className="font-bold text-slate-800 dark:text-slate-200 flex items-center gap-2">
              <BookOpen className="w-4 h-4" />
              Extracted Obligations
            </h2>
          </div>
          <div className="overflow-y-auto flex-1 p-2 space-y-2">
            {loading ? (
              <div className="p-4 text-center text-slate-500">Loading ontology...</div>
            ) : (
              obligations.map(obl => (
                <button
                  key={obl.obligation_id}
                  onClick={() => handleSelect(obl)}
                  className={`w-full text-left p-3 rounded-lg border transition-all ${
                    selectedObligation?.obligation_id === obl.obligation_id 
                    ? 'border-indigo-500 bg-indigo-50 dark:bg-indigo-900/20' 
                    : 'border-slate-100 dark:border-slate-800 hover:border-slate-300'
                  }`}
                >
                  <div className="flex justify-between items-start mb-1">
                    <span className="text-xs font-bold px-2 py-0.5 rounded-full bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300">
                      {obl.source_regulation}
                    </span>
                    <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${
                      obl.status === 'HUMAN_VERIFIED' ? 'bg-emerald-100 text-emerald-700' : 'bg-amber-100 text-amber-700'
                    }`}>
                      {obl.status}
                    </span>
                  </div>
                  <h3 className="font-bold text-sm text-slate-800 dark:text-slate-200 truncate">{obl.title}</h3>
                  <p className="text-xs text-slate-500 mt-1 truncate">{obl.article_ref}</p>
                </button>
              ))
            )}
          </div>
        </div>

        <div className="lg:col-span-2 border border-slate-200 dark:border-slate-800 rounded-xl bg-white dark:bg-slate-900 overflow-hidden flex flex-col h-[800px]">
          {selectedObligation ? (
            <>
              <div className="border-b border-slate-200 dark:border-slate-800 p-4 bg-slate-50 dark:bg-slate-800/50 flex justify-between items-center">
                <div>
                  <h2 className="text-xl font-bold text-slate-900 dark:text-white">
                    {selectedObligation.title}
                  </h2>
                  <div className="flex gap-2 mt-2">
                    <span className="text-xs font-mono text-slate-500 bg-slate-100 dark:bg-slate-800 px-2 py-1 rounded">
                      {selectedObligation.source_regulation} - {selectedObligation.article_ref}
                    </span>
                    <span className="text-xs font-mono text-slate-500 bg-slate-100 dark:bg-slate-800 px-2 py-1 rounded">
                      Version: {selectedObligation.version}
                    </span>
                  </div>
                </div>
                {selectedObligation.status !== 'HUMAN_VERIFIED' && (
                  <button 
                    onClick={() => setShowVerifyModal(true)}
                    className="px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg font-bold text-sm shadow-sm flex items-center gap-2 transition-all"
                  >
                    <CheckCircle2 className="w-4 h-4" />
                    Expert Verify
                  </button>
                )}
              </div>

              <div className="flex border-b border-slate-200 dark:border-slate-800">
                {['details', 'interpretations', 'history'].map(tab => (
                  <button
                    key={tab}
                    onClick={() => setActiveTab(tab as any)}
                    className={`px-6 py-3 text-sm font-bold border-b-2 transition-colors ${
                      activeTab === tab 
                      ? 'border-indigo-600 text-indigo-600 dark:text-indigo-400' 
                      : 'border-transparent text-slate-500 hover:text-slate-700 dark:hover:text-slate-300'
                    }`}
                  >
                    {tab.charAt(0).toUpperCase() + tab.slice(1)}
                  </button>
                ))}
              </div>

              <div className="p-6 overflow-y-auto flex-1">
                {activeTab === 'details' && (
                  <div className="space-y-6">
                    <div>
                      <h3 className="text-sm font-bold text-slate-400 uppercase tracking-wider mb-2">Legal Text / Description</h3>
                      <p className="text-slate-700 dark:text-slate-300 leading-relaxed bg-slate-50 dark:bg-slate-800/30 p-4 rounded-xl border border-slate-100 dark:border-slate-800">
                        {selectedObligation.description}
                      </p>
                    </div>

                    <div className="grid grid-cols-2 gap-6">
                      <div>
                        <h3 className="text-sm font-bold text-slate-400 uppercase tracking-wider mb-2 flex items-center gap-1">
                          <Globe className="w-4 h-4" /> Applicable Industries
                        </h3>
                        <div className="flex flex-wrap gap-2">
                          {selectedObligation.applicable_industries?.map(ind => (
                            <span key={ind} className="px-2.5 py-1 rounded-md bg-indigo-50 dark:bg-indigo-900/30 text-indigo-700 dark:text-indigo-300 text-xs font-bold border border-indigo-100 dark:border-indigo-800">
                              {ind}
                            </span>
                          ))}
                        </div>
                      </div>
                      <div>
                        <h3 className="text-sm font-bold text-slate-400 uppercase tracking-wider mb-2 flex items-center gap-1">
                          <FileText className="w-4 h-4" /> Evidence Required
                        </h3>
                        <div className="flex flex-wrap gap-2">
                          {selectedObligation.evidence_required?.map(ev => (
                            <span key={ev} className="px-2.5 py-1 rounded-md bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 text-xs font-bold border border-slate-200 dark:border-slate-700">
                              {ev.replace(/_/g, ' ')}
                            </span>
                          ))}
                        </div>
                      </div>
                    </div>

                    <div>
                      <h3 className="text-sm font-bold text-slate-400 uppercase tracking-wider mb-2 flex items-center gap-1">
                        <AlertCircle className="w-4 h-4" /> Penalty Range
                      </h3>
                      <div className="p-4 rounded-xl bg-red-50 dark:bg-red-900/10 border border-red-100 dark:border-red-900/30 text-red-800 dark:text-red-400 text-sm font-semibold">
                        {selectedObligation.penalty_range}
                      </div>
                    </div>

                    {selectedObligation.verified_by && (
                      <div className="p-4 rounded-xl bg-emerald-50 dark:bg-emerald-900/10 border border-emerald-100 dark:border-emerald-900/30">
                        <h4 className="text-sm font-bold text-emerald-800 dark:text-emerald-400 flex items-center gap-2">
                          <Shield className="w-4 h-4" />
                          Human Expert Verification
                        </h4>
                        <p className="text-xs text-emerald-600 dark:text-emerald-500 mt-1">
                          Verified by <strong>{selectedObligation.verified_by}</strong> on {new Date(selectedObligation.verified_at!).toLocaleDateString()}
                        </p>
                      </div>
                    )}
                  </div>
                )}

                {activeTab === 'interpretations' && (
                  <div className="space-y-4">
                    <div className="flex justify-between items-center mb-4">
                      <h3 className="text-sm font-bold text-slate-400 uppercase tracking-wider">Country/Regulator Interpretations</h3>
                      <button className="text-xs font-bold text-indigo-600 hover:text-indigo-700 flex items-center gap-1">
                        <Plus className="w-3 h-3" /> Add Interpretation
                      </button>
                    </div>
                    {interpretations.length === 0 ? (
                      <p className="text-slate-500 text-sm text-center py-8">No specific regional interpretations mapped yet.</p>
                    ) : (
                      interpretations.map(interp => (
                        <div key={interp.interpretation_id} className="p-4 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800/50">
                          <div className="flex justify-between items-start mb-2">
                            <h4 className="font-bold text-slate-800 dark:text-slate-200">{interp.guidance_title}</h4>
                            <span className="text-xs font-bold px-2 py-1 rounded bg-slate-100 dark:bg-slate-700 text-slate-600 dark:text-slate-300">
                              {interp.regulator_name} ({interp.jurisdiction})
                            </span>
                          </div>
                          <p className="text-sm text-slate-600 dark:text-slate-400 leading-relaxed mb-3">
                            {interp.guidance_summary}
                          </p>
                          {interp.stricter_than_eu_baseline === 1 && (
                            <span className="inline-flex items-center gap-1 text-xs font-bold text-red-600 bg-red-50 dark:bg-red-900/20 px-2 py-1 rounded-md border border-red-100 dark:border-red-900/50">
                              <AlertCircle className="w-3 h-3" /> Stricter than EU baseline
                            </span>
                          )}
                        </div>
                      ))
                    )}
                  </div>
                )}

                {activeTab === 'history' && (
                  <div className="space-y-4">
                    <h3 className="text-sm font-bold text-slate-400 uppercase tracking-wider mb-4">Version History & Change Log</h3>
                    {history.length === 0 ? (
                      <p className="text-slate-500 text-sm text-center py-8">No history recorded yet.</p>
                    ) : (
                      <div className="relative border-l-2 border-slate-200 dark:border-slate-700 ml-3 space-y-6">
                        {history.map(item => (
                          <div key={item.history_id} className="relative pl-6">
                            <div className="absolute -left-[9px] top-1 w-4 h-4 rounded-full bg-slate-200 dark:bg-slate-700 border-2 border-white dark:border-slate-900"></div>
                            <div className="mb-1 flex items-center justify-between">
                              <span className="text-xs font-bold text-indigo-600 dark:text-indigo-400">{item.version_number}</span>
                              <span className="text-xs text-slate-500">{new Date(item.changed_at).toLocaleString()}</span>
                            </div>
                            <h4 className="text-sm font-bold text-slate-800 dark:text-slate-200">{item.change_type}</h4>
                            <p className="text-sm text-slate-600 dark:text-slate-400 mt-1">{item.change_summary}</p>
                            <p className="text-xs text-slate-500 mt-2">By: {item.changed_by}</p>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                )}
              </div>
            </>
          ) : (
            <div className="flex flex-col items-center justify-center h-full text-slate-400">
              <Database className="w-12 h-12 mb-4 opacity-20" />
              <p>Select an obligation to view details</p>
            </div>
          )}
        </div>
      </div>

      {showVerifyModal && selectedObligation && (
        <div className="fixed inset-0 z-50 bg-slate-900/50 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white dark:bg-slate-900 rounded-2xl w-full max-w-2xl overflow-hidden shadow-2xl border border-slate-200 dark:border-slate-800">
            <div className="p-6 border-b border-slate-200 dark:border-slate-800 flex justify-between items-center">
              <h3 className="text-lg font-bold text-slate-900 dark:text-white flex items-center gap-2">
                <Shield className="w-5 h-5 text-emerald-500" />
                Human Expert Verification
              </h3>
              <button onClick={() => setShowVerifyModal(false)} className="text-slate-400 hover:text-slate-600">✕</button>
            </div>
            <div className="p-6 space-y-4">
              <p className="text-sm text-slate-600 dark:text-slate-400">
                Review and refine the AI-extracted obligation before committing it to the authoritative ontology.
              </p>
              
              <div>
                <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-1">Refined Title</label>
                <input 
                  type="text" 
                  value={verifyTitle}
                  onChange={e => setVerifyTitle(e.target.value)}
                  className="w-full px-4 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg text-sm text-slate-900 dark:text-white"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-1">Refined Legal Description</label>
                <textarea 
                  rows={5}
                  value={verifyDesc}
                  onChange={e => setVerifyDesc(e.target.value)}
                  className="w-full px-4 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg text-sm text-slate-900 dark:text-white leading-relaxed"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-1">Verification Notes / Citations</label>
                <input 
                  type="text" 
                  placeholder="e.g. Cross-checked with EDPB Guidelines 04/2021"
                  value={verifyNotes}
                  onChange={e => setVerifyNotes(e.target.value)}
                  className="w-full px-4 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg text-sm text-slate-900 dark:text-white"
                />
              </div>
            </div>
            <div className="p-6 border-t border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-800/50 flex justify-end gap-3">
              <button 
                onClick={() => setShowVerifyModal(false)}
                className="px-4 py-2 text-sm font-bold text-slate-600 hover:text-slate-800"
              >
                Cancel
              </button>
              <button 
                onClick={handleVerify}
                className="px-6 py-2 bg-emerald-600 hover:bg-emerald-700 text-white text-sm font-bold rounded-lg shadow-sm"
              >
                Approve & Commit to Ontology
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
