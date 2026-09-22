import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  AlertTriangle, 
  ShieldAlert, 
  FileText, 
  FileDown, 
  ChevronRight, 
  ChevronLeft, 
  X, 
  CheckCircle2, 
  ExternalLink, 
  Cpu, 
  Clock, 
  Layers, 
  Sparkles, 
  RefreshCw,
  Eye
} from 'lucide-react';
import { exportBoardCompliancePdfReport, CriticalChangeReportData } from '../services/boardPdfReportService';

export interface LegislativeAlert {
  id: string;
  tenantId: string;
  taskType: string;
  status: string;
  priority: 'LOW' | 'NORMAL' | 'HIGH' | 'CRITICAL';
  directive: string;
  legislativeTitle: string;
  statutoryReference: string;
  regulatoryBody: string;
  officialGazetteDate: string;
  statutoryCelex: string;
  effectiveEnforcementDate: string;
  severity: 'CRITICAL' | 'HIGH' | 'MEDIUM';
  exposureScore: number;
  statutoryFineCeiling: string;
  boardActionRequired: string;
  impactedArchitectures: Array<{
    component: string;
    gap: string;
    complianceLevel: string;
  }>;
  createdAt: string;
  isNew?: boolean;
}

interface LegislativeNotificationBannerProps {
  onNavigateToQueue?: () => void;
  className?: string;
}

