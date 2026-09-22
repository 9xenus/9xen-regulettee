import React, { useState } from 'react';
import {
  HardDrive,
  ShieldCheck,
  ShieldAlert,
  Search,
  Filter,
  Download,
  Plus,
  CheckCircle2,
  XCircle,
  AlertTriangle,
  Cpu,
  Lock,
  Globe,
  Key,
  Database,
  FileText,
  Sparkles,
  RefreshCw,
  Layers,
  Award,
  Check,
  Zap,
  Clock,
  Server,
  Terminal,
  Activity,
  FileCheck,
  QrCode,
  Camera
} from 'lucide-react';
import { generatePdfExport, generateSignedPdfExport } from '../utils/pdfGenerator';
import { useNotification } from '../context/NotificationContext';
import { HardwareAssetQrScanner } from '../components/compliance/HardwareAssetQrScanner';
import { HARDWARE_PHYSICAL_ASSETS } from '../data/hardwareAssetData';

interface AssetItem {
  id: string;
  name: string;
  type: 'Hardware Server' | 'KMS Encryption Key' | 'SaaS Application' | 'Database Cluster' | 'IoT / Edge Device';
  location: string;
  cryptographicStatus: 'PQC Kyber-768 Enforced' | 'AES-256-GCM' | 'Legacy RSA-2048' | 'Unencrypted';
  complianceStatus: 'Compliant' | 'Key Rotation Due' | 'Shadow IT Alert' | 'Non-Compliant';
  riskScore: number;
  lastAudited: string;
  ownerTeam: string;
}

const INITIAL_ASSETS: AssetItem[] = [
  {
    id: 'AST-2026-901',
    name: 'Frankfurt-AM2 Sovereign Enclave Node 01',
    type: 'Hardware Server',
    location: 'Frankfurt, Germany (EU-CENTRAL-1)',
    cryptographicStatus: 'PQC Kyber-768 Enforced',
    complianceStatus: 'Compliant',
    riskScore: 5,
    lastAudited: '2026-07-01',
    ownerTeam: 'SecOps Sovereign Infrastructure'
  },
  {
    id: 'AST-2026-902',
    name: 'HSM Primary Master Key Set (hsm-prod-vault)',
    type: 'KMS Encryption Key',
    location: 'Dublin, Ireland (EU-WEST-1 HSM)',
    cryptographicStatus: 'AES-256-GCM',
    complianceStatus: 'Key Rotation Due',
    riskScore: 48,
    lastAudited: '2026-01-10',
    ownerTeam: 'Key Management Enclave Team'
  },
  {
    id: 'AST-2026-903',
    name: 'Marketing Analytics Unsanctioned SaaS Workspace',
    type: 'SaaS Application',
    location: 'US-EAST-1 (External)',
    cryptographicStatus: 'Unencrypted',
    complianceStatus: 'Shadow IT Alert',
    riskScore: 85,
    lastAudited: '2026-07-15',
    ownerTeam: 'Regional Marketing (Unapproved)'
  },
  {
    id: 'AST-2026-904',
    name: 'Transactional PostgreSQL Cloud Spanner Cluster',
    type: 'Database Cluster',
    location: 'Paris, France (EU-WEST-3)',
    cryptographicStatus: 'PQC Kyber-768 Enforced',
    complianceStatus: 'Compliant',
    riskScore: 8,
    lastAudited: '2026-06-20',
    ownerTeam: 'Data Core Engineering'
  },
  {
    id: 'AST-2026-905',
    name: 'Legacy Field Gateway Router #14',
    type: 'IoT / Edge Device',
    location: 'Milan, Italy',
    cryptographicStatus: 'Legacy RSA-2048',
    complianceStatus: 'Non-Compliant',
    riskScore: 92,
    lastAudited: '2025-10-12',
    ownerTeam: 'Field Operations'
  }
];

