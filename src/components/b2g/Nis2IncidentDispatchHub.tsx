import React, { useState, useEffect } from 'react';
import { 
  ShieldAlert, 
  Send, 
  Clock, 
  AlertTriangle, 
  CheckCircle2, 
  FileText, 
  Lock, 
  RefreshCw, 
  ChevronRight, 
  Building2, 
  Globe, 
  Radio, 
  FileCheck2,
  Cpu
} from 'lucide-react';
import { fetchWithRetry } from '../../lib/api-client';

interface Nis2Dispatch {
  id: string;
  incident_id: string;
  entity_name: string;
  csirt_agency: string;
  incident_stage: string;
  ioc_summary: string;
  severity_level: string;
  cross_border_impact: number;
  dispatch_status: string;
  sla_deadline: string;
  receipt_signature_sha256: string;
  created_at: string;
}

export const Nis2IncidentDispatchHub: React.FC = () => {
  const [dispatches, setDispatches] = useState<Nis2Dispatch[]>([]);
  const [loading, setLoading] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Form states
  const [incidentId, setIncidentId] = useState(`INC-${Date.now().toString().slice(-5)}`);
  const [entityName, setEntityName] = useState('Acme Sovereign Cloud Infrastructure B.V.');
  const [csirtAgency, setCsirtAgency] = useState('DE_CERT_BUND');
  const [incidentStage, setIncidentStage] = useState('STAGE_1_EARLY_WARNING_24H');
  const [severityLevel, setSeverityLevel] = useState('CRITICAL');
  const [crossBorderImpact, setCrossBorderImpact] = useState(true);
  const [iocSummary, setIocSummary] = useState(`Suspected state-sponsored APT credential stuffing attack against OAuth Sovereign token issuance enclave. 
Detected anomalous egress traffic across 3 EU availability zones (Frankfurt, Paris, Dublin). 
No unencrypted PII exfiltration detected; cryptographic containment protocol engaged.`);

  const fetchDispatches = async () => {
    setLoading(true);
    try {
      const res = await fetchWithRetry('/api/v1/b2g/nis2/dispatches');
      const data = await res.json();
      if (data.success && Array.isArray(data.dispatches)) {
        setDispatches(data.dispatches);
      }
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchDispatches();
  }, []);

  const handleDispatch = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    try {
      const res = await fetchWithRetry('/api/v1/b2g/nis2/dispatch', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          incident_id: incidentId,
          entity_name: entityName,
          csirt_agency: csirtAgency,
          incident_stage: incidentStage,
          severity_level: severityLevel,
          cross_border_impact: crossBorderImpact,
          ioc_summary: iocSummary
        })
      });
      const data = await res.json();
      if (data.success) {
        setIncidentId(`INC-${Date.now().toString().slice(-5)}`);
        fetchDispatches();
      }
    } catch (err) {
      console.error(err);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleAcknowledge = async (id: string) => {
    try {
      const res = await fetchWithRetry(`/api/v1/b2g/nis2/dispatches/${id}/acknowledge`, {
        method: 'POST'
      });
      const data = await res.json();
      if (data.success) {
        fetchDispatches();
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
          <div className="p-3 bg-rose-500/10 text-rose-400 rounded-xl border border-rose-500/20">
            <Radio className="w-6 h-6 animate-pulse" />
          </div>
          <div>
            <h2 className="text-base sm:text-lg font-bold text-white flex items-center gap-2">
              NIS2 & CISA Statutory Incident Dispatch Hub
              <span className="px-2 py-0.5 rounded text-[10px] font-mono bg-rose-500/20 text-rose-300 border border-rose-500/30 font-bold uppercase">
                Art. 23 SLA Enforced
              </span>
            </h2>
            <p className="text-xs text-slate-400 mt-0.5">
              Automated statutory early-warning and incident dispatch to National CSIRTs with immutable cryptographic receipts.
            </p>
          </div>
        </div>

        <button
          onClick={fetchDispatches}
          disabled={loading}
          className="px-3.5 py-2 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded-xl text-xs font-semibold flex items-center gap-1.5 transition-colors self-start sm:self-auto cursor-pointer"
        >
          <RefreshCw className={`w-3.5 h-3.5 ${loading ? 'animate-spin' : ''}`} />
          <span>Refresh Live CSIRT Feed</span>
        </button>
      </div>

      {/* Grid: Form & History */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        
        {/* Left Form: Dispatch Submission */}
        <div className="lg:col-span-5 bg-slate-950 p-4 sm:p-5 rounded-xl border border-slate-800 space-y-4">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold uppercase tracking-wider text-slate-400 flex items-center gap-1.5">
              <Send className="w-3.5 h-3.5 text-rose-400" />
              Dispatch Incident to National Authority
            </span>
            <span className="text-[11px] font-mono text-emerald-400 font-bold bg-emerald-950/40 px-2 py-0.5 rounded border border-emerald-800/40">
              E2EE Active
            </span>
          </div>

          <form onSubmit={handleDispatch} className="space-y-3.5 text-xs">
            <div>
              <label className="block text-slate-400 font-semibold mb-1">Incident Reference ID</label>
              <input
                type="text"
                value={incidentId}
                onChange={(e) => setIncidentId(e.target.value)}
                className="w-full bg-slate-900 border border-slate-700 rounded-lg px-3 py-2 text-slate-100 font-mono text-xs focus:outline-none focus:border-rose-500"
                required
              />
            </div>

            <div>
              <label className="block text-slate-400 font-semibold mb-1">Affected Legal Entity Name</label>
              <input
                type="text"
                value={entityName}
                onChange={(e) => setEntityName(e.target.value)}
                className="w-full bg-slate-900 border border-slate-700 rounded-lg px-3 py-2 text-slate-100 text-xs focus:outline-none focus:border-rose-500"
                required
              />
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-slate-400 font-semibold mb-1">Target National CSIRT</label>
                <select
                  value={csirtAgency}
                  onChange={(e) => setCsirtAgency(e.target.value)}
                  className="w-full bg-slate-900 border border-slate-700 rounded-lg px-2.5 py-2 text-slate-100 text-xs focus:outline-none focus:border-rose-500"
                >
                  <option value="DE_CERT_BUND">BSI / CERT-Bund (Germany)</option>
                  <option value="FR_ANSSI">ANSSI CSIRT (France)</option>
                  <option value="IE_NCSC">NCSC Ireland</option>
                  <option value="US_CISA">CISA National (USA CIRCIA)</option>
                  <option value="SA_NCSC">NCSC / NCA (Saudi Arabia)</option>
                  <option value="UAE_NCSC">Cyber Security Council (UAE)</option>
                </select>
              </div>

              <div>
                <label className="block text-slate-400 font-semibold mb-1">Statutory Stage</label>
                <select
                  value={incidentStage}
                  onChange={(e) => setIncidentStage(e.target.value)}
                  className="w-full bg-slate-900 border border-slate-700 rounded-lg px-2.5 py-2 text-slate-100 text-xs focus:outline-none focus:border-rose-500 font-medium"
                >
                  <option value="STAGE_1_EARLY_WARNING_24H">Stage 1: Early Warning (24h)</option>
                  <option value="STAGE_2_NOTIFICATION_72H">Stage 2: Incident Notification (72h)</option>
                  <option value="STAGE_3_INTERMEDIATE">Stage 3: Intermediate Progress</option>
                  <option value="STAGE_4_FINAL_1M">Stage 4: Comprehensive Final (1mo)</option>
                </select>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-slate-400 font-semibold mb-1">Severity Rating</label>
                <select
                  value={severityLevel}
                  onChange={(e) => setSeverityLevel(e.target.value)}
                  className="w-full bg-slate-900 border border-slate-700 rounded-lg px-2.5 py-2 text-slate-100 text-xs focus:outline-none focus:border-rose-500 font-semibold text-rose-400"
                >
                  <option value="CRITICAL">CRITICAL (System Downtime / Breach)</option>
                  <option value="HIGH">HIGH (Targeted Sovereign Exploitation)</option>
                  <option value="MEDIUM">MEDIUM (Anomalous Probe Attempt)</option>
                </select>
              </div>

              <div className="flex flex-col justify-end">
                <label className="flex items-center gap-2 cursor-pointer pb-2">
                  <input
                    type="checkbox"
                    checked={crossBorderImpact}
                    onChange={(e) => setCrossBorderImpact(e.target.checked)}
                    className="rounded bg-slate-900 border-slate-700 text-rose-500 focus:ring-0"
                  />
                  <span className="text-xs text-slate-300 font-semibold">Cross-Border EU Impact</span>
                </label>
              </div>
            </div>

            <div>
              <label className="block text-slate-400 font-semibold mb-1">Indicators of Compromise (IoC) & Forensic Summary</label>
              <textarea
                rows={3}
                value={iocSummary}
                onChange={(e) => setIocSummary(e.target.value)}
                className="w-full bg-slate-900 border border-slate-700 rounded-lg p-2.5 text-slate-100 font-mono text-[11px] focus:outline-none focus:border-rose-500"
                required
              />
            </div>

            <button
              type="submit"
              disabled={isSubmitting}
              className="w-full py-2.5 bg-rose-600 hover:bg-rose-500 text-white rounded-xl font-bold text-xs transition-all shadow-md flex items-center justify-center gap-2 cursor-pointer"
            >
              {isSubmitting ? <RefreshCw className="w-4 h-4 animate-spin" /> : <Send className="w-4 h-4" />}
              <span>{isSubmitting ? 'Transmitting to CSIRT...' : 'Dispatch Statutory Incident Telemetry'}</span>
            </button>
          </form>
        </div>

        {/* Right Ledger: Dispatched Incident Logs */}
        <div className="lg:col-span-7 space-y-3">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold uppercase tracking-wider text-slate-400 flex items-center gap-1.5">
              <Clock className="w-3.5 h-3.5 text-indigo-400" />
              Sovereign Authority Dispatch Ledger ({dispatches.length})
            </span>
            <span className="text-[11px] text-slate-500">Live CSIRT Callback Tracking</span>
          </div>

          <div className="space-y-3 max-h-[480px] overflow-y-auto pr-1">
            {dispatches.length === 0 ? (
              <div className="p-8 text-center bg-slate-950/60 rounded-xl border border-slate-800 text-slate-500 text-xs">
                No statutory incidents currently logged. All sovereign systems operating within standard baseline.
              </div>
            ) : (
              dispatches.map((d) => (
                <div key={d.id} className="p-4 bg-slate-950 rounded-xl border border-slate-800 space-y-3 hover:border-slate-700 transition-all">
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                    <div className="flex items-center gap-2">
                      <span className="px-2 py-0.5 rounded font-mono text-[10px] font-bold bg-slate-800 text-rose-400 border border-rose-900/40">
                        {d.incident_id}
                      </span>
                      <h4 className="text-xs font-bold text-white">{d.entity_name}</h4>
                    </div>
                    <div className="flex items-center gap-2">
                      <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider ${
                        d.dispatch_status === 'ACKNOWLEDGED_BY_CSIRT'
                          ? 'bg-emerald-950 text-emerald-400 border border-emerald-800'
                          : 'bg-amber-950 text-amber-400 border border-amber-800'
                      }`}>
                        {d.dispatch_status}
                      </span>
                    </div>
                  </div>

                  <div className="grid grid-cols-2 sm:grid-cols-3 gap-2 text-xs bg-slate-900/60 p-2.5 rounded-lg font-mono text-[11px]">
                    <div>
                      <span className="text-[10px] text-slate-500 block">CSIRT Agency</span>
                      <span className="text-indigo-400 font-bold">{d.csirt_agency}</span>
                    </div>
                    <div>
                      <span className="text-[10px] text-slate-500 block">Stage / SLA</span>
                      <span className="text-slate-300">{d.incident_stage.replace('STAGE_', 'S')}</span>
                    </div>
                    <div>
                      <span className="text-[10px] text-slate-500 block">SLA Deadline</span>
                      <span className="text-amber-400 font-semibold">{new Date(d.sla_deadline).toLocaleTimeString()}</span>
                    </div>
                  </div>

                  <p className="text-[11px] text-slate-300 line-clamp-2 italic font-mono bg-slate-900/40 p-2 rounded border border-slate-800/60">
                    "{d.ioc_summary}"
                  </p>

                  <div className="flex items-center justify-between pt-1 text-[11px] border-t border-slate-800/60">
                    <span className="text-slate-500 font-mono truncate max-w-[240px]">
                      Seal: {d.receipt_signature_sha256.slice(0, 24)}...
                    </span>
                    {d.dispatch_status !== 'ACKNOWLEDGED_BY_CSIRT' && (
                      <button
                        onClick={() => handleAcknowledge(d.id)}
                        className="px-3 py-1 bg-emerald-600 hover:bg-emerald-500 text-slate-950 rounded-lg text-xs font-bold transition-colors cursor-pointer"
                      >
                        Simulate CSIRT ACK Receipt
                      </button>
                    )}
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