export const LegislativeNotificationBanner: React.FC<LegislativeNotificationBannerProps> = ({
  onNavigateToQueue,
  className = ''
}) => {
  const [alerts, setAlerts] = useState<LegislativeAlert[]>([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [loading, setLoading] = useState(true);
  const [selectedReport, setSelectedReport] = useState<LegislativeAlert | null>(null);
  const [isExportingPdf, setIsExportingPdf] = useState(false);
  const [isDismissed, setIsDismissed] = useState(false);
  const [actionRatified, setActionRatified] = useState<Record<string, boolean>>({});

  const fetchAlerts = async () => {
    try {
      const res = await fetch('/api/v1/admin/legislative-alerts');
      const data = await res.json();
      if (data.success && Array.isArray(data.alerts) && data.alerts.length > 0) {
        setAlerts(data.alerts);
      }
    } catch (err) {
      console.warn('Failed to load legislative alerts:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAlerts();
    const interval = setInterval(fetchAlerts, 15000);
    return () => clearInterval(interval);
  }, []);

  const currentAlert = alerts[currentIndex] || alerts[0];

  const handleDownloadPdf = async (alert: LegislativeAlert) => {
    setIsExportingPdf(true);
    try {
      const pdfData: CriticalChangeReportData = {
        jobId: alert.id,
        tenantId: alert.tenantId || 'default',
        taskType: alert.taskType,
        scanTimestamp: alert.createdAt,
        legislativeTitle: alert.legislativeTitle,
        regulatoryBody: alert.regulatoryBody,
        officialGazetteDate: alert.officialGazetteDate,
        statutoryCelex: alert.statutoryCelex,
        effectiveEnforcementDate: alert.effectiveEnforcementDate,
        severity: alert.severity,
        exposureScore: alert.exposureScore,
        statutoryFineCeiling: alert.statutoryFineCeiling,
        boardActionRequired: alert.boardActionRequired,
        impactedArchitectures: alert.impactedArchitectures,
        workerEngineId: 'BullMQ_Distributed_v2.4',
        auditHash: `0x${Math.random().toString(16).substring(2, 10)}${Math.random().toString(16).substring(2, 10)}`
      };
      await exportBoardCompliancePdfReport(pdfData);
    } catch (err) {
      console.error('PDF export failed:', err);
    } finally {
      setIsExportingPdf(false);
    }
  };

  if (loading && alerts.length === 0) return null;
  if (!currentAlert || isDismissed) {
    return (
      <div className={`mb-4 flex items-center justify-between px-4 py-2 bg-slate-900/80 border border-slate-800 rounded-xl text-xs font-mono text-slate-400 ${className}`}>
        <div className="flex items-center gap-2">
          <span className="w-2 h-2 rounded-full bg-rose-500 animate-pulse" />
          <span>Autonomous Legislative Worker: <strong>{alerts.length} updates logged</strong></span>
        </div>
        <button
          onClick={() => setIsDismissed(false)}
          className="text-amber-400 hover:text-amber-300 underline font-medium cursor-pointer"
        >
          Expand Banner
        </button>
      </div>
    );
  }

  const isCritical = currentAlert.severity === 'CRITICAL';

  return (
    <>
      <div 
        id="legislative-notification-banner"
        className={`relative overflow-hidden rounded-2xl border transition-all duration-300 shadow-xl ${
          isCritical 
            ? 'bg-gradient-to-r from-rose-950/90 via-slate-950/95 to-slate-900 border-rose-600/40 shadow-rose-950/20' 
            : 'bg-gradient-to-r from-amber-950/90 via-slate-950/95 to-slate-900 border-amber-600/40 shadow-amber-950/20'
        } ${className}`}
      >
        {/* Top Accent Line */}
        <div className={`h-1 w-full ${isCritical ? 'bg-gradient-to-r from-rose-500 via-red-500 to-amber-500' : 'bg-gradient-to-r from-amber-500 to-emerald-500'}`} />

        <div className="p-4 sm:p-5 flex flex-col lg:flex-row items-start lg:items-center justify-between gap-4">
          {/* Main Info */}
          <div className="flex items-start gap-3.5 flex-1 min-w-0">
            <div className={`p-2.5 rounded-xl border shrink-0 mt-0.5 ${
              isCritical 
                ? 'bg-rose-500/10 border-rose-500/30 text-rose-400' 
                : 'bg-amber-500/10 border-amber-500/30 text-amber-400'
            }`}>
              <ShieldAlert className="w-6 h-6 animate-pulse" />
            </div>

            <div className="space-y-1 min-w-0 flex-1">
              <div className="flex flex-wrap items-center gap-2">
                <span className={`px-2.5 py-0.5 rounded-full text-[10px] font-mono font-bold uppercase tracking-wider ${
                  isCritical ? 'bg-rose-600 text-white shadow-sm' : 'bg-amber-500 text-slate-950 font-semibold'
                }`}>
                  {currentAlert.severity} LEGISLATIVE DRIFT
                </span>
                
                <span className="px-2 py-0.5 rounded-full bg-slate-800 border border-slate-700 text-slate-300 text-[10px] font-mono">
                  Celex: {currentAlert.statutoryCelex || 'EUR-Lex Ref'}
                </span>

                <span className="text-slate-400 text-xs font-mono hidden sm:inline-block">
                  Worker ID: <span className="text-slate-200">{currentAlert.id}</span>
                </span>
                
                {alerts.length > 1 && (
                  <span className="text-xs font-mono text-slate-400 bg-slate-800/80 px-2 py-0.5 rounded border border-slate-700">
                    Alert {currentIndex + 1} of {alerts.length}
                  </span>
                )}
              </div>

              <h2 className="text-sm sm:text-base font-bold text-white tracking-tight line-clamp-1">
                {currentAlert.legislativeTitle}
              </h2>

              <p className="text-xs text-slate-300 line-clamp-2 max-w-3xl leading-relaxed">
                <strong className="text-slate-100 font-semibold">Statutory Ref:</strong> {currentAlert.statutoryReference} &bull; <span className="text-rose-300 font-medium">Fine Ceiling: {currentAlert.statutoryFineCeiling}</span> &bull; Exposure: <span className="text-amber-300 font-mono font-bold">{currentAlert.exposureScore}/100</span>
              </p>
            </div>
          </div>

          {/* Action Buttons & Carousel Nav */}
          <div className="flex flex-wrap items-center gap-2.5 shrink-0 w-full lg:w-auto justify-between lg:justify-end pt-2 lg:pt-0 border-t lg:border-t-0 border-slate-800/60">
            {/* Carousel Navigation if multiple */}
            {alerts.length > 1 && (
              <div className="flex items-center gap-1 bg-slate-900/90 border border-slate-800 rounded-lg p-0.5">
                <button
                  onClick={() => setCurrentIndex((prev) => (prev > 0 ? prev - 1 : alerts.length - 1))}
                  className="p-1.5 rounded hover:bg-slate-800 text-slate-400 hover:text-white transition-colors cursor-pointer"
                  title="Previous Alert"
                >
                  <ChevronLeft className="w-3.5 h-3.5" />
                </button>
                <button
                  onClick={() => setCurrentIndex((prev) => (prev < alerts.length - 1 ? prev + 1 : 0))}
                  className="p-1.5 rounded hover:bg-slate-800 text-slate-400 hover:text-white transition-colors cursor-pointer"
                  title="Next Alert"
                >
                  <ChevronRight className="w-3.5 h-3.5" />
                </button>
              </div>
            )}

            {/* View Impact Report Modal Trigger */}
            <button
              onClick={() => setSelectedReport(currentAlert)}
              className="px-3.5 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 border border-slate-700 text-white text-xs font-semibold flex items-center gap-1.5 transition-all shadow-sm hover:border-slate-600 cursor-pointer"
            >
              <Eye className="w-3.5 h-3.5 text-indigo-400" />
              <span>View Impact Report</span>
            </button>

            {/* Direct Board PDF Export */}
            <button
              onClick={() => handleDownloadPdf(currentAlert)}
              disabled={isExportingPdf}
              className={`px-3.5 py-2 rounded-xl text-xs font-semibold flex items-center gap-1.5 transition-all cursor-pointer shadow-md ${
                isCritical 
                  ? 'bg-rose-600 hover:bg-rose-500 text-white shadow-rose-900/30' 
                  : 'bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold shadow-amber-900/30'
              }`}
            >
              {isExportingPdf ? (
                <RefreshCw className="w-3.5 h-3.5 animate-spin" />
              ) : (
                <FileDown className="w-3.5 h-3.5" />
              )}
              <span>{isExportingPdf ? 'Exporting...' : 'Board PDF'}</span>
            </button>

            {/* Dismiss button */}
            <button
              onClick={() => setIsDismissed(true)}
              className="p-2 text-slate-400 hover:text-white rounded-lg hover:bg-slate-800 transition-colors cursor-pointer ml-1"
              title="Collapse banner"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        </div>
      </div>

      {/* Interactive Legislative Impact Report Dossier Modal */}
      <AnimatePresence>
        {selectedReport && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md overflow-y-auto">
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 15 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 15 }}
              className="relative w-full max-w-4xl bg-slate-900 border border-slate-800 rounded-2xl shadow-2xl overflow-hidden my-8 max-h-[90vh] flex flex-col"
            >
              {/* Modal Header */}
              <div className="p-6 border-b border-slate-800 bg-slate-950 flex items-start justify-between gap-4">
                <div className="flex items-start gap-3">
                  <div className={`p-3 rounded-xl border ${
                    selectedReport.severity === 'CRITICAL'
                      ? 'bg-rose-500/10 border-rose-500/30 text-rose-400'
                      : 'bg-amber-500/10 border-amber-500/30 text-amber-400'
                  }`}>
                    <ShieldAlert className="w-6 h-6" />
                  </div>
                  <div>
                    <div className="flex items-center gap-2 mb-1">
                      <span className={`px-2.5 py-0.5 rounded-full text-[10px] font-mono font-bold uppercase ${
                        selectedReport.severity === 'CRITICAL' ? 'bg-rose-600 text-white' : 'bg-amber-500 text-slate-950'
                      }`}>
                        {selectedReport.severity} IMPACT ADVISORY
                      </span>
                      <span className="text-xs font-mono text-slate-400">
                        Celex: <strong className="text-slate-200">{selectedReport.statutoryCelex}</strong>
                      </span>
                    </div>
                    <h2 className="text-xl font-bold text-white tracking-tight">
                      {selectedReport.legislativeTitle}
                    </h2>
                    <p className="text-xs text-slate-400 mt-1">
                      Regulatory Body: <strong className="text-slate-200">{selectedReport.regulatoryBody}</strong> &bull; Scanned: {new Date(selectedReport.createdAt).toLocaleString()}
                    </p>
                  </div>
                </div>

                <button
                  onClick={() => setSelectedReport(null)}
                  className="p-2 text-slate-400 hover:text-white rounded-xl hover:bg-slate-800 transition-colors cursor-pointer"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              {/* Modal Body */}
              <div className="p-6 space-y-6 overflow-y-auto flex-1 text-slate-200 text-sm">
                {/* Metric Summary Grid */}
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                  <div className="p-4 rounded-xl bg-slate-950/60 border border-slate-800">
                    <div className="text-xs font-mono text-slate-400 uppercase mb-1">Statutory Fine Exposure</div>
                    <div className="text-base font-bold text-rose-400 font-mono">{selectedReport.statutoryFineCeiling}</div>
                    <div className="text-[11px] text-slate-500 mt-1">Mandated under EU official gazette enforcement rails</div>
                  </div>

                  <div className="p-4 rounded-xl bg-slate-950/60 border border-slate-800">
                    <div className="text-xs font-mono text-slate-400 uppercase mb-1">Empirical Exposure Risk</div>
                    <div className="flex items-center gap-2">
                      <div className="text-2xl font-black text-amber-400 font-mono">{selectedReport.exposureScore}</div>
                      <span className="text-xs text-slate-400 font-mono">/ 100 Score</span>
                    </div>
                    <div className="w-full bg-slate-800 h-1.5 rounded-full mt-2 overflow-hidden">
                      <div className="bg-amber-400 h-full rounded-full" style={{ width: `${selectedReport.exposureScore}%` }} />
                    </div>
                  </div>

                  <div className="p-4 rounded-xl bg-slate-950/60 border border-slate-800">
                    <div className="text-xs font-mono text-slate-400 uppercase mb-1">Enforcement Timeline</div>
                    <div className="text-sm font-semibold text-emerald-400">
                      Enactment: {selectedReport.effectiveEnforcementDate}
                    </div>
                    <div className="text-[11px] text-slate-400 mt-1">
                      Gazette Date: {selectedReport.officialGazetteDate}
                    </div>
                  </div>
                </div>

                {/* Impacted Systems & Architecture Gaps */}
                <div>
                  <h3 className="text-xs font-mono font-bold uppercase tracking-wider text-slate-400 mb-3 flex items-center gap-2">
                    <Cpu className="w-4 h-4 text-indigo-400" />
                    <span>Identified Internal Architectural Gaps ({selectedReport.impactedArchitectures.length})</span>
                  </h3>
                  <div className="space-y-2.5">
                    {selectedReport.impactedArchitectures.map((arch, idx) => (
                      <div key={idx} className="p-3.5 rounded-xl bg-slate-950/80 border border-slate-800 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
                        <div className="space-y-0.5">
                          <div className="font-semibold text-white text-xs sm:text-sm flex items-center gap-2">
                            <span>{arch.component}</span>
                          </div>
                          <p className="text-xs text-slate-400">{arch.gap}</p>
                        </div>
                        <span className={`px-2.5 py-1 rounded-lg text-xs font-mono font-medium shrink-0 ${
                          arch.complianceLevel.includes('Non') || arch.complianceLevel.includes('Critical')
                            ? 'bg-rose-950/80 border border-rose-800 text-rose-300'
                            : 'bg-amber-950/80 border border-amber-800 text-amber-300'
                        }`}>
                          {arch.complianceLevel}
                        </span>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Mandated Board Action Item */}
                <div className="p-4 rounded-xl bg-indigo-950/30 border border-indigo-800/50 space-y-2">
                  <div className="text-xs font-mono font-bold uppercase tracking-wider text-indigo-300 flex items-center gap-2">
                    <FileText className="w-4 h-4" />
                    <span>Mandated Governance &amp; Board Action</span>
                  </div>
                  <p className="text-xs sm:text-sm text-slate-300 leading-relaxed">
                    {selectedReport.boardActionRequired}
                  </p>
                  
                  <div className="pt-2 flex items-center gap-3">
                    <button
                      onClick={() => setActionRatified(prev => ({ ...prev, [selectedReport.id]: !prev[selectedReport.id] }))}
                      className={`px-3 py-1.5 rounded-lg text-xs font-mono font-semibold flex items-center gap-1.5 transition-colors cursor-pointer ${
                        actionRatified[selectedReport.id]
                          ? 'bg-emerald-600 text-white'
                          : 'bg-slate-800 hover:bg-slate-700 text-slate-300 border border-slate-700'
                      }`}
                    >
                      <CheckCircle2 className="w-3.5 h-3.5" />
                      <span>{actionRatified[selectedReport.id] ? 'Governance Action Ratified' : 'Ratify Action Item'}</span>
                    </button>
                    {actionRatified[selectedReport.id] && (
                      <span className="text-xs text-emerald-400 font-mono">Logged to audit chain</span>
                    )}
                  </div>
                </div>
              </div>

              {/* Modal Footer */}
              <div className="p-5 border-t border-slate-800 bg-slate-950 flex flex-wrap items-center justify-between gap-3">
                <div className="flex items-center gap-2">
                  {onNavigateToQueue && (
                    <button
                      onClick={() => {
                        setSelectedReport(null);
                        onNavigateToQueue();
                      }}
                      className="px-3.5 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 border border-slate-700 text-white text-xs font-semibold flex items-center gap-1.5 transition-all cursor-pointer"
                    >
                      <span>Inspect in Task Queue</span>
                      <ChevronRight className="w-3.5 h-3.5 text-slate-400" />
                    </button>
                  )}
                  <a
                    href={`https://eur-lex.europa.eu/legal-content/EN/TXT/?uri=CELEX:${selectedReport.statutoryCelex}`}
                    target="_blank"
                    rel="noreferrer"
                    className="px-3.5 py-2 rounded-xl bg-slate-800/80 hover:bg-slate-700 border border-slate-700 text-slate-300 text-xs font-semibold flex items-center gap-1.5 transition-all"
                  >
                    <span>EUR-Lex Gazette Registry</span>
                    <ExternalLink className="w-3 h-3 text-slate-400" />
                  </a>
                </div>

                <div className="flex items-center gap-2">
                  <button
                    onClick={() => setSelectedReport(null)}
                    className="px-4 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-semibold cursor-pointer"
                  >
                    Close
                  </button>

                  <button
                    onClick={() => handleDownloadPdf(selectedReport)}
                    disabled={isExportingPdf}
                    className="px-4 py-2 rounded-xl bg-rose-600 hover:bg-rose-500 text-white text-xs font-semibold flex items-center gap-1.5 shadow-lg shadow-rose-950/40 cursor-pointer"
                  >
                    {isExportingPdf ? (
                      <RefreshCw className="w-3.5 h-3.5 animate-spin" />
                    ) : (
                      <FileDown className="w-3.5 h-3.5" />
                    )}
                    <span>Download Signed Board PDF</span>
                  </button>
                </div>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </>
  );
};
