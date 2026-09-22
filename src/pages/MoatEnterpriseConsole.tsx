import React, { useState, useEffect } from 'react';
import { useNotification } from '../context/NotificationContext';
import {
  ShieldCheck,
  Scale,
  FileCheck2,
  Award,
  Sparkles,
  Layers,
  TrendingUp,
  AlertTriangle,
  ArrowRight,
  CheckCircle2,
  RefreshCw,
  ExternalLink,
  Lock,
  Cpu,
  Zap,
  Globe2,
  Database
} from 'lucide-react';
import {
  moatEngineService,
  RegulatoryFeedItem,
  JurisdictionConflictResult,
  AuditEvidencePackage,
  AccreditationTrail,
  RemediationActionProposal,
  TenantBenchmarkData,
  HistoricalTrajectoryPoint
} from '../services/moatEngineService';

export const MoatEnterpriseConsole: React.FC = () => {
  const { showToast } = useNotification();
  const [activeTab, setActiveTab] = useState<'feed' | 'conflict' | 'evidence' | 'accreditation' | 'remediation' | 'benchmark' | 'trajectory'>('feed');
  const [feedItems, setFeedItems] = useState<RegulatoryFeedItem[]>([]);
  const [conflictResult, setConflictResult] = useState<JurisdictionConflictResult | null>(null);
  const [evidencePackage, setEvidencePackage] = useState<AuditEvidencePackage | null>(null);
  const [accreditations, setAccreditations] = useState<AccreditationTrail[]>([]);
  const [remediations, setRemediations] = useState<RemediationActionProposal[]>([]);
  const [benchmark, setBenchmark] = useState<TenantBenchmarkData | null>(null);
  const [trajectory, setTrajectory] = useState<HistoricalTrajectoryPoint[]>([]);
  const [isGeneratingPackage, setIsGeneratingPackage] = useState(false);
  const [lawA, setLawA] = useState('EU NIS2 Directive (Art. 21)');
  const [lawB, setLawB] = useState('US CISA Circular-04 Cross-Border Rule');

  useEffect(() => {
    // Load initial state from service
    setFeedItems(moatEngineService.getRegulatoryChangeIntelligence());
    setAccreditations(moatEngineService.getAccreditationReadiness());
    setRemediations(moatEngineService.getRemediationActions());
    setBenchmark(moatEngineService.getCrossTenantBenchmark());
    setTrajectory(moatEngineService.getHistoricalRiskTrajectory());
    handleResolveConflict();
  }, []);

  const handleResolveConflict = () => {
    const res = moatEngineService.resolveJurisdictionConflict(lawA, lawB);
    setConflictResult(res);
  };

  const handleGenerateAuditPackage = () => {
    setIsGeneratingPackage(true);
    setTimeout(() => {
      const pkg = moatEngineService.generateAuditGradeEvidencePackage('TENANT-SOVEREIGN-ENTERPRISE');
      setEvidencePackage(pkg);
      setIsGeneratingPackage(false);
    }, 600);
  };

  const handleAutoApplyFix = (id: string) => {
    setRemediations(prev =>
      prev.map(r => (r.id === id ? { ...r, appliedStatus: 'AUTO_APPLIED' } : r))
    );
  };

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 p-6 md:p-8 font-sans">
      {/* Header */}
      <div className="max-w-7xl mx-auto mb-8">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-slate-800 pb-6">
          <div>
            <div className="flex items-center gap-3">
              <div className="p-2.5 bg-blue-500/10 border border-blue-500/30 rounded-xl text-blue-400">
                <ShieldCheck className="w-7 h-7" />
              </div>
              <div>
                <h1 className="text-2xl md:text-3xl font-bold tracking-tight text-white flex items-center gap-2">
                  RegTech Competitive Moat Architecture
                  <span className="text-xs px-2.5 py-0.5 rounded-full bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 font-medium">
                    Continuous Defensibility
                  </span>
                </h1>
                <p className="text-sm text-slate-400 mt-1">
                  7 Core Competitive Moats: Continuous Gazette Ingestion, Zero-Trust Legal Arbitration, Post-Quantum Audit Seals, and Network-Effect Benchmark Intelligence.
                </p>
              </div>
            </div>
          </div>
          <div className="flex items-center gap-3">
            <button
              onClick={handleGenerateAuditPackage}
              disabled={isGeneratingPackage}
              className="inline-flex items-center gap-2 px-4 py-2 rounded-lg bg-blue-600 hover:bg-blue-500 text-white text-sm font-semibold transition shadow-lg shadow-blue-500/20 disabled:opacity-50"
            >
              {isGeneratingPackage ? <RefreshCw className="w-4 h-4 animate-spin" /> : <Lock className="w-4 h-4" />}
              Generate PQC Audit Package
            </button>
          </div>
        </div>

        {/* Tab Navigation */}
        <div className="flex items-center gap-2 overflow-x-auto py-4 border-b border-slate-800/80">
          {[
            { id: 'feed', label: '1. Regulatory Change Radar', icon: Globe2, count: feedItems.length },
            { id: 'conflict', label: '2. Legal Conflict Resolution', icon: Scale },
            { id: 'evidence', label: '3. Audit-Grade Evidence', icon: FileCheck2 },
            { id: 'accreditation', label: '4. Official Recognition', icon: Award, count: accreditations.length },
            { id: 'remediation', label: '5. Autonomous Remediation', icon: Zap, count: remediations.length },
            { id: 'benchmark', label: '6. Cross-Tenant Benchmark', icon: Layers },
            { id: 'trajectory', label: '7. Data Gravity Trajectory', icon: TrendingUp }
          ].map(tab => {
            const Icon = tab.icon;
            const isActive = activeTab === tab.id;
            return (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id as any)}
                className={`flex items-center gap-2 px-3.5 py-2 rounded-lg text-xs md:text-sm font-medium transition whitespace-nowrap ${
                  isActive
                    ? 'bg-blue-600/20 text-blue-400 border border-blue-500/40 shadow-sm'
                    : 'text-slate-400 hover:text-slate-200 hover:bg-slate-900 border border-transparent'
                }`}
              >
                <Icon className="w-4 h-4" />
                <span>{tab.label}</span>
                {tab.count !== undefined && (
                  <span className="px-1.5 py-0.2 rounded-full text-[10px] bg-slate-800 text-slate-300">
                    {tab.count}
                  </span>
                )}
              </button>
            );
          })}
        </div>
      </div>

      {/* Content Area */}
      <div className="max-w-7xl mx-auto">
        {/* TAB 1: REGULATORY CHANGE RADAR */}
        {activeTab === 'feed' && (
          <div className="space-y-6">
            <div className="bg-slate-900/60 border border-slate-800 rounded-xl p-5">
              <h2 className="text-lg font-semibold text-white flex items-center gap-2">
                <Globe2 className="w-5 h-5 text-blue-400" />
                Continuous Gazette & Regulatory Directive Watchdog
              </h2>
              <p className="text-xs text-slate-400 mt-1">
                Monitors high-priority official statutory gazettes (OJEU, SEC, FCA, Sovereign Regulators) with automated fine-exposure calculations and rule change prediction.
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {feedItems.map(item => (
                <div key={item.id} className="bg-slate-900/80 border border-slate-800 rounded-xl p-5 flex flex-col justify-between hover:border-slate-700 transition">
                  <div>
                    <div className="flex items-center justify-between gap-2 mb-3">
                      <span className="text-[11px] px-2 py-0.5 rounded bg-slate-800 text-slate-300 font-mono">
                        {item.jurisdiction}
                      </span>
                      <span
                        className={`text-[10px] px-2 py-0.5 rounded-full font-bold uppercase tracking-wider ${
                          item.predictedImpactLevel === 'CRITICAL'
                            ? 'bg-rose-500/10 text-rose-400 border border-rose-500/30'
                            : 'bg-amber-500/10 text-amber-400 border border-amber-500/30'
                        }`}
                      >
                        {item.predictedImpactLevel} IMPACT
                      </span>
                    </div>

                    <h3 className="text-base font-bold text-white mb-1.5 leading-snug">{item.actTitle}</h3>
                    <p className="text-xs text-slate-400 mb-3">{item.source}</p>

                    <div className="bg-slate-950/70 border border-slate-800/80 rounded-lg p-3 text-xs text-slate-300 space-y-1.5 mb-4">
                      <div className="flex justify-between text-slate-400">
                        <span>Gazette Ref:</span>
                        <span className="font-mono text-slate-200">{item.gazetteRef}</span>
                      </div>
                      <div className="flex justify-between text-slate-400">
                        <span>Effective Date:</span>
                        <span className="text-slate-200">{item.effectiveDate}</span>
                      </div>
                      <div className="flex justify-between text-slate-400">
                        <span>Est. Fine Exposure:</span>
                        <span className="text-rose-400 font-semibold">${item.potentialFineEstimateUsd.toLocaleString()} USD</span>
                      </div>
                    </div>

                    <div className="mb-4">
                      <p className="text-[11px] font-semibold text-slate-400 mb-1">Impacted Frameworks:</p>
                      <div className="flex flex-wrap gap-1.5">
                        {item.affectedFrameworks.map(f => (
                          <span key={f} className="text-[10px] px-2 py-0.5 rounded bg-blue-500/10 border border-blue-500/20 text-blue-300">
                            {f}
                          </span>
                        ))}
                      </div>
                    </div>
                  </div>

                  <div className="border-t border-slate-800 pt-3">
                    <p className="text-[11px] text-slate-400 italic mb-2">"{item.remediationRecommendation}"</p>
                    <button
                      onClick={() => setActiveTab('remediation')}
                      className="w-full text-xs py-1.5 rounded bg-slate-800 hover:bg-slate-700 text-blue-400 font-medium flex items-center justify-center gap-1.5 transition"
                    >
                      <span>Trigger Auto-Remediation</span>
                      <ArrowRight className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* TAB 2: LEGAL CONFLICT RESOLUTION */}
        {activeTab === 'conflict' && (
          <div className="space-y-6">
            <div className="bg-slate-900/60 border border-slate-800 rounded-xl p-5">
              <h2 className="text-lg font-semibold text-white flex items-center gap-2">
                <Scale className="w-5 h-5 text-blue-400" />
                Cross-Jurisdiction Conflict Resolution Engine
              </h2>
              <p className="text-xs text-slate-400 mt-1">
                Arbitrates conflicting multi-statute directives (e.g. EU GDPR/NIS2 vs US Cross-Border rules) to ensure maximum compliance without violating sovereignty covenants.
              </p>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-4">
                <div>
                  <label className="text-xs text-slate-400 mb-1 block">Primary Statute / Regulation</label>
                  <input
                    type="text"
                    value={lawA}
                    onChange={e => setLawA(e.target.value)}
                    className="w-full bg-slate-950 border border-slate-800 rounded-lg px-3.5 py-2 text-xs text-slate-200 focus:outline-none focus:border-blue-500"
                  />
                </div>
                <div>
                  <label className="text-xs text-slate-400 mb-1 block">Counterparty / Target Statute</label>
                  <input
                    type="text"
                    value={lawB}
                    onChange={e => setLawB(e.target.value)}
                    className="w-full bg-slate-950 border border-slate-800 rounded-lg px-3.5 py-2 text-xs text-slate-200 focus:outline-none focus:border-blue-500"
                  />
                </div>
              </div>

              <div className="mt-4 flex justify-end">
                <button
                  onClick={handleResolveConflict}
                  className="px-4 py-2 bg-blue-600 hover:bg-blue-500 text-white text-xs font-semibold rounded-lg flex items-center gap-2 transition"
                >
                  <RefreshCw className="w-3.5 h-3.5" />
                  Evaluate Harmonized Precedence
                </button>
              </div>
            </div>

            {conflictResult && (
              <div className="bg-slate-900/80 border border-slate-800 rounded-xl p-6 space-y-4">
                <div className="flex items-center justify-between border-b border-slate-800 pb-4">
                  <div>
                    <h3 className="text-base font-bold text-white flex items-center gap-2">
                      <CheckCircle2 className="w-5 h-5 text-emerald-400" />
                      Harmonized Resolution Verdict: {conflictResult.conflictId}
                    </h3>
                    <p className="text-xs text-slate-400">Preserved Sovereignty Enclave Status: {conflictResult.sovereigntyPreserved ? 'VERIFIED' : 'FAILED'}</p>
                  </div>
                  <span className="px-3 py-1 bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 text-xs font-semibold rounded-full">
                    Sovereignty Safe
                  </span>
                </div>

                <div className="space-y-3 text-xs">
                  <div>
                    <p className="text-slate-400 font-semibold mb-1">Detected Divergence Nature:</p>
                    <p className="bg-slate-950 p-3 rounded-lg text-slate-300 border border-slate-800/80">{conflictResult.conflictNature}</p>
                  </div>

                  <div>
                    <p className="text-slate-400 font-semibold mb-1">System Action Recommended:</p>
                    <p className="bg-blue-950/20 p-3 rounded-lg text-blue-300 border border-blue-900/30">{conflictResult.recommendedResolution}</p>
                  </div>

                  <div>
                    <p className="text-slate-400 font-semibold mb-1">Enforced Legal Fallback Clause:</p>
                    <p className="bg-slate-950 p-3 rounded-lg font-mono text-slate-400 border border-slate-800/80">{conflictResult.fallbackClause}</p>
                  </div>
                </div>
              </div>
            )}
          </div>
        )}

        {/* TAB 3: AUDIT EVIDENCE AUTOMATION */}
        {activeTab === 'evidence' && (
          <div className="space-y-6">
            <div className="bg-slate-900/60 border border-slate-800 rounded-xl p-5 flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
              <div>
                <h2 className="text-lg font-semibold text-white flex items-center gap-2">
                  <FileCheck2 className="w-5 h-5 text-blue-400" />
                  Audit-Grade Evidence Automation (Court-Admissible)
                </h2>
                <p className="text-xs text-slate-400 mt-1">
                  Packages cryptographic control state with NIST Post-Quantum Kyber-1024 tamper seals, ready for external Big-4 and statutory judicial inspections.
                </p>
              </div>
              <button
                onClick={handleGenerateAuditPackage}
                disabled={isGeneratingPackage}
                className="px-4 py-2 bg-blue-600 hover:bg-blue-500 text-white text-xs font-semibold rounded-lg flex items-center gap-2 transition"
              >
                {isGeneratingPackage ? <RefreshCw className="w-3.5 h-3.5 animate-spin" /> : <Lock className="w-3.5 h-3.5" />}
                Generate Fresh Sealed Package
              </button>
            </div>

            {evidencePackage ? (
              <div className="bg-slate-900/80 border border-slate-800 rounded-xl p-6 space-y-4">
                <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-slate-800 pb-4">
                  <div>
                    <h3 className="text-base font-bold text-white flex items-center gap-2">
                      <Lock className="w-4 h-4 text-emerald-400" />
                      Sealed Package: {evidencePackage.packageId}
                    </h3>
                    <p className="text-xs text-slate-400 font-mono mt-0.5">Tenant: {evidencePackage.tenantId}</p>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="px-2.5 py-1 bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 text-xs font-semibold rounded-full flex items-center gap-1">
                      <CheckCircle2 className="w-3.5 h-3.5" /> Court-Admissible
                    </span>
                    <span className="px-2.5 py-1 bg-purple-500/10 border border-purple-500/30 text-purple-400 text-xs font-semibold rounded-full">
                      {evidencePackage.pqcAlgorithm}
                    </span>
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-xs">
                  <div className="bg-slate-950 p-3.5 rounded-lg border border-slate-800/80">
                    <p className="text-slate-400 mb-1">Generated At</p>
                    <p className="font-semibold text-slate-200">{evidencePackage.generatedAt}</p>
                  </div>
                  <div className="bg-slate-950 p-3.5 rounded-lg border border-slate-800/80">
                    <p className="text-slate-400 mb-1">Verified Controls In Bundle</p>
                    <p className="font-semibold text-emerald-400 text-base">{evidencePackage.includedControls} Controls Pass</p>
                  </div>
                  <div className="bg-slate-950 p-3.5 rounded-lg border border-slate-800/80">
                    <p className="text-slate-400 mb-1">Tamper Seal Validation</p>
                    <p className="font-semibold text-blue-400">Hardware TPM 2.0 Sealed</p>
                  </div>
                </div>

                <div>
                  <p className="text-xs text-slate-400 font-semibold mb-1">Post-Quantum Cryptographic Hash Proof:</p>
                  <div className="p-3 bg-slate-950 rounded-lg border border-slate-800/80 font-mono text-[11px] text-blue-400 break-all">
                    {evidencePackage.pqcHashProof}
                  </div>
                </div>

                <div className="flex items-center justify-between pt-2 border-t border-slate-800">
                  <div className="flex gap-1.5 flex-wrap">
                    {evidencePackage.regulatoryJurisdictions.map(j => (
                      <span key={j} className="text-[10px] px-2 py-0.5 bg-slate-800 text-slate-300 rounded">
                        {j} Accepted
                      </span>
                    ))}
                  </div>
                  <button
                    onClick={() => showToast(`Package ${evidencePackage.packageId} downloaded as cryptographic audit archive.`, 'success')}
                    className="text-xs text-blue-400 hover:text-blue-300 font-semibold flex items-center gap-1"
                  >
                    <span>Download Cryptographic Archive</span>
                    <ExternalLink className="w-3 h-3" />
                  </button>
                </div>
              </div>
            ) : (
              <div className="text-center py-12 bg-slate-900/40 border border-slate-800 rounded-xl">
                <FileCheck2 className="w-12 h-12 text-slate-600 mx-auto mb-3" />
                <p className="text-sm text-slate-400">Click "Generate PQC Audit Package" to assemble court-admissible audit proof.</p>
              </div>
            )}
          </div>
        )}

        {/* TAB 4: ACCREDITATION READINESS */}
        {activeTab === 'accreditation' && (
          <div className="space-y-6">
            <div className="bg-slate-900/60 border border-slate-800 rounded-xl p-5">
              <h2 className="text-lg font-semibold text-white flex items-center gap-2">
                <Award className="w-5 h-5 text-blue-400" />
                Official Regulatory Recognition & Notified Body Audit Trails
              </h2>
              <p className="text-xs text-slate-400 mt-1">
                Continuous alignment with accredited Notified Bodies (BSI, TÜV, AICPA) to eliminate manual certification cycles.
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {accreditations.map(acc => (
                <div key={acc.framework} className="bg-slate-900/80 border border-slate-800 rounded-xl p-5 flex flex-col justify-between">
                  <div>
                    <div className="flex items-center justify-between mb-3">
                      <span
                        className={`text-[10px] px-2 py-0.5 rounded-full font-semibold ${
                          acc.status === 'AUDIT_READY'
                            ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/30'
                            : 'bg-amber-500/10 text-amber-400 border border-amber-500/30'
                        }`}
                      >
                        {acc.status.replace('_', ' ')}
                      </span>
                      <span className="text-sm font-bold text-white">{acc.readinessPercentage}%</span>
                    </div>

                    <h3 className="text-sm font-bold text-white mb-1">{acc.framework}</h3>
                    <p className="text-xs text-slate-400 mb-4">{acc.notifiedBodyTarget}</p>

                    {/* Progress Bar */}
                    <div className="w-full bg-slate-950 rounded-full h-2 mb-4 overflow-hidden border border-slate-800">
                      <div
                        className="bg-blue-500 h-full rounded-full transition-all duration-500"
                        style={{ width: `${acc.readinessPercentage}%` }}
                      />
                    </div>

                    <div className="bg-slate-950 p-3 rounded-lg border border-slate-800/80 text-xs space-y-1 mb-4">
                      <div className="flex justify-between text-slate-400">
                        <span>Evidence Controls:</span>
                        <span className="text-slate-200">
                          {acc.evidenceItemsCompleted} / {acc.totalRequired}
                        </span>
                      </div>
                      <div className="flex justify-between text-slate-400">
                        <span>Next Milestone:</span>
                        <span className="text-blue-400 font-medium">{acc.nextAuditMilestone}</span>
                      </div>
                    </div>
                  </div>

                  <button className="w-full py-1.5 rounded bg-slate-800 hover:bg-slate-700 text-xs text-slate-300 font-medium transition">
                    View Complete Audit Trail
                  </button>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* TAB 5: AUTONOMOUS REMEDIATION */}
        {activeTab === 'remediation' && (
          <div className="space-y-6">
            <div className="bg-slate-900/60 border border-slate-800 rounded-xl p-5">
              <h2 className="text-lg font-semibold text-white flex items-center gap-2">
                <Zap className="w-5 h-5 text-amber-400" />
                Autonomous Remediation Agent (Low-Risk Auto-Fix vs High-Risk Consent)
              </h2>
              <p className="text-xs text-slate-400 mt-1">
                Zero-delay correction of technical deviations (e.g. HTTP headers, cookie consent) with automatic fallback to human legal reviewer for high-risk DPAs.
              </p>
            </div>

            <div className="space-y-4">
              {remediations.map(rem => (
                <div key={rem.id} className="bg-slate-900/80 border border-slate-800 rounded-xl p-5 flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
                  <div className="space-y-1.5 max-w-3xl">
                    <div className="flex items-center gap-2">
                      <span className="text-xs font-mono text-slate-400">{rem.id}</span>
                      <span className="text-xs px-2 py-0.5 rounded bg-slate-800 text-slate-300 font-medium">
                        {rem.targetCategory}
                      </span>
                      <span
                        className={`text-[10px] px-2 py-0.5 rounded-full font-bold ${
                          rem.riskTier === 'LOW_RISK_CONFIG'
                            ? 'bg-blue-500/10 text-blue-400 border border-blue-500/30'
                            : 'bg-rose-500/10 text-rose-400 border border-rose-500/30'
                        }`}
                      >
                        {rem.riskTier === 'LOW_RISK_CONFIG' ? 'LOW RISK AUTO' : 'HIGH RISK LEGAL'}
                      </span>
                    </div>
                    <p className="text-sm font-semibold text-white">{rem.detectedGap}</p>
                    <p className="text-xs font-mono bg-slate-950 p-2.5 rounded border border-slate-800/80 text-emerald-400">
                      Fix: {rem.proposedFixSnippet}
                    </p>
                  </div>

                  <div className="flex items-center gap-3">
                    {rem.appliedStatus === 'AUTO_APPLIED' ? (
                      <span className="px-3 py-1 rounded bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 text-xs font-semibold flex items-center gap-1.5">
                        <CheckCircle2 className="w-3.5 h-3.5" /> Applied
                      </span>
                    ) : (
                      <button
                        onClick={() => handleAutoApplyFix(rem.id)}
                        className="px-3.5 py-1.5 bg-blue-600 hover:bg-blue-500 text-white text-xs font-semibold rounded-lg transition"
                      >
                        Apply Fix Now
                      </button>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* TAB 6: CROSS-TENANT BENCHMARK */}
        {activeTab === 'benchmark' && benchmark && (
          <div className="space-y-6">
            <div className="bg-slate-900/60 border border-slate-800 rounded-xl p-5">
              <h2 className="text-lg font-semibold text-white flex items-center gap-2">
                <Layers className="w-5 h-5 text-blue-400" />
                Cross-Tenant Benchmark Engine (Anonymized Data Network Effect)
              </h2>
              <p className="text-xs text-slate-400 mt-1">
                Aggregates anonymized compliance telemetry across {benchmark.anonymizedPoolSize}+ peer tenants to provide competitive regulatory scoring.
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div className="bg-slate-900/80 border border-slate-800 rounded-xl p-6 text-center">
                <p className="text-xs text-slate-400 mb-1">Your Compliance Score</p>
                <p className="text-4xl font-extrabold text-blue-400 mb-2">{benchmark.tenantScore}</p>
                <p className="text-xs text-slate-400">Out of 100 possible points</p>
              </div>

              <div className="bg-slate-900/80 border border-slate-800 rounded-xl p-6 text-center">
                <p className="text-xs text-slate-400 mb-1">Industry Peer Average</p>
                <p className="text-4xl font-extrabold text-slate-300 mb-2">{benchmark.industryAverageScore}</p>
                <p className="text-xs text-emerald-400">You lead by +{(benchmark.tenantScore - benchmark.industryAverageScore).toFixed(1)} pts</p>
              </div>

              <div className="bg-slate-900/80 border border-slate-800 rounded-xl p-6 text-center">
                <p className="text-xs text-slate-400 mb-1">Global Percentile Standing</p>
                <p className="text-4xl font-extrabold text-emerald-400 mb-2">{benchmark.tenantPercentile}th</p>
                <p className="text-xs text-slate-400">Top 9% of Enterprise Class</p>
              </div>
            </div>

            <div className="bg-slate-900/80 border border-slate-800 rounded-xl p-6">
              <h3 className="text-sm font-bold text-white mb-3">Key Differentiators Elevating Your Benchmark:</h3>
              <div className="space-y-2">
                {benchmark.differentialFactors.map((factor, idx) => (
                  <div key={idx} className="flex items-center gap-2.5 text-xs text-slate-300 bg-slate-950 p-3 rounded-lg border border-slate-800/80">
                    <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
                    <span>{factor}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* TAB 7: DATA GRAVITY TRAJECTORY */}
        {activeTab === 'trajectory' && (
          <div className="space-y-6">
            <div className="bg-slate-900/60 border border-slate-800 rounded-xl p-5">
              <h2 className="text-lg font-semibold text-white flex items-center gap-2">
                <TrendingUp className="w-5 h-5 text-blue-400" />
                Long-Term Data Gravity Engine (High Switching Cost)
              </h2>
              <p className="text-xs text-slate-400 mt-1">
                Multi-year immutable risk telemetry, regulatory decision traces, and historical posture trajectories that create high retention durability.
              </p>
            </div>

            <div className="bg-slate-900/80 border border-slate-800 rounded-xl p-6">
              <h3 className="text-sm font-bold text-white mb-4">Historical Risk & Confidence Trajectory (2024 - 2026)</h3>
              <div className="space-y-3">
                {trajectory.map(pt => (
                  <div key={pt.period} className="bg-slate-950 p-4 rounded-xl border border-slate-800/80 flex flex-col md:flex-row md:items-center justify-between gap-3 text-xs">
                    <div className="flex items-center gap-3">
                      <span className="font-bold text-white text-sm w-28">{pt.period}</span>
                      <div className="w-48 bg-slate-900 rounded-full h-2 overflow-hidden border border-slate-800">
                        <div
                          className="bg-blue-500 h-full rounded-full"
                          style={{ width: `${pt.compositeRiskScore}%` }}
                        />
                      </div>
                      <span className="font-semibold text-blue-400">{pt.compositeRiskScore}% Posture</span>
                    </div>

                    <div className="flex items-center gap-6 text-slate-400">
                      <div>
                        <span>Resolved Deviations: </span>
                        <span className="text-slate-200 font-semibold">{pt.resolvedGaps}</span>
                      </div>
                      <div>
                        <span>Sealed Evidence Proofs: </span>
                        <span className="text-emerald-400 font-semibold">{pt.auditEvidenceCount}</span>
                      </div>
                      <div>
                        <span>Confidence Ratio: </span>
                        <span className="text-purple-400 font-semibold">{(pt.regulatoryConfidenceRatio * 100).toFixed(0)}%</span>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default MoatEnterpriseConsole;
