import { fetchWithRetry } from '../lib/api-client';
import React, { useState, useEffect } from 'react';
import { RefreshCw, FileText, CheckCircle, ShieldAlert, Database, ChevronDown, ChevronUp, GitCompare } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { DiffViewer } from './DiffViewer';
import { Region, PolicyAct } from '../lib/types';
import { getActsByRegion } from '../lib/policy-store';
import { analyzeAct } from '../lib/ai-regulatory-advisor';

interface Violation {
  ruleId: string;
  description: string;
  severity: 'CRITICAL' | 'WARNING' | 'INFO';
  affectedRecordId: string;
  cite: string;
  forensics: string[];
}

export function GlobalLawSynchronizer() {
  const [mandates, setMandates] = useState<PolicyAct[]>([]);
  const [isSyncing, setIsSyncing] = useState(false);
  const [violations, setViolations] = useState<Violation[]>([]);
  const [expandedViolation, setExpandedViolation] = useState<string | null>(null);
  const [expandedDiff, setExpandedDiff] = useState<string | null>(null);
  const [selectedRegion, setSelectedRegion] = useState<Region>('EU');

  useEffect(() => {
    setMandates(getActsByRegion(selectedRegion));
  }, [selectedRegion]);

  const handleSync = async () => {
    setIsSyncing(true);
    setViolations([]);
    // Simulate API call to proxy
    try {
      const response = await fetchWithRetry('/api/sync-laws', { 
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ region: selectedRegion })
      });
      const data = await response.json();
      if (response.ok) {
        setViolations(data.violations || []);
        // AI Regulatory Advisor
        mandates.forEach(mandate => {
          const suggestion = analyzeAct(mandate);
          if (suggestion) {
            console.log(`[AI_REGULATORY_ADVISOR] ${suggestion.message} Suggestion: ${suggestion.suggestion}`);
          }
        });
      }
    } catch (error) {
      console.error('Sync failed', error);
    } finally {
      setIsSyncing(false);
    }
  };

  return (
    <div className="p-4 sm:p-5 lg:p-6 bg-white rounded-lg shadow-sm border border-gray-100">
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-xl font-semibold flex items-center gap-2">
          <Database className="w-5 h-5 text-indigo-600" />
          Global Law Synchronizer
        </h2>
        <div className="flex items-center gap-3">
          <select 
            value={selectedRegion} 
            onChange={(e) => setSelectedRegion(e.target.value as Region)}
            className="text-sm border-gray-300 rounded-md focus:ring-indigo-500 focus:border-indigo-500"
          >
            <option value="EU">EU</option>
            <option value="USA">USA</option>
            <option value="AUSTRALIA">AUSTRALIA</option>
            <option value="NEW_ZEALAND">NEW_ZEALAND</option>
            <option value="APAC">APAC</option>
          </select>
          <button
            onClick={handleSync}
            disabled={isSyncing}
            className={`px-4 py-2 bg-indigo-600 text-white text-sm font-medium rounded-md hover:bg-indigo-700 transition-colors flex items-center gap-2 ${isSyncing ? 'opacity-50 cursor-not-allowed' : ''}`}
          >
            <RefreshCw className={`w-4 h-4 ${isSyncing ? 'animate-spin' : ''}`} />
            {isSyncing ? 'Syncing...' : 'Sync Now'}
          </button>
        </div>
      </div>

      <div className="space-y-4 sm:space-y-6">
        <div className="space-y-4">
          {mandates.map((mandate) => (
            <div 
              key={mandate.id}
              className="p-4 rounded-md border border-gray-200"
            >
              <div className="flex justify-between items-center">
                <div className="flex items-center gap-3">
                  <FileText className="w-5 h-5 text-gray-400" />
                  <div>
                    <h4 className="font-medium text-gray-900">{mandate.name}</h4>
                    <p className="text-xs text-gray-500">{mandate.region} | v{mandate.version}</p>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  {mandate.diff && (
                    <button 
                      onClick={() => setExpandedDiff(expandedDiff === mandate.id ? null : mandate.id)}
                      className="text-xs flex items-center gap-1 text-indigo-600 hover:text-indigo-800"
                    >
                      <GitCompare className="w-3 h-3" />
                      View Diff
                    </button>
                  )}
                  <div className="text-right">
                    <span className="text-xs text-gray-500 block">Synced: {mandate.lastSynced}</span>
                    <span className="text-green-600 text-xs flex items-center gap-1"><CheckCircle className="w-3 h-3" /> Up to date</span>
                  </div>
                </div>
              </div>
              {mandate.diff && expandedDiff === mandate.id && (
                <DiffViewer diffData={{ added: mandate.added || [], removed: mandate.removed || [] }} />
              )}
            </div>
          ))}
        </div>

        {violations.length > 0 && (
          <div className="border-t border-gray-100 pt-6">
            <h3 className="text-lg font-semibold text-red-600 flex items-center gap-2 mb-4">
              <ShieldAlert className="w-5 h-5" />
              Detected Violations ({violations.length})
            </h3>
            <div className="space-y-4">
              {violations.map((v) => (
                <div key={v.ruleId} className="border border-red-100 rounded-md p-4 bg-red-50">
                  <div 
                    className="flex justify-between items-center cursor-pointer"
                    onClick={() => setExpandedViolation(expandedViolation === v.ruleId ? null : v.ruleId)}
                  >
                    <div>
                      <p className="font-semibold text-red-900">{v.ruleId}: {v.description}</p>
                      <p className="text-sm text-red-700">Affected: {v.affectedRecordId}</p>
                    </div>
                    {expandedViolation === v.ruleId ? <ChevronUp className="w-5 h-5 text-red-600" /> : <ChevronDown className="w-5 h-5 text-red-600" />}
                  </div>
                  
                  <AnimatePresence>
                    {expandedViolation === v.ruleId && (
                      <motion.div 
                        initial={{ opacity: 0, height: 0 }}
                        animate={{ opacity: 1, height: 'auto' }}
                        exit={{ opacity: 0, height: 0 }}
                        className="mt-4 pt-4 border-t border-red-200"
                      >
                        <p className="text-sm font-semibold text-red-800 mb-2">Legal Citation: {v.cite}</p>
                        <div className="bg-white p-3 rounded text-sm text-gray-700 space-y-1">
                          {v.forensics.map((step, idx) => (
                            <p key={idx} className="flex gap-2">
                              <span className="text-indigo-500 font-mono">{idx + 1}.</span> {step}
                            </p>
                          ))}
                        </div>
                      </motion.div>
                    )}
                  </AnimatePresence>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
