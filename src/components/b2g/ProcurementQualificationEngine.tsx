import React, { useState, useEffect } from 'react';
import { ShieldCheck, Award, AlertCircle, CheckCircle2, Cpu, RefreshCw, FileText, Lock, Globe, ExternalLink } from 'lucide-react';

interface QualificationRecord {
  id: string;
  system_name: string;
  target_framework: 'FEDRAMP_HIGH' | 'SDAIA_CLOUD_L3' | 'ISO_27001_27701' | 'EU_AI_ACT_HIGH_RISK' | 'SOC2_TYPE2';
  score_percentage: number;
  status: 'QUALIFIED' | 'CONDITIONAL' | 'FAILED';
  gap_analysis_json: string;
  certificate_seal_hash: string;
  issued_at: string;
  expires_at: string;
}

export const ProcurementQualificationEngine: React.FC = () => {
  const [systemName, setSystemName] = useState('9Xen Regulettee Sovereign Cloud Kernel');
  const [targetFramework, setTargetFramework] = useState<'FEDRAMP_HIGH' | 'SDAIA_CLOUD_L3' | 'ISO_27001_27701' | 'EU_AI_ACT_HIGH_RISK' | 'SOC2_TYPE2'>('FEDRAMP_HIGH');
  const [isEvaluating, setIsEvaluating] = useState(false);
  const [history, setHistory] = useState<QualificationRecord[]>([]);
  const [activeQual, setActiveQual] = useState<QualificationRecord | null>(null);

  const fetchQualifications = async () => {
    try {
      const res = await fetch('/api/v1/b2g/procurement/qualifications');
      const data = await res.json();
      if (data.success) {
        setHistory(data.qualifications);
        if (data.qualifications.length > 0 && !activeQual) {
          setActiveQual(data.qualifications[0]);
        }
      }
    } catch (e) {
      console.error(e);
    }
  };

  useEffect(() => {
    fetchQualifications();
  }, []);

  const handleEvaluate = async () => {
    setIsEvaluating(true);
    try {
      const res = await fetch('/api/v1/b2g/procurement/tender-qualification', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          system_name: systemName,
          target_framework: targetFramework
        })
      });
      const data = await res.json();
      if (data.success) {
        setActiveQual(data.qualification);
        await fetchQualifications();
      }
    } catch (e) {
      console.error(e);
    } finally {
      setIsEvaluating(false);
    }
  };

  return (
    <div className="bg-slate-900 border border-slate-800 rounded-2xl p-5 text-slate-100 space-y-6">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-slate-800 pb-4">
        <div className="flex items-center gap-2">
          <div className="p-2 bg-amber-500/10 text-amber-400 rounded-xl border border-amber-500/20">
            <Award className="w-5 h-5" />
          </div>
          <div>
            <h3 className="font-bold text-base text-white">Public Procurement & Government Tender Qualification Engine</h3>
            <p className="text-xs text-slate-400">Automated pre-qualification screening & digital attestation seal for RFP compliance</p>
          </div>
        </div>
        <button
          onClick={fetchQualifications}
          className="px-3 py-1.5 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded-lg text-xs font-mono font-bold flex items-center gap-1.5 cursor-pointer self-start md:self-auto"
        >
          <RefreshCw className="w-3.5 h-3.5" />
          <span>Refresh</span>
        </button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Input Form */}
        <div className="lg:col-span-5 bg-slate-950/60 border border-slate-800 rounded-xl p-4 space-y-4">
          <h4 className="text-xs font-bold text-slate-300 uppercase tracking-wider flex items-center gap-2">
            <Cpu className="w-4 h-4 text-amber-400" />
            System Tender Pre-Screening
          </h4>

          <div className="space-y-3 text-xs">
            <div>
              <label className="block text-slate-400 font-medium mb-1">Target Government System Name</label>
              <input
                type="text"
                value={systemName}
                onChange={e => setSystemName(e.target.value)}
                className="w-full bg-slate-900 border border-slate-800 rounded-lg px-3 py-2 text-white font-mono text-xs focus:outline-none focus:border-amber-500"
              />
            </div>

            <div>
              <label className="block text-slate-400 font-medium mb-1">Target Qualification Framework</label>
              <select
                value={targetFramework}
                onChange={e => setTargetFramework(e.target.value as any)}
                className="w-full bg-slate-900 border border-slate-800 rounded-lg px-3 py-2 text-white font-mono text-xs focus:outline-none focus:border-amber-500"
              >
                <option value="FEDRAMP_HIGH">FedRAMP High / DoD IL5 Authorization</option>
                <option value="SDAIA_CLOUD_L3">SDAIA Cloud Classification Level 3 (Saudi Arabia)</option>
                <option value="EU_AI_ACT_HIGH_RISK">EU AI Act High-Risk System Annex III Compliance</option>
                <option value="ISO_27001_27701">ISO/IEC 27001:2022 & ISO 27701 Privacy Extension</option>
                <option value="SOC2_TYPE2">SOC 2 Type II Security & Availability</option>
              </select>
            </div>

            <button
              onClick={handleEvaluate}
              disabled={isEvaluating}
              className="w-full py-2.5 bg-amber-500 hover:bg-amber-400 font-bold text-slate-950 rounded-lg transition-colors cursor-pointer flex items-center justify-center gap-2"
            >
              {isEvaluating ? <RefreshCw className="w-4 h-4 animate-spin" /> : <ShieldCheck className="w-4 h-4" />}
              <span>{isEvaluating ? 'Evaluating System Audit Logs...' : 'Run Pre-Qualification Audit'}</span>
            </button>
          </div>
        </div>

        {/* Audit Qualification Passport */}
        <div className="lg:col-span-7 space-y-4">
          {activeQual ? (
            <div className="bg-slate-950/60 border border-slate-800 rounded-xl p-5 space-y-4 relative overflow-hidden">
              <div className="flex items-center justify-between border-b border-slate-800 pb-3">
                <div>
                  <h4 className="font-bold text-sm text-white">{activeQual.system_name}</h4>
                  <p className="text-xs text-amber-400 font-mono font-bold mt-0.5">{activeQual.target_framework}</p>
                </div>
                <div className="text-right">
                  <div className="text-2xl font-black text-emerald-400 font-mono">{activeQual.score_percentage}%</div>
                  <span className="text-[10px] uppercase font-bold text-slate-400">Compliance Readiness</span>
                </div>
              </div>

              {/* Digital Attestation Badge */}
              <div className="p-3 bg-slate-900 border border-slate-800 rounded-xl space-y-2">
                <div className="flex items-center justify-between text-xs">
                  <span className="text-slate-400">Cryptographic Seal Hash (SHA-256):</span>
                  <span className="text-emerald-400 font-mono font-bold">VERIFIED SEAL</span>
                </div>
                <div className="p-2 bg-slate-950 rounded border border-slate-800 font-mono text-[10px] text-amber-300 break-all select-all">
                  {activeQual.certificate_seal_hash}
                </div>
                <div className="flex justify-between text-[11px] text-slate-500 font-mono pt-1">
                  <span>Issued: {new Date(activeQual.issued_at).toLocaleDateString()}</span>
                  <span>Valid Until: {activeQual.expires_at}</span>
                </div>
              </div>

              {/* Gap Analysis */}
              <div>
                <h5 className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-2">Required Control Gap Remediation</h5>
                {(() => {
                  const gaps = typeof activeQual.gap_analysis_json === 'string' ? JSON.parse(activeQual.gap_analysis_json || '[]') : (activeQual.gap_analysis_json || []);
                  if (gaps.length === 0) {
                    return (
                      <div className="p-3 bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 rounded-lg text-xs flex items-center gap-2">
                        <CheckCircle2 className="w-4 h-4" />
                        <span>All mandatory government control prerequisites verified successfully.</span>
                      </div>
                    );
                  }
                  return (
                    <div className="space-y-1.5">
                      {gaps.map((g: any, idx: number) => (
                        <div key={idx} className="p-2 bg-slate-900 border border-slate-800 rounded-lg text-xs flex items-start gap-2">
                          <AlertCircle className="w-3.5 h-3.5 text-amber-400 shrink-0 mt-0.5" />
                          <div>
                            <span className="font-mono font-bold text-amber-300 mr-2">{g.control}:</span>
                            <span className="text-slate-300">{g.description}</span>
                          </div>
                        </div>
                      ))}
                    </div>
                  );
                })()}
              </div>
            </div>
          ) : (
            <div className="p-8 text-center bg-slate-950/40 border border-slate-800 rounded-xl text-slate-500 text-xs">
              Select or initiate a pre-qualification assessment above.
            </div>
          )}

          {/* Qualification History */}
          <div className="space-y-2">
            <h5 className="text-xs font-bold text-slate-400 uppercase tracking-wider">Issued Qualifications ({history.length})</h5>
            <div className="space-y-2 max-h-48 overflow-y-auto pr-1">
              {history.map(item => (
                <div
                  key={item.id}
                  onClick={() => setActiveQual(item)}
                  className={`p-2.5 rounded-lg border text-xs transition-all cursor-pointer flex items-center justify-between ${
                    activeQual?.id === item.id ? 'bg-slate-800 border-amber-500/50 text-white' : 'bg-slate-900/60 border-slate-800 text-slate-400 hover:bg-slate-800/40'
                  }`}
                >
                  <div className="flex items-center gap-2 font-mono">
                    <Award className="w-3.5 h-3.5 text-amber-400" />
                    <span>{item.system_name}</span>
                  </div>
                  <div className="flex items-center gap-3">
                    <span className="font-mono font-bold text-emerald-400">{item.score_percentage}%</span>
                    <span className="text-[10px] text-slate-500 font-mono">{item.target_framework}</span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