export const AssetCompliance: React.FC = () => {
  const { showToast } = useNotification();
  const [activeTab, setActiveTab] = useState<'overview' | 'kms' | 'shadow_it' | 'decommission' | 'inventory' | 'qr_scanner'>('overview');
  const [assets, setAssets] = useState<AssetItem[]>(INITIAL_ASSETS);
  const [searchTerm, setSearchTerm] = useState('');
  const [typeFilter, setTypeFilter] = useState('all');
  const [showQrModal, setShowQrModal] = useState(false);
  const [selectedScanAssetId, setSelectedScanAssetId] = useState<string>('AST-HW-901');

  // KMS Rotation state
  const [selectedKey, setSelectedKey] = useState('AST-2026-902');
  const [isRotatingKey, setIsRotatingKey] = useState(false);

  // Shadow IT Scanner state
  const [isScanningShadowIt, setIsScanningShadowIt] = useState(false);
  const [shadowItResults, setShadowItResults] = useState<any>(null);

  // Decommissioning Certificate state
  const [decomAssetId, setDecomAssetId] = useState('AST-2026-905');
  const [decomMethod, setDecomMethod] = useState('Cryptographic Zeroization & DoD 5220.22-M Wipe');
  const [decomCert, setDecomCert] = useState<string | null>(null);

  const filteredAssets = assets.filter((a) => {
    const matchesSearch =
      a.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      a.id.toLowerCase().includes(searchTerm.toLowerCase()) ||
      a.location.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesType = typeFilter === 'all' || a.type === typeFilter;
    return matchesSearch && matchesType;
  });

  const compliantCount = assets.filter((a) => a.complianceStatus === 'Compliant').length;
  const nonCompliantCount = assets.filter((a) => a.complianceStatus !== 'Compliant').length;

  const handleRotateKey = () => {
    setIsRotatingKey(true);
    setTimeout(() => {
      setIsRotatingKey(false);
      setAssets((prev) =>
        prev.map((item) =>
          item.id === selectedKey
            ? {
                ...item,
                cryptographicStatus: 'PQC Kyber-768 Enforced',
                complianceStatus: 'Compliant',
                riskScore: 6,
                lastAudited: new Date().toISOString().split('T')[0]
              }
            : item
        )
      );
      showToast('KMS Master Key rotated successfully! PQC Kyber-768 cipher activated.', 'success');
    }, 1200);
  };

  const handleScanShadowIt = () => {
    setIsScanningShadowIt(true);
    setShadowItResults(null);

    setTimeout(() => {
      setIsScanningShadowIt(false);
      setShadowItResults({
        totalEndpointsScanned: 1420,
        unapprovedAppsFound: 3,
        unencryptedApiKeysExposed: 1,
        findings: [
          { app: 'Unsanctioned SaaS Analytics Workspace', risk: 'HIGH', issue: 'Transfers employee email hashes to US cloud without active DPA.' },
          { app: 'Free AI Prompt Extraterrestrial Portal', risk: 'CRITICAL', issue: 'Pasting proprietary source code into public LLM endpoint.' },
          { app: 'Personal Google Drive Export Extension', risk: 'MEDIUM', issue: 'SaaS oauth token granted access to internal documents.' }
        ]
      });
      showToast('Shadow IT scan complete. 3 unapproved SaaS applications detected.', 'info');
    }, 1100);
  };

  const handleGenerateDecomCert = () => {
    const targetAsset = assets.find((a) => a.id === decomAssetId) || assets[0];
    const certText = `OFFICIAL CERTIFICATE OF CRYPTOGRAPHIC DECOMMISSIONING & DATA DESTRUCTION
Pursuant to ISO/IEC 27001 Annex A.8 & GDPR Article 17 (Right to Erasure)

CERTIFICATE ID: DECOM-${Array.from(crypto.getRandomValues(new Uint8Array(6))).map(b => b.toString(16).padStart(2, '0')).join('').toUpperCase()}
TARGET ASSET: ${targetAsset.name} (${targetAsset.id})
ASSET TYPE: ${targetAsset.type}
LOCATION: ${targetAsset.location}

DESTRUCTION SPECIFICATION:
Sanitization Method: ${decomMethod}
Verification Hash: 0x89a1...c4b2 (SHA-256 Verified)
Residual Magnetic/Solid State Remanence: ZERO (0.00%)

I hereby certify that all data, encryption keys, and residual storage sectors on the target asset have been irreversibly destroyed in compliance with EU Data Sovereignty Regulations.

Signed by Lead Auditor & Cryptographic Vault Sentinel
Date: ${new Date().toLocaleDateString()}`;

    setDecomCert(certText);
    showToast('Cryptographic Decommissioning Certificate generated.', 'success');
  };

  const handleExportPDF = () => {
    const headers = ['Asset ID', 'Name', 'Type', 'Location', 'Cryptographic Status', 'Compliance', 'Risk Score'];
    const rows = filteredAssets.map((a) => [a.id, a.name, a.type, a.location, a.cryptographicStatus, a.complianceStatus, `${a.riskScore}/100`]);
    generatePdfExport('EuroPrivacy IT & Cryptographic Asset Compliance Ledger', headers, rows, 'asset-compliance-report');
    showToast('Asset Compliance PDF report generated successfully.', 'success');
  };

  return (
    <div className="min-h-screen bg-slate-50/50 p-4 md:p-8 space-y-5 sm:space-y-8">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-slate-200 pb-6">
        <div>
          <div className="flex items-center gap-2 text-xs font-bold text-indigo-600 uppercase tracking-widest mb-1 font-mono">
            <HardDrive className="w-4 h-4" />
            ISO 27001 Annex A.8 & KMS Cryptographic Asset Hub
          </div>
          <h1 className="text-2xl md:text-3xl font-black text-slate-900 tracking-tight">Asset Compliance Management</h1>
          <p className="text-sm text-slate-500 mt-1 max-w-3xl">
            Audit hardware nodes, KMS cryptographic key rotation schedules, Shadow IT SaaS detection, PQC post-quantum encryption readiness, and certified decommissioning.
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          <button
            onClick={() => setActiveTab('qr_scanner')}
            className="px-4 py-2 bg-gradient-to-r from-cyan-600 to-indigo-600 hover:from-cyan-500 hover:to-indigo-500 text-white rounded-xl text-xs font-bold transition-all shadow-md shadow-indigo-500/20 flex items-center gap-2 cursor-pointer"
          >
            <Camera className="w-4 h-4 animate-pulse" />
            <span>Scan Hardware QR Code</span>
          </button>
          <button
            onClick={handleExportPDF}
            className="px-4 py-2 bg-slate-900 hover:bg-slate-800 text-white rounded-xl text-xs font-bold transition-all shadow-sm flex items-center gap-2 cursor-pointer"
          >
            <Download className="w-4 h-4" />
            Export Asset Ledger
          </button>
        </div>
      </div>

      {/* KPI Stats Row */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-3xs flex items-center justify-between">
          <div>
            <p className="text-xs font-bold text-slate-500 uppercase tracking-wider">Total Tracked Assets</p>
            <p className="text-2xl font-black text-slate-900 mt-1">{assets.length}</p>
            <span className="text-[11px] text-slate-500 font-medium">100% Asset Lifecycle Visibility</span>
          </div>
          <div className="p-3 bg-indigo-50 border border-indigo-100 text-indigo-600 rounded-xl">
            <Server className="w-6 h-6" />
          </div>
        </div>

        <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-3xs flex items-center justify-between">
          <div>
            <p className="text-xs font-bold text-slate-500 uppercase tracking-wider">ISO 27001 Compliant</p>
            <p className="text-2xl font-black text-emerald-600 mt-1">{compliantCount} / {assets.length}</p>
            <span className="text-[11px] text-emerald-600 font-semibold">{Math.round((compliantCount / assets.length) * 100)}% Pass Rate</span>
          </div>
          <div className="p-3 bg-emerald-50 border border-emerald-100 text-emerald-600 rounded-xl">
            <ShieldCheck className="w-6 h-6" />
          </div>
        </div>

        <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-3xs flex items-center justify-between">
          <div>
            <p className="text-xs font-bold text-slate-500 uppercase tracking-wider">Shadow IT / Key Risks</p>
            <p className="text-2xl font-black text-rose-600 mt-1">{nonCompliantCount}</p>
            <span className="text-[11px] text-rose-600 font-semibold">Requires Remediation</span>
          </div>
          <div className="p-3 bg-rose-50 border border-rose-100 text-rose-600 rounded-xl">
            <ShieldAlert className="w-6 h-6" />
          </div>
        </div>

        <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-3xs flex items-center justify-between">
          <div>
            <p className="text-xs font-bold text-slate-500 uppercase tracking-wider">PQC Encryption Active</p>
            <p className="text-2xl font-black text-indigo-600 mt-1">
              {assets.filter((a) => a.cryptographicStatus.includes('PQC')).length} / {assets.length}
            </p>
            <span className="text-[11px] text-indigo-600 font-semibold">Kyber-768 Enforced</span>
          </div>
          <div className="p-3 bg-amber-50 border border-amber-100 text-amber-600 rounded-xl">
            <Lock className="w-6 h-6" />
          </div>
        </div>
      </div>

      {/* Navigation Tabs */}
      <div className="flex border-b border-slate-200 overflow-x-auto gap-2 text-sm font-bold">
        <button
          onClick={() => setActiveTab('overview')}
          className={`pb-3 px-4 flex items-center gap-2 border-b-2 transition-colors cursor-pointer whitespace-nowrap ${
            activeTab === 'overview' ? 'border-indigo-600 text-indigo-600' : 'border-transparent text-slate-500 hover:text-slate-800'
          }`}
        >
          <Layers className="w-4 h-4" />
          Overview & ISO 27001 Annex A.8
        </button>
        <button
          onClick={() => setActiveTab('kms')}
          className={`pb-3 px-4 flex items-center gap-2 border-b-2 transition-colors cursor-pointer whitespace-nowrap ${
            activeTab === 'kms' ? 'border-indigo-600 text-indigo-600' : 'border-transparent text-slate-500 hover:text-slate-800'
          }`}
        >
          <Key className="w-4 h-4 text-indigo-600" />
          Cryptographic KMS & Key Rotation
        </button>
        <button
          onClick={() => setActiveTab('shadow_it')}
          className={`pb-3 px-4 flex items-center gap-2 border-b-2 transition-colors cursor-pointer whitespace-nowrap ${
            activeTab === 'shadow_it' ? 'border-indigo-600 text-indigo-600' : 'border-transparent text-slate-500 hover:text-slate-800'
          }`}
        >
          <Sparkles className="w-4 h-4 text-indigo-600" />
          Shadow IT & SaaS Scanner
        </button>
        <button
          onClick={() => setActiveTab('decommission')}
          className={`pb-3 px-4 flex items-center gap-2 border-b-2 transition-colors cursor-pointer whitespace-nowrap ${
            activeTab === 'decommission' ? 'border-indigo-600 text-indigo-600' : 'border-transparent text-slate-500 hover:text-slate-800'
          }`}
        >
          <FileCheck className="w-4 h-4" />
          Decommissioning & Destruction
        </button>
        <button
          onClick={() => setActiveTab('inventory')}
          className={`pb-3 px-4 flex items-center gap-2 border-b-2 transition-colors cursor-pointer whitespace-nowrap ${
            activeTab === 'inventory' ? 'border-indigo-600 text-indigo-600' : 'border-transparent text-slate-500 hover:text-slate-800'
          }`}
        >
          <HardDrive className="w-4 h-4" />
          Asset Inventory ({filteredAssets.length})
        </button>
        <button
          onClick={() => setActiveTab('qr_scanner')}
          className={`pb-3 px-4 flex items-center gap-2 border-b-2 transition-colors cursor-pointer whitespace-nowrap ${
            activeTab === 'qr_scanner' ? 'border-cyan-600 text-cyan-600 font-black' : 'border-transparent text-slate-500 hover:text-slate-800'
          }`}
        >
          <QrCode className="w-4 h-4 text-cyan-600" />
          Hardware Camera QR Scanner
          <span className="px-1.5 py-0.5 rounded-full bg-cyan-100 text-cyan-700 text-[10px] font-mono">LIVE</span>
        </button>
      </div>

      {/* TAB 1: OVERVIEW */}
      {activeTab === 'overview' && (
        <div className="space-y-4 sm:space-y-6">
          <div className="bg-gradient-to-r from-slate-900 via-indigo-950 to-slate-900 text-white p-4 sm:p-5 lg:p-6 rounded-2xl shadow-md border border-slate-800 space-y-4">
            <div className="flex items-center justify-between">
              <span className="px-3 py-1 bg-indigo-500/20 border border-indigo-400/30 rounded-full text-indigo-300 text-xs font-bold font-mono flex items-center gap-1.5">
                <ShieldCheck className="w-3.5 h-3.5" />
                ISO/IEC 19770 & ISO 27001 ANNEX A.8 ACTIVE
              </span>
              <span className="text-xs text-slate-400 font-mono">Real-Time HSM Telemetry</span>
            </div>
            <div>
              <h2 className="text-xl font-bold text-white">Sovereign Hardware & Software Asset Governance</h2>
              <p className="text-xs text-slate-300 mt-1 max-w-2xl leading-relaxed">
                Maintain continuous inventory control over physical servers, cloud databases, HSM master keys, and software licenses. Eliminate unencrypted data storage and unauthorized Shadow IT access.
              </p>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 sm:gap-6">
            <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-3xs space-y-3">
              <div className="flex items-center gap-2 text-indigo-600 font-bold text-sm">
                <Lock className="w-4 h-4" />
                Post-Quantum Cryptography (PQC)
              </div>
              <p className="text-xs text-slate-500">
                Enforce NIST-approved Kyber-768 and Dilithium algorithms on all asset data stores to prevent harvest-now-decrypt-later attacks.
              </p>
            </div>

            <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-3xs space-y-3">
              <div className="flex items-center gap-2 text-indigo-600 font-bold text-sm">
                <Globe className="w-4 h-4" />
                Geofencing & Sovereign Residency
              </div>
              <p className="text-xs text-slate-500">
                Verify that physical assets and cloud enclaves remain locked inside designated EU sovereign regions (Frankfurt, Dublin, Paris).
              </p>
            </div>

            <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-3xs space-y-3">
              <div className="flex items-center gap-2 text-indigo-600 font-bold text-sm">
                <Key className="w-4 h-4" />
                Automated KMS Rotation
              </div>
              <p className="text-xs text-slate-500">
                Set mandatory 90-day rotation schedules for master encryption keys with zero downtime hardware security module (HSM) re-wrapping.
              </p>
            </div>
          </div>
        </div>
      )}

      {/* TAB 2: KMS & ROTATION */}
      {activeTab === 'kms' && (
        <div className="bg-white p-4 sm:p-5 lg:p-6 rounded-2xl border border-slate-200 shadow-3xs space-y-4 sm:space-y-6">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-base font-bold text-slate-900 flex items-center gap-2">
                <Key className="w-5 h-5 text-indigo-600" />
                Hardware Security Module (HSM) & KMS Key Rotation
              </h3>
              <p className="text-xs text-slate-500 mt-1">Re-wrap and rotate master keys to maintain quantum-resistant encryption standards.</p>
            </div>
          </div>

          <div className="p-4 bg-slate-50 border border-slate-200 rounded-xl space-y-4">
            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">Select Target Key Set for Rotation</label>
                <select
                  value={selectedKey}
                  onChange={(e) => setSelectedKey(e.target.value)}
                  className="p-2.5 border border-slate-200 rounded-lg text-xs bg-white text-slate-800 font-bold focus:ring-2 focus:ring-indigo-500 focus:outline-none"
                >
                  {assets
                    .filter((a) => a.type === 'KMS Encryption Key' || a.complianceStatus === 'Key Rotation Due')
                    .map((a) => (
                      <option key={a.id} value={a.id}>
                        {a.name} ({a.id}) - {a.cryptographicStatus}
                      </option>
                    ))}
                </select>
              </div>

              <button
                onClick={handleRotateKey}
                disabled={isRotatingKey}
                className="px-5 py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-bold rounded-xl transition-all shadow-sm flex items-center gap-2 cursor-pointer disabled:opacity-50 self-end"
              >
                {isRotatingKey ? <RefreshCw className="w-4 h-4 animate-spin" /> : <Lock className="w-4 h-4" />}
                {isRotatingKey ? 'Re-wrapping Keys in HSM...' : 'Rotate Key Set & Upgrade Cipher'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* TAB 3: SHADOW IT */}
      {activeTab === 'shadow_it' && (
        <div className="bg-white p-4 sm:p-5 lg:p-6 rounded-2xl border border-slate-200 shadow-3xs space-y-4 sm:space-y-6">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-base font-bold text-slate-900 flex items-center gap-2">
                <Sparkles className="w-5 h-5 text-indigo-600" />
                Automated Shadow IT & SaaS Application Scanner
              </h3>
              <p className="text-xs text-slate-500 mt-1">Detect unsanctioned third-party cloud apps and unverified OAuth tokens across corporate networks.</p>
            </div>
            <button
              onClick={handleScanShadowIt}
              disabled={isScanningShadowIt}
              className="px-5 py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-xs rounded-xl transition-all shadow-sm flex items-center gap-2 cursor-pointer disabled:opacity-50"
            >
              {isScanningShadowIt ? <RefreshCw className="w-4 h-4 animate-spin" /> : <Search className="w-4 h-4" />}
              {isScanningShadowIt ? 'Scanning Endpoints...' : 'Run Shadow IT Inspection'}
            </button>
          </div>

          {shadowItResults && (
            <div className="space-y-4">
              <div className="p-4 bg-rose-50 border border-rose-200 rounded-xl flex items-center justify-between">
                <div>
                  <p className="text-xs font-bold text-rose-800 uppercase">Unsanctioned SaaS Applications</p>
                  <p className="text-2xl font-black text-rose-900">{shadowItResults.unapprovedAppsFound} Discovered</p>
                </div>
                <span className="px-3 py-1 bg-rose-200 text-rose-900 text-xs font-bold rounded-full">High Severity Risk</span>
              </div>

              <div className="space-y-2">
                {shadowItResults.findings.map((item: any, idx: number) => (
                  <div key={idx} className="p-3 bg-slate-50 border border-slate-200 rounded-lg flex items-center justify-between text-xs">
                    <div>
                      <p className="font-bold text-slate-900">{item.app}</p>
                      <p className="text-slate-600 mt-0.5">• {item.issue}</p>
                    </div>
                    <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-rose-100 text-rose-700">{item.risk}</span>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      )}

      {/* TAB 4: DECOMMISSIONING */}
      {activeTab === 'decommission' && (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-4 sm:gap-6">
          <div className="lg:col-span-5 bg-white p-4 sm:p-5 lg:p-6 rounded-2xl border border-slate-200 shadow-3xs space-y-4">
            <h3 className="text-base font-bold text-slate-900 flex items-center gap-2">
              <FileCheck className="w-5 h-5 text-indigo-600" />
              Cryptographic Asset Decommissioning
            </h3>

            <div className="space-y-3 text-xs">
              <div>
                <label className="block font-bold text-slate-700 mb-1">Select Asset to Decommission</label>
                <select
                  value={decomAssetId}
                  onChange={(e) => setDecomAssetId(e.target.value)}
                  className="w-full p-2.5 border border-slate-200 rounded-lg bg-white font-bold"
                >
                  {assets.map((a) => (
                    <option key={a.id} value={a.id}>
                      {a.name} ({a.id})
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block font-bold text-slate-700 mb-1">Sanitization Standard</label>
                <select
                  value={decomMethod}
                  onChange={(e) => setDecomMethod(e.target.value)}
                  className="w-full p-2.5 border border-slate-200 rounded-lg bg-white"
                >
                  <option value="Cryptographic Zeroization & DoD 5220.22-M Wipe">Cryptographic Zeroization & DoD 5220.22-M Wipe</option>
                  <option value="NIST SP 800-88 Rev. 1 Purge Method">NIST SP 800-88 Rev. 1 Purge Method</option>
                  <option value="Physical Demagnetization & Shredding Certificate">Physical Demagnetization & Shredding Certificate</option>
                </select>
              </div>

              <button
                onClick={handleGenerateDecomCert}
                className="w-full py-3 bg-indigo-600 hover:bg-indigo-700 text-white font-bold rounded-xl text-xs transition-all shadow-sm flex items-center justify-center gap-2 cursor-pointer"
              >
                <FileCheck className="w-4 h-4" />
                Generate Certificate of Destruction
              </button>
            </div>
          </div>

          <div className="lg:col-span-7 bg-white p-4 sm:p-5 lg:p-6 rounded-2xl border border-slate-200 shadow-3xs space-y-4">
            <h3 className="text-base font-bold text-slate-900 flex items-center gap-2">
              <FileText className="w-5 h-5 text-indigo-600" />
              Generated Decommissioning Certificate
            </h3>

            {!decomCert ? (
              <div className="p-16 text-center text-slate-400 space-y-2">
                <FileCheck className="w-12 h-12 mx-auto text-slate-300" />
                <p className="text-sm font-semibold">No Certificate Generated</p>
                <p className="text-xs">Select an asset on the left to issue an official audit-proof destruction certificate.</p>
              </div>
            ) : (
              <textarea
                rows={12}
                readOnly
                value={decomCert}
                className="w-full p-4 border border-slate-200 rounded-xl font-mono text-xs bg-slate-50 text-slate-800 focus:outline-none"
              />
            )}
          </div>
        </div>
      )}

      {/* TAB 5: INVENTORY TABLE */}
      {activeTab === 'inventory' && (
        <div className="bg-white rounded-2xl border border-slate-200 shadow-3xs p-4 sm:p-5 lg:p-6 space-y-4">
          <div className="flex flex-col md:flex-row justify-between gap-4">
            <div className="relative flex-1">
              <Search className="w-4 h-4 text-slate-400 absolute left-3 top-3" />
              <input
                type="text"
                placeholder="Search assets by name, ID, or location..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-9 pr-4 py-2 border border-slate-200 rounded-xl text-xs focus:ring-1 focus:ring-indigo-500 focus:outline-none"
              />
            </div>
            <select
              value={typeFilter}
              onChange={(e) => setTypeFilter(e.target.value)}
              className="p-2 border border-slate-200 rounded-xl text-xs bg-white text-slate-700 font-medium"
            >
              <option value="all">All Asset Types</option>
              <option value="Hardware Server">Hardware Server</option>
              <option value="KMS Encryption Key">KMS Encryption Key</option>
              <option value="SaaS Application">SaaS Application</option>
              <option value="Database Cluster">Database Cluster</option>
              <option value="IoT / Edge Device">IoT / Edge Device</option>
            </select>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse text-xs">
              <thead>
                <tr className="border-b border-slate-200 text-slate-500 bg-slate-50">
                  <th className="p-3">ID</th>
                  <th className="p-3">Asset Name</th>
                  <th className="p-3">Type</th>
                  <th className="p-3">Location</th>
                  <th className="p-3">Cryptographic Cipher</th>
                  <th className="p-3">Compliance Status</th>
                  <th className="p-3">Risk Score</th>
                  <th className="p-3 text-right">Physical QR Audit</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {filteredAssets.map((a) => (
                  <tr key={a.id} className="hover:bg-slate-50">
                    <td className="p-3 font-mono text-slate-400 font-bold">{a.id}</td>
                    <td className="p-3 font-bold text-slate-900">{a.name}</td>
                    <td className="p-3 text-slate-600">{a.type}</td>
                    <td className="p-3 text-slate-600">{a.location}</td>
                    <td className="p-3 font-mono font-semibold text-slate-700">{a.cryptographicStatus}</td>
                    <td className="p-3">
                      <span
                        className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${
                          a.complianceStatus === 'Compliant'
                            ? 'bg-emerald-100 text-emerald-700'
                            : a.complianceStatus === 'Key Rotation Due'
                            ? 'bg-amber-100 text-amber-700'
                            : 'bg-rose-100 text-rose-700'
                        }`}
                      >
                        {a.complianceStatus}
                      </span>
                    </td>
                    <td className="p-3 font-bold">{a.riskScore} / 100</td>
                    <td className="p-3 text-right">
                      <button
                        onClick={() => {
                          setSelectedScanAssetId(a.id === 'AST-2026-901' ? 'AST-HW-901' : a.id === 'AST-2026-902' ? 'AST-HW-902' : 'AST-HW-901');
                          setActiveTab('qr_scanner');
                        }}
                        className="px-2.5 py-1 bg-slate-100 hover:bg-indigo-50 border border-slate-200 hover:border-indigo-200 text-slate-700 hover:text-indigo-600 rounded-lg text-xs font-mono font-bold inline-flex items-center gap-1 transition-all cursor-pointer"
                      >
                        <QrCode className="w-3.5 h-3.5" />
                        <span>Inspect QR</span>
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* TAB 6: PHYSICAL HARDWARE QR CODE SCANNER */}
      {activeTab === 'qr_scanner' && (
        <div className="space-y-4">
          <HardwareAssetQrScanner initialAssetId={selectedScanAssetId} />
        </div>
      )}

      {/* MODAL SCANNER OVERLAY */}
      {showQrModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-sm animate-in fade-in duration-200">
          <HardwareAssetQrScanner
            isModal={true}
            initialAssetId={selectedScanAssetId}
            onClose={() => setShowQrModal(false)}
          />
        </div>
      )}
    </div>
  );
};
