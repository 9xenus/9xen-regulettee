import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import {
  Shield,
  Zap,
  Lock,
  Key,
  Database,
  CheckCircle2,
  AlertTriangle,
  RefreshCw,
  Send,
  Search,
  Server,
  Activity,
  Award,
  Layers,
  FileCheck,
  TrendingUp,
  Cpu,
  ArrowRight
} from 'lucide-react';

export const PartnerPlatformPortal: React.FC = () => {
  const [activeTab, setActiveTab] = useState<'overview' | 'api-explorer' | 'reciprocity' | 'onboard'>('overview');
  const [partners, setPartners] = useState<any[]>([]);
  const [stats, setStats] = useState<any[]>([]);
  const [recentSignals, setRecentSignals] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  // API Explorer State
  const [apiType, setApiType] = useState<'signal' | 'status' | 'watchlist' | 'actuator'>('signal');
  const [testEntityRef, setTestEntityRef] = useState('MERCHANT_881920_BD');
  const [testSignalType, setTestSignalType] = useState('merchant_fraud');
  const [testDescription, setTestDescription] = useState('Sudden 400% spike in chargeback disputes with duplicate recipient tokens');
  const [testHashes, setTestHashes] = useState('a94a8fe5ccb19ba61c4c0873d391e987982fbbd3\ne3b0c44298fc1c149afbf4c8996fb92427ae41e4649b934ca495991b7852b855\n7f');
  const [testOrderRef, setTestOrderRef] = useState('ORD_BTRC_2026_HOLD_01');
  const [apiResponse, setApiResponse] = useState<any>(null);
  const [isExecutingApi, setIsExecutingApi] = useState(false);

  // Onboard State
  const [newPartnerName, setNewPartnerName] = useState('');
  const [newPartnerType, setNewPartnerType] = useState<'psp' | 'bank' | 'marketplace' | 'telecom'>('psp');
  const [newPartnerTier, setNewPartnerTier] = useState<'basic' | 'verified' | 'actuator' | 'strategic'>('actuator');
  const [onboardResult, setOnboardResult] = useState<any>(null);
  const [isOnboarding, setIsOnboarding] = useState(false);

  const fetchMetrics = async () => {
    try {
      const res = await fetch('/api/v1/prt/portal/metrics');
      const data = await res.json();
      if (data.success) {
        setPartners(data.partners || []);
        setStats(data.stats || []);
        setRecentSignals(data.recentSignals || []);
      }
    } catch (err) {
      console.warn('Failed to load partner metrics:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchMetrics();
    const interval = setInterval(fetchMetrics, 12000);
    return () => clearInterval(interval);
  }, []);

  const handleExecuteApi = async () => {
    setIsExecutingApi(true);
    setApiResponse(null);
    try {
      if (apiType === 'signal') {
        const res = await fetch('/api/v1/prt/signals', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            entity_ref: testEntityRef,
            signal_type: testSignalType,
            description: testDescription,
            affected_users_estimate: 24,
            country_code: 'BD'
          })
        });
        const data = await res.json();
        setApiResponse(data);
      } else if (apiType === 'status') {
        const res = await fetch(`/api/v1/prt/entities/${encodeURIComponent(testEntityRef)}/status`);
        const data = await res.json();
        setApiResponse(data);
      } else if (apiType === 'watchlist') {
        const hashList = testHashes.split('\n').map(h => h.trim()).filter(Boolean);
        const res = await fetch('/api/v1/prt/watchlist/match', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            salted_hashes: hashList,
            country_code: 'BD'
          })
        });
        const data = await res.json();
        setApiResponse(data);
      } else if (apiType === 'actuator') {
        const res = await fetch('/api/v1/prt/actuator/execute', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            order_ref: testOrderRef,
            action_type: 'payment_hold',
            target_identifier: testEntityRef,
            reason: 'Statutory Interception Mandate BTRC-2026-99',
            reversal_endpoint: 'https://api.partner.bank/reversals/v1'
          })
        });
        const data = await res.json();
        setApiResponse(data);
      }
      fetchMetrics();
    } catch (err: any) {
      setApiResponse({ error: err.message });
    } finally {
      setIsExecutingApi(false);
    }
  };

  const handleOnboardPartner = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newPartnerName) return;
    setIsOnboarding(true);
    setOnboardResult(null);
    try {
      const res = await fetch('/api/v1/prt/portal/onboard', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: newPartnerName,
          type: newPartnerType,
          tier: newPartnerTier,
          country_scope: ['BD'],
          purpose_declarations: ['Anti-Fraud Signal Exchange', 'Statutory Compliance Gate']
        })
      });
      const data = await res.json();
      if (data.success) {
        setOnboardResult(data);
        setNewPartnerName('');
        fetchMetrics();
      }
    } catch (err: any) {
      setOnboardResult({ error: err.message });
    } finally {
      setIsOnboarding(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* Top Banner */}
      <div className="p-6 rounded-2xl bg-gradient-to-r from-slate-900 via-indigo-950 to-slate-900 border border-indigo-800/40 shadow-xl relative overflow-hidden">
        <div className="absolute right-0 top-0 translate-x-8 -translate-y-8 w-64 h-64 bg-indigo-500/10 rounded-full blur-3xl pointer-events-none" />
        <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4 relative z-10">
          <div className="space-y-1.5">
            <div className="flex items-center gap-2">
              <span className="px-2.5 py-0.5 rounded-full bg-indigo-500/20 border border-indigo-400/40 text-indigo-300 text-[10px] font-mono font-bold uppercase tracking-wider">
                API-First Partner Platform (prt_)
              </span>
              <span className="text-slate-400 text-xs font-mono">Tier 4 Actuator Enabled</span>
            </div>
            <h1 className="text-xl sm:text-2xl font-bold text-white tracking-tight flex items-center gap-2.5">
              <Shield className="w-6 h-6 text-indigo-400" />
              <span>Institutional Integration &amp; Reciprocity Engine</span>
            </h1>
            <p className="text-xs sm:text-sm text-slate-300 max-w-2xl">
              Bi-directional intelligence bridge connecting Banks, PSPs, and Marketplaces. Ingest fraud signals, query blind watchlists, and execute statutory actuator holds under dual-control authorization.
            </p>
          </div>

          <div className="flex items-center gap-2 shrink-0">
            <button
              onClick={() => setActiveTab('api-explorer')}
              className="px-4 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-semibold flex items-center gap-2 shadow-lg shadow-indigo-950/40 transition-all cursor-pointer"
            >
              <Zap className="w-4 h-4" />
              <span>Test API Endpoints</span>
            </button>
            <button
              onClick={() => setActiveTab('onboard')}
              className="px-4 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 border border-slate-700 text-slate-200 text-xs font-semibold flex items-center gap-2 transition-all cursor-pointer"
            >
              <Key className="w-4 h-4 text-amber-400" />
              <span>Onboard Partner</span>
            </button>
          </div>
        </div>
      </div>

      {/* Navigation Tabs */}
      <div className="flex items-center gap-2 border-b border-slate-800 pb-2">
        <button
          onClick={() => setActiveTab('overview')}
          className={`px-4 py-2 rounded-xl text-xs font-semibold transition-all cursor-pointer flex items-center gap-2 ${
            activeTab === 'overview'
              ? 'bg-indigo-600 text-white shadow-sm'
              : 'text-slate-400 hover:text-white hover:bg-slate-800/60'
          }`}
        >
          <Server className="w-4 h-4" />
          <span>Connected Partners ({partners.length})</span>
        </button>

        <button
          onClick={() => setActiveTab('api-explorer')}
          className={`px-4 py-2 rounded-xl text-xs font-semibold transition-all cursor-pointer flex items-center gap-2 ${
            activeTab === 'api-explorer'
              ? 'bg-indigo-600 text-white shadow-sm'
              : 'text-slate-400 hover:text-white hover:bg-slate-800/60'
          }`}
        >
          <Zap className="w-4 h-4" />
          <span>Live API Testbed</span>
        </button>

        <button
          onClick={() => setActiveTab('reciprocity')}
          className={`px-4 py-2 rounded-xl text-xs font-semibold transition-all cursor-pointer flex items-center gap-2 ${
            activeTab === 'reciprocity'
              ? 'bg-indigo-600 text-white shadow-sm'
              : 'text-slate-400 hover:text-white hover:bg-slate-800/60'
          }`}
        >
          <TrendingUp className="w-4 h-4" />
          <span>Reciprocity &amp; Data Contribution</span>
        </button>

        <button
          onClick={() => setActiveTab('onboard')}
          className={`px-4 py-2 rounded-xl text-xs font-semibold transition-all cursor-pointer flex items-center gap-2 ${
            activeTab === 'onboard'
              ? 'bg-indigo-600 text-white shadow-sm'
              : 'text-slate-400 hover:text-white hover:bg-slate-800/60'
          }`}
        >
          <Key className="w-4 h-4" />
          <span>Self-Service Onboarding</span>
        </button>
      </div>

      {/* TAB 1: OVERVIEW & PARTNER REGISTRY */}
      {activeTab === 'overview' && (
        <div className="space-y-6">
          {/* Quick Metrics */}
          <div className="grid grid-cols-1 sm:grid-cols-4 gap-4">
            <div className="p-4 rounded-xl bg-slate-900/80 border border-slate-800 flex items-center justify-between">
              <div>
                <div className="text-xs font-mono text-slate-400">Total Partners</div>
                <div className="text-2xl font-bold text-white font-mono mt-1">{partners.length}</div>
              </div>
              <div className="p-3 rounded-xl bg-indigo-500/10 text-indigo-400">
                <Server className="w-5 h-5" />
              </div>
            </div>

            <div className="p-4 rounded-xl bg-slate-900/80 border border-slate-800 flex items-center justify-between">
              <div>
                <div className="text-xs font-mono text-slate-400">Signals Ingested</div>
                <div className="text-2xl font-bold text-emerald-400 font-mono mt-1">
                  {stats.reduce((acc, s) => acc + (s.signals_sent || 0), 0) + recentSignals.length}
                </div>
              </div>
              <div className="p-3 rounded-xl bg-emerald-500/10 text-emerald-400">
                <Activity className="w-5 h-5" />
              </div>
            </div>

            <div className="p-4 rounded-xl bg-slate-900/80 border border-slate-800 flex items-center justify-between">
              <div>
                <div className="text-xs font-mono text-slate-400">Actuator Orders</div>
                <div className="text-2xl font-bold text-amber-400 font-mono mt-1">12</div>
              </div>
              <div className="p-3 rounded-xl bg-amber-500/10 text-amber-400">
                <Lock className="w-5 h-5" />
              </div>
            </div>

            <div className="p-4 rounded-xl bg-slate-900/80 border border-slate-800 flex items-center justify-between">
              <div>
                <div className="text-xs font-mono text-slate-400">Avg Confirmation %</div>
                <div className="text-2xl font-bold text-cyan-400 font-mono mt-1">94.8%</div>
              </div>
              <div className="p-3 rounded-xl bg-cyan-500/10 text-cyan-400">
                <Award className="w-5 h-5" />
              </div>
            </div>
          </div>

          {/* Connected Partners Table */}
          <div className="p-5 rounded-2xl bg-slate-900/90 border border-slate-800 space-y-4">
            <div className="flex items-center justify-between">
              <h2 className="text-base font-bold text-white flex items-center gap-2">
                <Layers className="w-4 h-4 text-indigo-400" />
                <span>Authorized Institutional Partners</span>
              </h2>
              <span className="text-xs text-slate-400 font-mono">Enforced at API Gateway Layer</span>
            </div>

            <div className="space-y-3">
              {partners.map((p) => (
                <div
                  key={p.id}
                  className="p-4 rounded-xl bg-slate-950/70 border border-slate-800 hover:border-slate-700 transition-all flex flex-col md:flex-row items-start md:items-center justify-between gap-4"
                >
                  <div className="space-y-1">
                    <div className="flex items-center gap-2.5">
                      <span className="font-bold text-white text-sm">{p.name}</span>
                      <span className="px-2 py-0.5 rounded text-[10px] font-mono font-bold uppercase bg-slate-800 text-indigo-300 border border-slate-700">
                        {p.type}
                      </span>
                      <span className={`px-2 py-0.5 rounded text-[10px] font-mono font-bold uppercase ${
                        p.tier === 'strategic' ? 'bg-amber-500/20 text-amber-300 border border-amber-500/30' :
                        p.tier === 'actuator' ? 'bg-rose-500/20 text-rose-300 border border-rose-500/30' :
                        'bg-emerald-500/20 text-emerald-300 border border-emerald-500/30'
                      }`}>
                        TIER: {p.tier}
                      </span>
                    </div>
                    <div className="text-xs text-slate-400 flex flex-wrap items-center gap-3">
                      <span>ID: <strong className="text-slate-300 font-mono">{p.id}</strong></span>
                      <span>Jurisdiction: <strong className="text-slate-300">{(p.country_scope || []).join(', ')}</strong></span>
                      <span>Status: <strong className="text-emerald-400">{p.status}</strong></span>
                    </div>
                  </div>

                  <div className="flex items-center gap-2 shrink-0">
                    <button
                      onClick={() => {
                        setTestEntityRef(`MERCHANT_${p.type.toUpperCase()}_01`);
                        setActiveTab('api-explorer');
                      }}
                      className="px-3 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 border border-slate-700 text-white text-xs font-semibold cursor-pointer"
                    >
                      Test Inbound Signal
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* TAB 2: LIVE API TESTBED */}
      {activeTab === 'api-explorer' && (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
          <div className="lg:col-span-5 p-5 rounded-2xl bg-slate-900/90 border border-slate-800 space-y-4">
            <h2 className="text-base font-bold text-white flex items-center gap-2">
              <Zap className="w-4 h-4 text-amber-400" />
              <span>Interactive Endpoint Invoker</span>
            </h2>

            {/* API Mode Selector */}
            <div className="grid grid-cols-2 gap-2">
              <button
                onClick={() => setApiType('signal')}
                className={`p-2.5 rounded-xl text-xs font-semibold border text-left cursor-pointer transition-all ${
                  apiType === 'signal'
                    ? 'bg-indigo-600/20 border-indigo-500 text-white'
                    : 'bg-slate-950 border-slate-800 text-slate-400 hover:text-white'
                }`}
              >
                <div className="font-bold">POST /prt/v1/signals</div>
                <div className="text-[10px] text-slate-400 mt-0.5">Inbound fraud signal</div>
              </button>

              <button
                onClick={() => setApiType('status')}
                className={`p-2.5 rounded-xl text-xs font-semibold border text-left cursor-pointer transition-all ${
                  apiType === 'status'
                    ? 'bg-indigo-600/20 border-indigo-500 text-white'
                    : 'bg-slate-950 border-slate-800 text-slate-400 hover:text-white'
                }`}
              >
                <div className="font-bold">GET /entities/:id/status</div>
                <div className="text-[10px] text-slate-400 mt-0.5">Scoped trust score</div>
              </button>

              <button
                onClick={() => setApiType('watchlist')}
                className={`p-2.5 rounded-xl text-xs font-semibold border text-left cursor-pointer transition-all ${
                  apiType === 'watchlist'
                    ? 'bg-indigo-600/20 border-indigo-500 text-white'
                    : 'bg-slate-950 border-slate-800 text-slate-400 hover:text-white'
                }`}
              >
                <div className="font-bold">POST /watchlist/match</div>
                <div className="text-[10px] text-slate-400 mt-0.5">Blind salted matching</div>
              </button>

              <button
                onClick={() => setApiType('actuator')}
                className={`p-2.5 rounded-xl text-xs font-semibold border text-left cursor-pointer transition-all ${
                  apiType === 'actuator'
                    ? 'bg-indigo-600/20 border-indigo-500 text-white'
                    : 'bg-slate-950 border-slate-800 text-slate-400 hover:text-white'
                }`}
              >
                <div className="font-bold">POST /actuator/execute</div>
                <div className="text-[10px] text-slate-400 mt-0.5">Statutory payment hold</div>
              </button>
            </div>

            {/* Dynamic Inputs */}
            {apiType === 'signal' && (
              <div className="space-y-3 pt-2">
                <div>
                  <label className="text-xs font-mono text-slate-400 block mb-1">Entity Identifier / Merchant Token</label>
                  <input
                    type="text"
                    value={testEntityRef}
                    onChange={(e) => setTestEntityRef(e.target.value)}
                    className="w-full px-3 py-2 rounded-xl bg-slate-950 border border-slate-800 text-white text-xs font-mono focus:border-indigo-500 outline-none"
                  />
                </div>
                <div>
                  <label className="text-xs font-mono text-slate-400 block mb-1">Signal Classification</label>
                  <select
                    value={testSignalType}
                    onChange={(e) => setTestSignalType(e.target.value)}
                    className="w-full px-3 py-2 rounded-xl bg-slate-950 border border-slate-800 text-white text-xs font-mono focus:border-indigo-500 outline-none cursor-pointer"
                  >
                    <option value="merchant_fraud">merchant_fraud (High Risk)</option>
                    <option value="chargeback_pattern">chargeback_pattern (Dispute Spike)</option>
                    <option value="phishing_hosting">phishing_hosting (Malicious URL)</option>
                    <option value="illegal_product">illegal_product (Unlicensed Good)</option>
                  </select>
                </div>
                <div>
                  <label className="text-xs font-mono text-slate-400 block mb-1">Signal Description</label>
                  <textarea
                    rows={2}
                    value={testDescription}
                    onChange={(e) => setTestDescription(e.target.value)}
                    className="w-full px-3 py-2 rounded-xl bg-slate-950 border border-slate-800 text-white text-xs font-mono focus:border-indigo-500 outline-none"
                  />
                </div>
              </div>
            )}

            {apiType === 'status' && (
              <div className="space-y-3 pt-2">
                <div>
                  <label className="text-xs font-mono text-slate-400 block mb-1">Target Entity ID to Inspect</label>
                  <input
                    type="text"
                    value={testEntityRef}
                    onChange={(e) => setTestEntityRef(e.target.value)}
                    className="w-full px-3 py-2 rounded-xl bg-slate-950 border border-slate-800 text-white text-xs font-mono focus:border-indigo-500 outline-none"
                  />
                </div>
              </div>
            )}

            {apiType === 'watchlist' && (
              <div className="space-y-3 pt-2">
                <div>
                  <label className="text-xs font-mono text-slate-400 block mb-1">Salted Entity Hashes (One per line)</label>
                  <textarea
                    rows={4}
                    value={testHashes}
                    onChange={(e) => setTestHashes(e.target.value)}
                    className="w-full px-3 py-2 rounded-xl bg-slate-950 border border-slate-800 text-white text-xs font-mono focus:border-indigo-500 outline-none"
                  />
                </div>
              </div>
            )}

            {apiType === 'actuator' && (
              <div className="space-y-3 pt-2">
                <div>
                  <label className="text-xs font-mono text-slate-400 block mb-1">Statutory Order Reference</label>
                  <input
                    type="text"
                    value={testOrderRef}
                    onChange={(e) => setTestOrderRef(e.target.value)}
                    className="w-full px-3 py-2 rounded-xl bg-slate-950 border border-slate-800 text-white text-xs font-mono focus:border-indigo-500 outline-none"
                  />
                </div>
                <div>
                  <label className="text-xs font-mono text-slate-400 block mb-1">Merchant Account Identifier</label>
                  <input
                    type="text"
                    value={testEntityRef}
                    onChange={(e) => setTestEntityRef(e.target.value)}
                    className="w-full px-3 py-2 rounded-xl bg-slate-950 border border-slate-800 text-white text-xs font-mono focus:border-indigo-500 outline-none"
                  />
                </div>
              </div>
            )}

            <button
              onClick={handleExecuteApi}
              disabled={isExecutingApi}
              className="w-full py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-bold flex items-center justify-center gap-2 shadow-lg shadow-indigo-950/40 cursor-pointer disabled:opacity-50"
            >
              {isExecutingApi ? <RefreshCw className="w-4 h-4 animate-spin" /> : <Send className="w-4 h-4" />}
              <span>Execute Partner API Call</span>
            </button>
          </div>

          {/* Response Payload Viewer */}
          <div className="lg:col-span-7 p-5 rounded-2xl bg-slate-950 border border-slate-800 flex flex-col justify-between">
            <div className="space-y-3">
              <div className="flex items-center justify-between border-b border-slate-800 pb-2">
                <span className="text-xs font-mono font-bold text-slate-400 uppercase">Live JSON Response</span>
                {apiResponse && (
                  <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-emerald-500/20 text-emerald-300 border border-emerald-500/30">
                    HTTP 200 OK
                  </span>
                )}
              </div>

              <pre className="p-4 rounded-xl bg-slate-900/90 border border-slate-800 text-xs font-mono text-emerald-400 overflow-x-auto max-h-[380px]">
                {apiResponse
                  ? JSON.stringify(apiResponse, null, 2)
                  : `// Ready to send test request\n// Results will appear here with cryptographic receipts & scoped band responses...`}
              </pre>
            </div>

            <div className="pt-4 border-t border-slate-800 text-[11px] text-slate-400 font-mono flex items-center justify-between">
              <span>Security Guard: Scopes &amp; Purpose-Limitation Enforced</span>
              <span>Latency: ~18ms</span>
            </div>
          </div>
        </div>
      )}

      {/* TAB 3: RECIPROCITY & CONTRIBUTION */}
      {activeTab === 'reciprocity' && (
        <div className="space-y-6">
          <div className="p-5 rounded-2xl bg-slate-900/90 border border-slate-800 space-y-4">
            <h2 className="text-base font-bold text-white flex items-center gap-2">
              <TrendingUp className="w-4 h-4 text-emerald-400" />
              <span>Two-Sided Reciprocity Metering</span>
            </h2>
            <p className="text-xs text-slate-300">
              Partners who contribute verified fraud signals receive higher intelligence tiers (e.g. bulk batch lookups, automated webhook invalidations, and direct actuator execution capabilities).
            </p>

            <div className="space-y-3 pt-2">
              {stats.map((st) => (
                <div key={st.id} className="p-4 rounded-xl bg-slate-950 border border-slate-800 space-y-3">
                  <div className="flex items-center justify-between">
                    <div>
                      <span className="text-xs font-mono text-slate-400">Partner: </span>
                      <strong className="text-white font-mono text-sm">{st.partner_id}</strong>
                    </div>
                    <span className="px-2.5 py-0.5 rounded-full bg-indigo-500/20 text-indigo-300 text-[10px] font-mono font-bold uppercase">
                      Tier: {st.reciprocity_tier}
                    </span>
                  </div>

                  <div className="grid grid-cols-3 gap-4 text-xs font-mono">
                    <div className="p-3 rounded-lg bg-slate-900 border border-slate-800">
                      <div className="text-slate-400 text-[10px]">Signals Sent</div>
                      <div className="text-base font-bold text-white mt-0.5">{st.signals_sent}</div>
                    </div>
                    <div className="p-3 rounded-lg bg-slate-900 border border-slate-800">
                      <div className="text-slate-400 text-[10px]">Confirmed by Authority</div>
                      <div className="text-base font-bold text-emerald-400 mt-0.5">{st.confirmed_count}</div>
                    </div>
                    <div className="p-3 rounded-lg bg-slate-900 border border-slate-800">
                      <div className="text-slate-400 text-[10px]">Quality Score</div>
                      <div className="text-base font-bold text-amber-400 mt-0.5">{st.quality_score} / 1.0</div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* TAB 4: SELF-SERVICE ONBOARDING */}
      {activeTab === 'onboard' && (
        <div className="max-w-2xl mx-auto p-6 rounded-2xl bg-slate-900/90 border border-slate-800 space-y-5">
          <div>
            <h2 className="text-lg font-bold text-white flex items-center gap-2">
              <Key className="w-5 h-5 text-amber-400" />
              <span>Provision Institutional Partner Keys</span>
            </h2>
            <p className="text-xs text-slate-400 mt-1">
              Issue Vault-backed Ed25519 signing credentials and sandbox environment keys for verified financial or marketplace partners.
            </p>
          </div>

          <form onSubmit={handleOnboardPartner} className="space-y-4">
            <div>
              <label className="text-xs font-mono text-slate-300 block mb-1">Partner Legal Name</label>
              <input
                type="text"
                required
                placeholder="e.g. Nagad Enterprise Fraud Division"
                value={newPartnerName}
                onChange={(e) => setNewPartnerName(e.target.value)}
                className="w-full px-3.5 py-2.5 rounded-xl bg-slate-950 border border-slate-800 text-white text-xs font-mono focus:border-indigo-500 outline-none"
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="text-xs font-mono text-slate-300 block mb-1">Partner Type</label>
                <select
                  value={newPartnerType}
                  onChange={(e: any) => setNewPartnerType(e.target.value)}
                  className="w-full px-3.5 py-2.5 rounded-xl bg-slate-950 border border-slate-800 text-white text-xs font-mono focus:border-indigo-500 outline-none cursor-pointer"
                >
                  <option value="psp">PSP (Payment Service Provider)</option>
                  <option value="bank">Commercial Bank</option>
                  <option value="marketplace">E-Commerce Marketplace</option>
                  <option value="telecom">Telecom / MNO</option>
                </select>
              </div>

              <div>
                <label className="text-xs font-mono text-slate-300 block mb-1">Initial Tier</label>
                <select
                  value={newPartnerTier}
                  onChange={(e: any) => setNewPartnerTier(e.target.value)}
                  className="w-full px-3.5 py-2.5 rounded-xl bg-slate-950 border border-slate-800 text-white text-xs font-mono focus:border-indigo-500 outline-none cursor-pointer"
                >
                  <option value="basic">Basic (Score / Status Read)</option>
                  <option value="verified">Verified (+Signals &amp; Watchlist)</option>
                  <option value="actuator">Actuator (+Payment Hold Action)</option>
                  <option value="strategic">Strategic (Full Suite)</option>
                </select>
              </div>
            </div>

            <button
              type="submit"
              disabled={isOnboarding}
              className="w-full py-3 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-bold flex items-center justify-center gap-2 shadow-lg shadow-indigo-950/40 cursor-pointer disabled:opacity-50"
            >
              {isOnboarding ? <RefreshCw className="w-4 h-4 animate-spin" /> : <Shield className="w-4 h-4" />}
              <span>Generate Vault Credentials &amp; Activate</span>
            </button>
          </form>

          {/* Onboard Success Credential Dossier */}
          {onboardResult && (
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              className="p-4 rounded-xl bg-slate-950 border border-emerald-500/40 space-y-3"
            >
              <div className="flex items-center gap-2 text-emerald-400 font-bold text-xs font-mono">
                <CheckCircle2 className="w-4 h-4" />
                <span>Partner Onboarded Successfully</span>
              </div>

              <div className="space-y-1.5 text-xs font-mono">
                <div>Partner ID: <strong className="text-white">{onboardResult.partner?.id}</strong></div>
                <div>Client ID: <strong className="text-indigo-400">{onboardResult.clientId}</strong></div>
                <div>Client Secret: <strong className="text-amber-400">{onboardResult.clientSecret}</strong></div>
                <div>Vault Key Ref: <span className="text-slate-400">{onboardResult.keyRef}</span></div>
              </div>
            </motion.div>
          )}
        </div>
      )}
    </div>
  );
};
