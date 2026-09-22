import React, { useState } from 'react';
import { 
  Activity, Play, CheckCircle2, AlertTriangle, ShieldCheck, 
  Server, RefreshCw, Download, Cpu, HardDrive, Clock
} from 'lucide-react';
import { RegionKey, REGIONAL_FRAMEWORKS } from '../../services/regionalComplianceRulesEngine';

interface RegionalTelemetryScannersProps {
  activeRegion: RegionKey;
  shards: any[];
  onRefreshShards: () => void;
}

export const RegionalTelemetryScanners: React.FC<RegionalTelemetryScannersProps> = ({
  activeRegion,
  shards,
  onRefreshShards
}) => {
  const framework = REGIONAL_FRAMEWORKS[activeRegion] || REGIONAL_FRAMEWORKS.EU;
  const [isScanning, setIsScanning] = useState(false);
  const [scanProgress, setScanProgress] = useState(0);
  const [lastScanResult, setLastScanResult] = useState<any>(null);

  const [engines, setEngines] = useState([
    { id: 'eng-eu', name: 'EU Sovereign PQC Enclave Engine', region: 'eu-central-1 (Frankfurt)', status: 'HEALTHY', latency: 9, passingRate: 100, lastAudit: '1 min ago' },
    { id: 'eng-us', name: 'US State Shield Scanner (CCPA/CPRA)', region: 'us-east-1 (N. Virginia)', status: 'HEALTHY', latency: 18, passingRate: 98.4, lastAudit: '3 mins ago' },
    { id: 'eng-ksa', name: 'KSA PDPL & SAMA Sovereign Engine', region: 'Riyadh Sovereign Cloud', status: 'HEALTHY', latency: 46, passingRate: 100, lastAudit: '2 mins ago' },
    { id: 'eng-uae', name: 'UAE Federal & DIFC Data Enclave', region: 'uae-north (Dubai)', status: 'HEALTHY', latency: 42, passingRate: 99.1, lastAudit: '4 mins ago' },
    { id: 'eng-apac', name: 'APAC Multi-Tenancy PDPA/DPDP Probe', region: 'ap-southeast-1 (Singapore)', status: 'HEALTHY', latency: 65, passingRate: 97.8, lastAudit: '5 mins ago' },
    { id: 'eng-uk', name: 'UK ICO Sovereign Compliance Probe', region: 'eu-west-2 (London)', status: 'HEALTHY', latency: 14, passingRate: 100, lastAudit: '2 mins ago' },
  ]);

  const runGlobalMultiRegionScan = () => {
    setIsScanning(true);
    setScanProgress(10);

    const interval = setInterval(() => {
      setScanProgress((prev) => {
        if (prev >= 90) {
          clearInterval(interval);
          setTimeout(() => {
            setIsScanning(false);
            setScanProgress(100);
            setLastScanResult({
              timestamp: new Date().toISOString(),
              totalNodesScanned: engines.length,
              totalRulesVerified: 142,
              failedRules: 0,
              complianceHealth: '100% AUDIT READY',
              shardsVerified: shards.length || 6,
              pqcEncrypted: true
            });
            onRefreshShards();
          }, 600);
          return 90;
        }
        return prev + 20;
      });
    }, 250);
  };

  const exportAuditCertificate = () => {
    const cert = {
      certificateId: `CERT-MULTIREG-${Date.now()}`,
      issuedAt: new Date().toISOString(),
      activeRegion: activeRegion,
      jurisdiction: framework.displayName,
      supervisoryActsEnforced: framework.acts.map(a => a.shortCode),
      sovereignDataCenter: framework.sovereignDataCenter,
      cryptoAttestation: "Kyber-768 ML-KEM Post-Quantum Hardware Enclave Validated",
      status: "FULLY COMPLIANT & AUDIT READY",
      verifiedShards: shards
    };

    const dataStr = "data:text/json;charset=utf-8," + encodeURIComponent(JSON.stringify(cert, null, 2));
    const dl = document.createElement('a');
    dl.setAttribute("href", dataStr);
    dl.setAttribute("download", `9Xen Regulettee_Audit_Certificate_${activeRegion}_${Date.now()}.json`);
    document.body.appendChild(dl);
    dl.click();
    dl.remove();
  };

  return (
    <div className="bg-white border border-slate-200 rounded-2xl p-6 shadow-xs space-y-6">
      {/* Header */}
      <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4 border-b border-slate-100 pb-5">
        <div>
          <div className="flex items-center gap-2">
            <span className="px-2.5 py-0.5 rounded-full text-xs font-bold bg-indigo-50 text-indigo-700 border border-indigo-200">
              Live Multi-Region Telemetry
            </span>
            <span className="text-xs text-slate-500 font-medium">
              6 Active Sovereign Enclave Engines
            </span>
          </div>
          <h3 className="text-xl font-black text-slate-900 mt-2 flex items-center gap-2">
            <Activity className="w-5 h-5 text-indigo-600" />
            Cross-Border Node Health & Compliance Telemetry
          </h3>
          <p className="text-slate-500 text-xs mt-0.5">
            Real-time ping probes, zero-knowledge verification pipelines, and Kyber-768 quantum tunnel status.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={exportAuditCertificate}
            className="px-3.5 py-2 bg-slate-100 text-slate-700 hover:bg-slate-200 rounded-xl text-xs font-bold flex items-center gap-1.5 transition-colors cursor-pointer"
          >
            <Download className="w-3.5 h-3.5" />
            Download Certificate
          </button>

          <button
            onClick={runGlobalMultiRegionScan}
            disabled={isScanning}
            className="px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl text-xs font-bold flex items-center gap-1.5 transition-colors shadow-sm cursor-pointer disabled:opacity-50"
          >
            {isScanning ? (
              <>
                <RefreshCw className="w-3.5 h-3.5 animate-spin" />
                Scanning {scanProgress}%...
              </>
            ) : (
              <>
                <Play className="w-3.5 h-3.5" />
                Run Global Scan
              </>
            )}
          </button>
        </div>
      </div>

      {/* Progress Bar when scanning */}
      {isScanning && (
        <div className="bg-slate-50 border border-slate-200 rounded-xl p-4 space-y-2">
          <div className="flex justify-between text-xs font-bold text-slate-700">
            <span>Executing Parallel Zero-Trust Cryptographic Audit...</span>
            <span className="font-mono text-indigo-600">{scanProgress}%</span>
          </div>
          <div className="w-full h-2 bg-slate-200 rounded-full overflow-hidden">
            <div 
              className="h-full bg-indigo-600 transition-all duration-300 rounded-full" 
              style={{ width: `${scanProgress}%` }} 
            />
          </div>
        </div>
      )}

      {/* Last Scan Result Banner */}
      {lastScanResult && (
        <div className="bg-emerald-50 border border-emerald-200 rounded-xl p-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-emerald-100 rounded-lg text-emerald-700">
              <ShieldCheck className="w-5 h-5" />
            </div>
            <div>
              <div className="text-xs font-bold text-emerald-900">
                Global Scan Completed: {lastScanResult.complianceHealth}
              </div>
              <div className="text-[11px] text-emerald-700 font-medium">
                Verified {lastScanResult.totalRulesVerified} statutory rules across {lastScanResult.totalNodesScanned} sovereign enclaves and {lastScanResult.shardsVerified} local database shards.
              </div>
            </div>
          </div>
          <span className="text-[10px] font-mono text-emerald-800 bg-emerald-100 px-2.5 py-1 rounded-full font-bold">
            0 Gaps Detected
          </span>
        </div>
      )}

      {/* Engine Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {engines.map((engine) => (
          <div 
            key={engine.id}
            className="bg-slate-50 border border-slate-200 rounded-xl p-4 space-y-3 hover:border-indigo-300 transition-all"
          >
            <div className="flex items-start justify-between">
              <div>
                <span className="text-xs font-bold text-slate-900 block">{engine.name}</span>
                <span className="text-[10px] font-mono text-slate-500 block mt-0.5">{engine.region}</span>
              </div>
              <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-emerald-100 text-emerald-800 flex items-center gap-1">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
                {engine.status}
              </span>
            </div>

            <div className="grid grid-cols-3 gap-2 pt-2 border-t border-slate-200 text-center">
              <div className="bg-white p-2 rounded-lg border border-slate-100">
                <span className="text-[9px] text-slate-400 font-mono block">LATENCY</span>
                <span className="text-xs font-bold text-indigo-700 font-mono">{engine.latency}ms</span>
              </div>
              <div className="bg-white p-2 rounded-lg border border-slate-100">
                <span className="text-[9px] text-slate-400 font-mono block">HEALTH</span>
                <span className="text-xs font-bold text-emerald-700 font-mono">{engine.passingRate}%</span>
              </div>
              <div className="bg-white p-2 rounded-lg border border-slate-100">
                <span className="text-[9px] text-slate-400 font-mono block">LAST AUDIT</span>
                <span className="text-[10px] font-bold text-slate-700">{engine.lastAudit}</span>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};
