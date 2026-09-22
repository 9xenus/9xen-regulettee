import { fetchWithRetry } from '../lib/api-client';
import React, { useState, useEffect } from 'react';
import { Shield, Database, RefreshCw, CheckCircle, AlertTriangle, Play, FileText } from 'lucide-react';
import { Card, CardHeader, CardTitle, CardContent } from '../components/ui/Card';

export function QuantumProtectionEngine() {
  const [policies, setPolicies] = useState<any[]>([]);
  const [reports, setReports] = useState<any[]>([]);
  const [loadingPolicies, setLoadingPolicies] = useState(false);
  const [loadingScan, setLoadingScan] = useState(false);
  const [activeTab, setActiveTab] = useState<'policies' | 'scan'>('policies');

  useEffect(() => {
    fetchPolicies();
    fetchReports();
  }, []);

  const fetchPolicies = async () => {
    try {
      const res = await fetchWithRetry('/api/v1/quantum-protection/policies');
      const data = await res.json();
      if (data.success) setPolicies(data.policies || []);
    } catch (e) {
      console.error(e);
    }
  };

  const fetchReports = async () => {
    try {
      const res = await fetchWithRetry('/api/v1/quantum-protection/reports');
      const data = await res.json();
      if (data.success) setReports(data.reports || []);
    } catch (e) {
      console.error(e);
    }
  };

  const syncPolicies = async () => {
    setLoadingPolicies(true);
    try {
      await fetchWithRetry('/api/v1/quantum-protection/fetch-policies', { method: 'POST' });
      await fetchPolicies();
    } catch (e) {
      console.error(e);
    } finally {
      setLoadingPolicies(false);
    }
  };

  const runScan = async () => {
    setLoadingScan(true);
    try {
      const res = await fetchWithRetry('/api/v1/quantum-protection/scan-and-fix', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ tenantId: 'all' })
      });
      const data = await res.json();
      if (data.success) {
        await fetchReports();
      }
    } catch (e) {
      console.error(e);
    } finally {
      setLoadingScan(false);
    }
  };

  return (
    <div className="p-5 sm:p-6 lg:p-8 max-w-7xl mx-auto space-y-5 sm:space-y-8">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-slate-900 flex items-center gap-2">
            <Shield className="w-8 h-8 text-indigo-600" />
            Quantum Protection Engine
          </h1>
          <p className="text-slate-500 mt-1">SaaS Admin Control Center for Quantum Cryptography Policies and Auto-remediation</p>
        </div>
        <div className="flex bg-slate-100 p-1 rounded-lg">
          <button 
            onClick={() => setActiveTab('policies')}
            className={`px-4 py-2 rounded-md text-sm font-medium transition-colors ${activeTab === 'policies' ? 'bg-white text-indigo-600 shadow' : 'text-slate-600 hover:text-slate-900'}`}
          >
            Policy Law Engine
          </button>
          <button 
            onClick={() => setActiveTab('scan')}
            className={`px-4 py-2 rounded-md text-sm font-medium transition-colors ${activeTab === 'scan' ? 'bg-white text-indigo-600 shadow' : 'text-slate-600 hover:text-slate-900'}`}
          >
            Scan & Auto-Fix
          </button>
        </div>
      </div>

      {activeTab === 'policies' && (
        <Card>
          <CardHeader className="flex flex-row items-center justify-between border-b pb-4">
            <div>
              <CardTitle>EUR-Lex Policy Sync</CardTitle>
              <p className="text-sm text-slate-500">Auto-fetch latest quantum cryptography compliance laws.</p>
            </div>
            <button
              onClick={syncPolicies}
              disabled={loadingPolicies}
              className="flex items-center gap-2 px-4 py-2 bg-indigo-600 text-white rounded-md text-sm hover:bg-indigo-700 disabled:opacity-50"
            >
              <RefreshCw className={`w-4 h-4 ${loadingPolicies ? 'animate-spin' : ''}`} />
              Sync Policies
            </button>
          </CardHeader>
          <CardContent className="pt-6">
            {policies.length === 0 ? (
              <div className="text-center py-12 text-slate-500">
                <Database className="w-12 h-12 mx-auto mb-4 text-slate-300" />
                <p>No policies synced yet. Click "Sync Policies" to fetch from EUR-Lex.</p>
              </div>
            ) : (
              <div className="space-y-4">
                {policies.map(p => (
                  <div key={p.id} className="p-4 border rounded-lg bg-slate-50 flex justify-between items-start">
                    <div>
                      <div className="flex items-center gap-2 mb-1">
                        <span className="bg-indigo-100 text-indigo-800 text-xs px-2 py-0.5 rounded font-mono">{p.celex_number}</span>
                        <h3 className="font-semibold text-slate-800">{p.title}</h3>
                      </div>
                      <p className="text-sm text-slate-600">{p.summary}</p>
                    </div>
                    <div className="text-right">
                      <span className="inline-flex items-center gap-1 text-xs font-medium text-emerald-600 bg-emerald-50 px-2 py-1 rounded-full border border-emerald-100">
                        <CheckCircle className="w-3 h-3" />
                        {p.status.toUpperCase()}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      )}

      {activeTab === 'scan' && (
        <div className="space-y-4 sm:space-y-6">
          <Card>
            <CardHeader className="border-b pb-4">
              <div className="flex justify-between items-center">
                <div>
                  <CardTitle>Quantum Compliance Scan</CardTitle>
                  <p className="text-sm text-slate-500">Scan infrastructure, detect violations, estimate penalties, and apply auto-fixes.</p>
                </div>
                <button
                  onClick={runScan}
                  disabled={loadingScan}
                  className="flex items-center gap-2 px-4 sm:px-6 py-2 bg-rose-600 text-white rounded-md font-medium hover:bg-rose-700 disabled:opacity-50 transition-colors"
                >
                  <Play className={`w-4 h-4 ${loadingScan ? 'animate-pulse' : ''}`} />
                  Run Global Scan
                </button>
              </div>
            </CardHeader>
          </Card>

          {reports.length > 0 && (
            <div className="space-y-4">
              <h3 className="font-semibold text-slate-800 text-lg">Recent Scan Reports</h3>
              {reports.map(r => {
                const data = JSON.parse(r.report_data || '{}');
                return (
                  <Card key={r.id}>
                    <CardHeader className="bg-slate-50 border-b py-3 px-4 sm:px-6">
                      <div className="flex justify-between items-center">
                        <div className="flex items-center gap-3">
                          <FileText className="w-5 h-5 text-indigo-600" />
                          <span className="font-mono text-sm font-semibold text-slate-700">{r.id}</span>
                          <span className="text-xs text-slate-500">{new Date(r.scan_date).toLocaleString()}</span>
                        </div>
                        <div className="flex gap-4 text-sm font-medium">
                          <span className="text-rose-600">Violations: {r.violations_found}</span>
                          <span className="text-amber-600">Penalty Risk: {r.penalties_estimated}</span>
                        </div>
                      </div>
                    </CardHeader>
                    <CardContent className="p-4 sm:p-5 lg:p-6 space-y-4 sm:space-y-6">
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 sm:gap-6">
                        <div>
                          <h4 className="text-sm font-semibold flex items-center gap-2 text-rose-800 mb-3">
                            <AlertTriangle className="w-4 h-4" /> Detected Violations
                          </h4>
                          <ul className="space-y-2">
                            {data.violations?.map((v: any, idx: number) => (
                              <li key={idx} className="bg-rose-50 border border-rose-100 p-3 rounded text-sm">
                                <strong className="block text-rose-900 mb-1">{v.resource}</strong>
                                <span className="text-rose-700">{v.issue}</span>
                              </li>
                            ))}
                          </ul>
                        </div>
                        <div>
                          <h4 className="text-sm font-semibold flex items-center gap-2 text-emerald-800 mb-3">
                            <CheckCircle className="w-4 h-4" /> Auto-Fixes Applied
                          </h4>
                          <ul className="space-y-2">
                            {data.fixesApplied?.map((f: string, idx: number) => (
                              <li key={idx} className="bg-emerald-50 border border-emerald-100 p-3 rounded text-sm text-emerald-700">
                                {f}
                              </li>
                            ))}
                          </ul>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                );
              })}
            </div>
          )}
        </div>
      )}
    </div>
  );
}
