import React, { useState, useEffect } from 'react';
import { 
  Cpu, 
  BrainCircuit, 
  Activity, 
  AlertTriangle, 
  CheckCircle2, 
  RefreshCw, 
  Send, 
  ShieldCheck, 
  TrendingUp, 
  FileCheck2, 
  Database, 
  Layers,
  Sparkles
} from 'lucide-react';
import { fetchWithRetry } from '../../lib/api-client';

interface AiSystem {
  id: string;
  system_name: string;
  annex_category: string;
  intended_purpose: string;
  risk_level: string;
  conformity_route: string;
  eu_db_registration_id: string;
  surveillance_status: string;
  model_drift_index: number;
  fairness_variance: number;
  incident_count: number;
  market_authority: string;
  last_telemetry_at: string;
  created_at: string;
}

export const AiActPmmRelay: React.FC = () => {
  const [systems, setSystems] = useState<AiSystem[]>([]);
  const [loading, setLoading] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Registration form
  const [systemName, setSystemName] = useState('LexGen Biometric & Credit Scoring Engine');
  const [annexCategory, setAnnexCategory] = useState('ANNEX_III_POINT_5_CREDIT_WORTHINESS');
  const [intendedPurpose, setIntendedPurpose] = useState('Automated evaluation of sovereign credit eligibility and financial fraud risk under human oversight.');
  const [conformityRoute, setConformityRoute] = useState('ANNEX_VI_INTERNAL_CONTROL');
  const [marketAuthority, setMarketAuthority] = useState('EU_AI_OFFICE_BRUSSELS');

  const fetchSystems = async () => {
    setLoading(true);
    try {
      const res = await fetchWithRetry('/api/v1/b2g/ai-act/systems');
      const data = await res.json();
      if (data.success && Array.isArray(data.systems)) {
        setSystems(data.systems);
      }
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchSystems();
  }, []);

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    try {
      const res = await fetchWithRetry('/api/v1/b2g/ai-act/register-system', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          system_name: systemName,
          annex_category: annexCategory,
          intended_purpose: intendedPurpose,
          conformity_route: conformityRoute,
          market_authority: marketAuthority
        })
      });
      const data = await res.json();
      if (data.success) {
        setSystemName('');
        setIntendedPurpose('');
        fetchSystems();
      }
    } catch (err) {
      console.error(err);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleSendTelemetry = async (id: string, triggerAlert = false) => {
    try {
      const drift = triggerAlert ? 0.18 : Number((0.01 + Math.random() * 0.04).toFixed(3));
      const variance = triggerAlert ? 0.12 : Number((0.005 + Math.random() * 0.02).toFixed(3));
      
      const res = await fetchWithRetry(`/api/v1/b2g/ai-act/systems/${id}/telemetry`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          model_drift_index: drift,
          fairness_variance: variance,
          log_incident: triggerAlert
        })
      });
      const data = await res.json();
      if (data.success) {
        fetchSystems();
      }
    } catch (err) {
      console.error(err);
    }
  };

  return (
    <div className="bg-slate-900 border border-slate-800 rounded-2xl p-4 sm:p-6 shadow-xl space-y-6 text-slate-100">
      
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-800 pb-4">
        <div className="flex items-center gap-3">
          <div className="p-3 bg-cyan-500/10 text-cyan-400 rounded-xl border border-cyan-500/20">
            <BrainCircuit className="w-6 h-6" />
          </div>
          <div>
            <h2 className="text-base sm:text-lg font-bold text-white flex items-center gap-2">
              EU AI Act Public Registry & Post-Market Surveillance (PMM) Relay
              <span className="px-2 py-0.5 rounded text-[10px] font-mono bg-cyan-500/20 text-cyan-300 border border-cyan-500/30 font-bold uppercase">
                Art. 51 & 72 Enforced
              </span>
            </h2>
            <p className="text-xs text-slate-400 mt-0.5">
              High-Risk AI System EU Database registration and continuous live telemetry stream to National Market Surveillance Authorities.
            </p>
          </div>
        </div>

        <button
          onClick={fetchSystems}
          disabled={loading}
          className="px-3.5 py-2 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded-xl text-xs font-semibold flex items-center gap-1.5 transition-colors self-start sm:self-auto cursor-pointer"
        >
          <RefreshCw className={`w-3.5 h-3.5 ${loading ? 'animate-spin' : ''}`} />
          <span>Refresh AI Registry</span>
        </button>
      </div>

      {/* Grid: Registration & Live PMM Ledger */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        
        {/* Left: High-Risk AI Registration Form */}
        <div className="lg:col-span-5 bg-slate-950 p-4 sm:p-5 rounded-xl border border-slate-800 space-y-4">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold uppercase tracking-wider text-slate-400 flex items-center gap-1.5">
              <Database className="w-3.5 h-3.5 text-cyan-400" />
              Register High-Risk System in EU Database
            </span>
            <span className="text-[11px] font-mono text-cyan-400 font-bold bg-cyan-950/40 px-2 py-0.5 rounded border border-cyan-800/40">
              CE Mark Sealed
            </span>
          </div>

          <form onSubmit={handleRegister} className="space-y-3.5 text-xs">
            <div>
              <label className="block text-slate-400 font-semibold mb-1">AI System Trade / Commercial Name</label>
              <input
                type="text"
                value={systemName}
                onChange={(e) => setSystemName(e.target.value)}
                placeholder="e.g. Sovereign Biometric Verification Model"
                className="w-full bg-slate-900 border border-slate-700 rounded-lg px-3 py-2 text-slate-100 text-xs focus:outline-none focus:border-cyan-500"
                required
              />
            </div>

            <div>
              <label className="block text-slate-400 font-semibold mb-1">Annex III High-Risk Classification</label>
              <select
                value={annexCategory}
                onChange={(e) => setAnnexCategory(e.target.value)}
                className="w-full bg-slate-900 border border-slate-700 rounded-lg px-2.5 py-2 text-slate-100 text-xs focus:outline-none focus:border-cyan-500 font-medium"
              >
                <option value="ANNEX_III_POINT_1_BIOMETRICS">Annex III.1: Biometric & Emotion Recognition</option>
                <option value="ANNEX_III_POINT_2_CRITICAL_INFRASTRUCTURE">Annex III.2: Critical Infrastructure Management</option>
                <option value="ANNEX_III_POINT_4_EMPLOYMENT">Annex III.4: Employment & Worker Management</option>
                <option value="ANNEX_III_POINT_5_CREDIT_WORTHINESS">Annex III.5: Credit Scoring & Essential Services</option>
                <option value="ANNEX_III_POINT_6_LAW_ENFORCEMENT">Annex III.6: Law Enforcement Polygraphs & Profiling</option>
                <option value="ANNEX_III_POINT_8_JUSTICE">Annex III.8: Administration of Justice & ADR</option>
              </select>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-slate-400 font-semibold mb-1">Conformity Route</label>
                <select
                  value={conformityRoute}
                  onChange={(e) => setConformityRoute(e.target.value)}
                  className="w-full bg-slate-900 border border-slate-700 rounded-lg px-2.5 py-2 text-slate-100 text-xs focus:outline-none focus:border-cyan-500 font-mono"
                >
                  <option value="ANNEX_VI_INTERNAL_CONTROL">Annex VI: Internal Control</option>
                  <option value="ANNEX_VII_NOTIFIED_BODY">Annex VII: Notified Body Audit</option>
                </select>
              </div>

              <div>
                <label className="block text-slate-400 font-semibold mb-1">Market Authority</label>
                <select
                  value={marketAuthority}
                  onChange={(e) => setMarketAuthority(e.target.value)}
                  className="w-full bg-slate-900 border border-slate-700 rounded-lg px-2.5 py-2 text-slate-100 text-xs focus:outline-none focus:border-cyan-500 font-semibold"
                >
                  <option value="EU_AI_OFFICE_BRUSSELS">EU AI Office (Brussels)</option>
                  <option value="DE_BSI_BFDI">BNetzA / BfDI (Germany)</option>
                  <option value="FR_CNIL_ANSSI">CNIL AI Taskforce (France)</option>
                  <option value="IE_DPC_AI">Coimisiún / DPC (Ireland)</option>
                </select>
              </div>
            </div>

            <div>
              <label className="block text-slate-400 font-semibold mb-1">Statutory Intended Purpose (Art. 13 Instructions)</label>
              <textarea
                rows={3}
                value={intendedPurpose}
                onChange={(e) => setIntendedPurpose(e.target.value)}
                placeholder="Specific operational boundaries, input data modalities, human fallback..."
                className="w-full bg-slate-900 border border-slate-700 rounded-lg p-2.5 text-slate-100 text-xs focus:outline-none focus:border-cyan-500"
                required
              />
            </div>

            <button
              type="submit"
              disabled={isSubmitting}
              className="w-full py-2.5 bg-cyan-600 hover:bg-cyan-500 text-slate-950 rounded-xl font-bold text-xs transition-all shadow-md flex items-center justify-center gap-2 cursor-pointer"
            >
              {isSubmitting ? <RefreshCw className="w-4 h-4 animate-spin" /> : <Send className="w-4 h-4" />}
              <span>{isSubmitting ? 'Registering with EU Database...' : 'Register High-Risk System (EU Database)'}</span>
            </button>
          </form>
        </div>

        {/* Right: Active Registered Systems & Live Telemetry Stream */}
        <div className="lg:col-span-7 space-y-3">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold uppercase tracking-wider text-slate-400 flex items-center gap-1.5">
              <Activity className="w-3.5 h-3.5 text-cyan-400" />
              EU Registered High-Risk Systems ({systems.length})
            </span>
            <span className="text-[11px] text-slate-500">Continuous PMM (Art. 72) Active</span>
          </div>

          <div className="space-y-3 max-h-[480px] overflow-y-auto pr-1">
            {systems.length === 0 ? (
              <div className="p-8 text-center bg-slate-950/60 rounded-xl border border-slate-800 text-slate-500 text-xs">
                No High-Risk AI systems registered yet. Use the form to register a model into the sovereign EU database.
              </div>
            ) : (
              systems.map((s) => (
                <div key={s.id} className="p-4 bg-slate-950 rounded-xl border border-slate-800 space-y-3 hover:border-slate-700 transition-all">
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                    <div className="flex items-center gap-2">
                      <span className="px-2 py-0.5 rounded font-mono text-[10px] font-bold bg-slate-800 text-cyan-400 border border-cyan-900/40">
                        {s.eu_db_registration_id}
                      </span>
                      <h4 className="text-xs font-bold text-white">{s.system_name}</h4>
                    </div>
                    <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider ${
                      s.surveillance_status === 'ACTIVE_MONITORING'
                        ? 'bg-emerald-950 text-emerald-400 border border-emerald-800'
                        : 'bg-rose-950 text-rose-400 border border-rose-800 animate-pulse'
                    }`}>
                      {s.surveillance_status.replace(/_/g, ' ')}
                    </span>
                  </div>

                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 text-xs bg-slate-900/60 p-2.5 rounded-lg font-mono text-[11px]">
                    <div>
                      <span className="text-[10px] text-slate-500 block">Model Drift Index</span>
                      <span className={`font-bold ${s.model_drift_index > 0.1 ? 'text-rose-400' : 'text-emerald-400'}`}>
                        {(s.model_drift_index * 100).toFixed(1)}%
                      </span>
                    </div>
                    <div>
                      <span className="text-[10px] text-slate-500 block">Fairness Variance</span>
                      <span className={`font-bold ${s.fairness_variance > 0.05 ? 'text-amber-400' : 'text-slate-200'}`}>
                        {(s.fairness_variance * 100).toFixed(2)}%
                      </span>
                    </div>
                    <div>
                      <span className="text-[10px] text-slate-500 block">Incidents</span>
                      <span className={`font-bold ${s.incident_count > 0 ? 'text-rose-400' : 'text-slate-400'}`}>
                        {s.incident_count}
                      </span>
                    </div>
                    <div>
                      <span className="text-[10px] text-slate-500 block">Authority</span>
                      <span className="text-cyan-400 truncate block">{s.market_authority.split('_')[0]}</span>
                    </div>
                  </div>

                  <p className="text-[11px] text-slate-300 italic bg-slate-900/40 p-2 rounded border border-slate-800/60">
                    "{s.intended_purpose}"
                  </p>

                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pt-1 text-[11px] border-t border-slate-800/60">
                    <span className="text-slate-500 font-mono text-[10px]">
                      Last PMM Ping: {new Date(s.last_telemetry_at).toLocaleTimeString()}
                    </span>
                    <div className="flex items-center gap-1.5">
                      <button
                        onClick={() => handleSendTelemetry(s.id, false)}
                        className="px-2.5 py-1 bg-cyan-600 hover:bg-cyan-500 text-slate-950 rounded-lg text-[10px] font-bold transition-colors cursor-pointer"
                      >
                        Push Normal PMM Ping
                      </button>
                      <button
                        onClick={() => handleSendTelemetry(s.id, true)}
                        className="px-2.5 py-1 bg-rose-900/60 hover:bg-rose-800 text-rose-300 rounded-lg text-[10px] font-bold border border-rose-700 transition-colors cursor-pointer"
                      >
                        Simulate Drift Incident
                      </button>
                    </div>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>

      </div>
    </div>
  );
};
