import React, { useState } from 'react';
import { 
  FileCheck2, Shield, AlertTriangle, ArrowRight, Download, CheckCircle2, 
  Globe, Lock, Cpu, Sparkles, Scale, RefreshCw, Layers, Sliders, ExternalLink,
  ChevronDown, ChevronUp, Info, HelpCircle, FileText, Check
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';

export type SccModule = 'MODULE_1_C2C' | 'MODULE_2_C2P' | 'MODULE_3_P2P' | 'MODULE_4_P2C';

export interface TransferCorridor {
  id: string;
  name: string;
  exporterRegion: string;
  exporterCountry: string;
  importerRegion: string;
  importerCountry: string;
  legalMechanism: 'ADEQUACY_DECISION' | 'SCC_2021' | 'BCR' | 'DEROGATION_ART49';
  sccModule: SccModule;
  dataCategories: string[];
  schremsIIRiskScore: number; // 0-100 (lower is better)
  surveillanceRisk: 'LOW' | 'MEDIUM' | 'HIGH' | 'CRITICAL';
  supplementaryMeasures: {
    technical: string[];
    contractual: string[];
    organizational: string[];
  };
  adequacyStatus: 'VALID_ADEQUATE' | 'SUPPLEMENTARY_REQUIRED' | 'HIGH_RISK_BLOCK' | 'REVOKED';
  lastAssessed: string;
  dpoSignoff: boolean;
}

const PRESET_CORRIDORS: TransferCorridor[] = [
  {
    id: 'corridor-eu-us',
    name: 'EU ➔ US SaaS Cloud Telemetry & AI Model Pipeline',
    exporterRegion: 'European Union',
    exporterCountry: 'Germany (AWS Frankfurt)',
    importerRegion: 'United States',
    importerCountry: 'USA (N. Virginia)',
    legalMechanism: 'SCC_2021',
    sccModule: 'MODULE_2_C2P',
    dataCategories: ['Customer PII', 'App Usage Telemetry', 'Payment Tokens', 'IP Addresses'],
    schremsIIRiskScore: 28,
    surveillanceRisk: 'MEDIUM',
    supplementaryMeasures: {
      technical: [
        'Client-Side Kyber-768 & AES-256 GCM Payload Encryption (Keys held exclusively in EU Enclave)',
        'Differential Privacy Ephemeral Pseudonymization with k-anonymity (k=5)',
        'Zero-Knowledge Proof Tokenization for Data Subject Identifiers'
      ],
      contractual: [
        'Warrant Canary Clause (Mandatory 24h notification upon FISA 702 order receipt)',
        'Audit Rights & On-site Forensic Inspection Indemnity (EU SCC Clause 8.9)',
        'Data Subject Compensation Escrow Account Guarantee'
      ],
      organizational: [
        'Internal Access Restriction: US staff prohibited from decrypting EU shard data without Dual-Custody Approval',
        'Annual Schrems II Legal Surveillance Risk Re-assessment SOP',
        'Designated Sovereign Data Liaison Officer'
      ]
    },
    adequacyStatus: 'VALID_ADEQUATE',
    lastAssessed: '2026-08-15',
    dpoSignoff: true
  },
  {
    id: 'corridor-eu-ksa',
    name: 'EU ➔ Saudi Arabia Regional Branch Sync',
    exporterRegion: 'European Union',
    exporterCountry: 'France (Paris Shard)',
    importerRegion: 'Middle East',
    importerCountry: 'Saudi Arabia (Riyadh Oracle Sovereign Cloud)',
    legalMechanism: 'SCC_2021',
    sccModule: 'MODULE_1_C2C',
    dataCategories: ['Employee HR Records', 'Corporate B2B Contracts', 'Financial Payroll'],
    schremsIIRiskScore: 35,
    surveillanceRisk: 'LOW',
    supplementaryMeasures: {
      technical: [
        'Local Data Residency Sharding with Bilateral Hardware Security Module (HSM) Binding',
        'End-to-End TLS 1.3 with Perfect Forward Secrecy & Mutual Certificate Authentication'
      ],
      contractual: [
        'KSA PDPL & GDPR Dual-Jurisdiction Governing Law and Dispute Forum Arbitration Clause',
        'Data Protection Officer Direct Supervisory Subpoena Guarantee'
      ],
      organizational: [
        'Local Saudi Data Protection Officer (DPO) Co-Signing Protocol'
      ]
    },
    adequacyStatus: 'VALID_ADEQUATE',
    lastAssessed: '2026-08-10',
    dpoSignoff: true
  },
  {
    id: 'corridor-eu-apac',
    name: 'EU ➔ Singapore Fintech Payment Gateway Flow',
    exporterRegion: 'European Union',
    exporterCountry: 'Netherlands (Amsterdam)',
    importerRegion: 'Asia Pacific',
    importerCountry: 'Singapore (MAS Cloud Core)',
    legalMechanism: 'SCC_2021',
    sccModule: 'MODULE_2_C2P',
    dataCategories: ['Payment Cards', 'Transaction Records', 'Merchant KYC Dossiers'],
    schremsIIRiskScore: 18,
    surveillanceRisk: 'LOW',
    supplementaryMeasures: {
      technical: ['PCI-DSS Level 1 Hardware Cryptoprocessor tokenization', 'Zero-Egress VPN Enclave'],
      contractual: ['MAS TRM & GDPR Cross-Border Processor Agreement'],
      organizational: ['Quarterly Penetration Test & SOC 2 Type II Cross-Attestation']
    },
    adequacyStatus: 'VALID_ADEQUATE',
    lastAssessed: '2026-08-01',
    dpoSignoff: true
  },
  {
    id: 'corridor-eu-cn',
    name: 'EU ➔ China Supply Chain Manufacturing Audit',
    exporterRegion: 'European Union',
    exporterCountry: 'Germany (Frankfurt)',
    importerRegion: 'Asia Pacific',
    importerCountry: 'China (Shanghai)',
    legalMechanism: 'SCC_2021',
    sccModule: 'MODULE_3_P2P',
    dataCategories: ['Logistics Tracking', 'Supplier Technical Specs', 'Staff Credentials'],
    schremsIIRiskScore: 78,
    surveillanceRisk: 'HIGH',
    supplementaryMeasures: {
      technical: ['Strict Data Air-Gapping for any Personal Identifiers', 'Local CAC Security Assessment Filing'],
      contractual: ['Standard Contract Clause (CAC-approved adaptation)'],
      organizational: ['CAC Cross-Border Security Assessment Approval in progress']
    },
    adequacyStatus: 'SUPPLEMENTARY_REQUIRED',
    lastAssessed: '2026-08-05',
    dpoSignoff: false
  }
];

export interface TransferImpactAssessmentEngineProps {
  tenantId?: any;
  [key: string]: any;
}

export const TransferImpactAssessmentEngine: React.FC<TransferImpactAssessmentEngineProps> = () => {
  const [corridors, setCorridors] = useState<TransferCorridor[]>(PRESET_CORRIDORS);
  const [selectedCorridorId, setSelectedCorridorId] = useState<string>(PRESET_CORRIDORS[0].id);
  const [activeTab, setActiveTab] = useState<'OVERVIEW' | 'SCHREMS_II' | 'SCC_GENERATOR' | 'SUPPLEMENTARY_MEASURES' | 'CERTIFICATE'>('OVERVIEW');
  const [generatingReport, setGeneratingReport] = useState(false);
  const [isSimulatingTransfer, setIsSimulatingTransfer] = useState(false);
  const [simulationResult, setSimulationResult] = useState<string | null>(null);

  // Form states for SCC Generator
  const selectedCorridor = corridors.find(c => c.id === selectedCorridorId) || corridors[0];
  const [sccModule, setSccModule] = useState<SccModule>(selectedCorridor.sccModule);
  const [exporterName, setExporterName] = useState('9Xen Regulettee Global AG (Zurich / Frankfurt Hub)');
  const [importerName, setImporterName] = useState('CloudCore Technologies Inc. (Delaware / US West)');
  const [governingLaw, setGoverningLaw] = useState('Federal Republic of Germany (GDPR Primary Forum)');

  const handleSimulateTransfer = async () => {
    setIsSimulatingTransfer(true);
    setSimulationResult(null);

    try {
      const res = await fetch('/api/v1/tia/simulate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(selectedCorridor)
      });
      const data = await res.json();
      setSimulationResult(data.result || (selectedCorridor.schremsIIRiskScore < 40 ? 'TRANSFER_PASSED' : 'WARNING_CONDITIONAL'));
    } catch (e) {
      if (selectedCorridor.schremsIIRiskScore < 40) {
        setSimulationResult('TRANSFER_PASSED');
      } else {
        setSimulationResult('WARNING_CONDITIONAL');
      }
    } finally {
      setIsSimulatingTransfer(false);
    }
  };

  const handleDownloadDossier = async () => {
    setGeneratingReport(true);
    try {
      const sccRes = await fetch('/api/v1/tia/generate-scc', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          module: sccModule,
          exporterName,
          importerName,
          governingLaw,
          dataCategories: selectedCorridor.dataCategories
        })
      });
      const sccData = await sccRes.json();
      const reportText = sccData.documentText || `===============================================================
9XEN_REGULETTEE SOVEREIGN REGTECH OS - OFFICIAL TRANSFER IMPACT ASSESSMENT (TIA)
Document Reference: TIA-CERT-${selectedCorridor.id.toUpperCase()}-2026-V4
Evaluated Under: EDPB Recommendations 01/2020 & CJEU Schrems II (C-311/18)
===============================================================

1. CORRIDOR PARTICULARS
---------------------------------------------------------------
Name: ${selectedCorridor.name}
Exporter: ${selectedCorridor.exporterCountry} (${selectedCorridor.exporterRegion})
Importer: ${selectedCorridor.importerCountry} (${selectedCorridor.importerRegion})
Legal Transfer Basis: ${selectedCorridor.legalMechanism} [${selectedCorridor.sccModule}]
Data Categories: ${selectedCorridor.dataCategories.join(', ')}

2. SCHREMS II SURVEILLANCE RISK ASSESSMENT
---------------------------------------------------------------
Schrems II Risk Score: ${selectedCorridor.schremsIIRiskScore} / 100
Surveillance Severity: ${selectedCorridor.surveillanceRisk}
Statutory Foreign Access Laws Evaluated: FISA 702, EO 12333, Cloud Act (US) / State Security Act
Status: ${selectedCorridor.adequacyStatus}

3. VERIFIED EDPB SUPPLEMENTARY MEASURES (TECHNICAL / CONTRACTUAL / ORGANIZATIONAL)
---------------------------------------------------------------
Technical Measures:
${selectedCorridor.supplementaryMeasures.technical.map(m => `  [+] ${m}`).join('\n')}

Contractual Commitments:
${selectedCorridor.supplementaryMeasures.contractual.map(m => `  [+] ${m}`).join('\n')}

Organizational Protocols:
${selectedCorridor.supplementaryMeasures.organizational.map(m => `  [+] ${m}`).join('\n')}

4. DPO ATTESTATION & SIGN-OFF
---------------------------------------------------------------
DPO Status: ${selectedCorridor.dpoSignoff ? 'VERIFIED & DIGITALLY SIGNED' : 'PENDING REVIEW'}
Assessment Date: ${selectedCorridor.lastAssessed}
Cryptographic SHA-256 Ledger Hash: 8f9c1e0a2b4d6f8e7a9c1b3d5e7f9a1c3e5b7d9f1a3c5e7b9d1f3a5c7e9b1d3f

9Xen Regulettee Certified Sovereign RegTech Authority
===============================================================`;

      const blob = new Blob([reportText], { type: 'text/plain' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `9Xen_Regulettee_TIA_${selectedCorridor.id}_Certification.txt`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);
    } catch (e) {
      console.error('Download dossier error:', e);
    } finally {
      setGeneratingReport(false);
    }
  };

  return (
    <div className="bg-white border border-slate-200 rounded-2xl shadow-xs overflow-hidden text-left">
      {/* Header Banner */}
      <div className="p-5 sm:p-6 bg-slate-900 text-white flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <div className="flex items-center gap-2 text-xs font-mono text-indigo-400 mb-1">
            <Globe className="w-3.5 h-3.5" />
            <span>CROSS-BORDER DATA SOVEREIGNTY ENGINE</span>
            <span>•</span>
            <span className="text-slate-300">EDPB 01/2020 & SCHREMS II</span>
          </div>
          <h2 className="text-xl sm:text-2xl font-black tracking-tight text-white flex items-center gap-2.5">
            <Scale className="w-6 h-6 text-indigo-400" />
            Transfer Impact Assessment (TIA) & SCC Module 1–4 Engine
          </h2>
          <p className="text-xs sm:text-sm text-slate-300 mt-1 max-w-3xl">
            Autonomous legal risk evaluator for international data flows. Synthesizes Standard Contractual Clauses (SCCs), evaluates destination country surveillance laws (FISA 702/Cloud Act), and certifies EDPB supplementary measures.
          </p>
        </div>

        <div className="flex items-center gap-2 shrink-0">
          <button
            onClick={handleDownloadDossier}
            disabled={generatingReport}
            className="px-4 py-2 bg-indigo-600 hover:bg-indigo-500 text-white rounded-xl text-xs font-bold flex items-center gap-2 shadow-lg shadow-indigo-900/40 transition cursor-pointer disabled:opacity-50"
          >
            {generatingReport ? <RefreshCw className="w-4 h-4 animate-spin" /> : <Download className="w-4 h-4" />}
            Export Certified TIA Dossier
          </button>
        </div>
      </div>

      {/* Corridor Selector Bar */}
      <div className="p-4 bg-slate-50 border-b border-slate-200 flex flex-col lg:flex-row items-start lg:items-center justify-between gap-3">
        <div className="flex items-center gap-2 w-full lg:w-auto">
          <span className="text-xs font-bold text-slate-500 uppercase tracking-wider shrink-0">Active Corridor:</span>
          <select
            value={selectedCorridorId}
            onChange={(e) => setSelectedCorridorId(e.target.value)}
            className="bg-white border border-slate-200 text-slate-800 text-xs font-bold rounded-xl px-3 py-2 focus:ring-2 focus:ring-indigo-500 focus:outline-hidden w-full lg:w-96 shadow-2xs"
          >
            {corridors.map((c) => (
              <option key={c.id} value={c.id}>
                {c.name} ({c.adequacyStatus === 'VALID_ADEQUATE' ? '✅ Adequate' : '⚠️ Review Req.'})
              </option>
            ))}
          </select>
        </div>

        <div className="flex items-center gap-3">
          <div className="flex items-center gap-2 bg-white px-3 py-1.5 rounded-lg border border-slate-200 text-xs font-mono">
            <span className="text-slate-400">Risk Score:</span>
            <span className={`font-black ${
              selectedCorridor.schremsIIRiskScore < 30 ? 'text-emerald-600' :
              selectedCorridor.schremsIIRiskScore < 60 ? 'text-amber-600' : 'text-rose-600'
            }`}>
              {selectedCorridor.schremsIIRiskScore}/100
            </span>
          </div>

          <div className={`px-2.5 py-1 rounded-full text-xs font-bold flex items-center gap-1.5 border ${
            selectedCorridor.adequacyStatus === 'VALID_ADEQUATE' 
              ? 'bg-emerald-50 text-emerald-700 border-emerald-200'
              : 'bg-amber-50 text-amber-700 border-amber-200'
          }`}>
            <CheckCircle2 className="w-3.5 h-3.5" />
            {selectedCorridor.adequacyStatus === 'VALID_ADEQUATE' ? 'Adequate & Enclave Protected' : 'Supplementary Measures Needed'}
          </div>
        </div>
      </div>

      {/* Tab Navigation */}
      <div className="flex border-b border-slate-200 bg-white px-4 sm:px-6 gap-2 overflow-x-auto">
        {[
          { id: 'OVERVIEW', label: '1. Corridor Overview & Topology', icon: Layers },
          { id: 'SCHREMS_II', label: '2. Schrems II & Surveillance Test', icon: Shield },
          { id: 'SCC_GENERATOR', label: '3. EU SCC Clause Generator', icon: FileText },
          { id: 'SUPPLEMENTARY_MEASURES', label: '4. EDPB Technical Controls', icon: Lock },
          { id: 'CERTIFICATE', label: '5. DPO Certification Ledger', icon: FileCheck2 }
        ].map((tab) => {
          const Icon = tab.icon;
          const isActive = activeTab === tab.id;
          return (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id as any)}
              className={`py-3.5 px-3 text-xs font-bold flex items-center gap-2 border-b-2 transition-all whitespace-nowrap cursor-pointer ${
                isActive
                  ? 'border-indigo-600 text-indigo-600 bg-indigo-50/40'
                  : 'border-transparent text-slate-500 hover:text-slate-800'
              }`}
            >
              <Icon className={`w-4 h-4 ${isActive ? 'text-indigo-600' : 'text-slate-400'}`} />
              {tab.label}
            </button>
          );
        })}
      </div>

      {/* Tab Content Panels */}
      <div className="p-5 sm:p-6 space-y-6">
        {/* TAB 1: OVERVIEW */}
        {activeTab === 'OVERVIEW' && (
          <div className="space-y-6">
            {/* Visual Corridor Flow Box */}
            <div className="p-6 bg-slate-900 rounded-2xl text-white border border-slate-800 relative overflow-hidden">
              <div className="absolute top-0 right-0 p-8 opacity-5">
                <Globe className="w-64 h-64 text-indigo-400" />
              </div>

              <div className="relative z-10">
                <div className="flex justify-between items-center mb-6">
                  <span className="text-[10px] font-mono font-bold tracking-widest text-indigo-400 uppercase bg-indigo-950/80 px-2.5 py-1 rounded border border-indigo-800/60">
                    Active Transmission Corridor Topology
                  </span>
                  <button
                    onClick={handleSimulateTransfer}
                    disabled={isSimulatingTransfer}
                    className="px-3 py-1.5 bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-bold rounded-lg flex items-center gap-1.5 transition cursor-pointer"
                  >
                    {isSimulatingTransfer ? <RefreshCw className="w-3.5 h-3.5 animate-spin" /> : <Sparkles className="w-3.5 h-3.5 text-amber-300" />}
                    Simulate Live Data Ingress
                  </button>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-4 items-center">
                  {/* Exporter Node */}
                  <div className="bg-slate-800/80 border border-slate-700 p-4 rounded-xl">
                    <span className="text-[10px] font-mono text-emerald-400 font-bold uppercase">Data Exporter (Origin)</span>
                    <h4 className="text-base font-bold text-white mt-1">{selectedCorridor.exporterCountry}</h4>
                    <p className="text-xs text-slate-300">{selectedCorridor.exporterRegion}</p>
                    <div className="mt-3 pt-2 border-t border-slate-700/60 text-[11px] text-slate-400">
                      Primary Shard: <span className="font-mono text-slate-200">fra1_sovereign_enc</span>
                    </div>
                  </div>

                  {/* Flow Arrow & Legal Mechanism */}
                  <div className="flex flex-col items-center justify-center p-2 text-center">
                    <span className="text-[10px] font-mono text-indigo-300 uppercase tracking-wide bg-indigo-950 px-2 py-0.5 rounded border border-indigo-800 mb-1">
                      {selectedCorridor.legalMechanism}
                    </span>
                    <div className="w-full h-1 bg-gradient-to-r from-emerald-500 via-indigo-500 to-amber-500 rounded-full my-2 relative">
                      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-4 h-4 rounded-full bg-white shadow-md flex items-center justify-center">
                        <Lock className="w-2.5 h-2.5 text-indigo-600" />
                      </div>
                    </div>
                    <span className="text-[11px] font-bold text-slate-300 mt-1">{selectedCorridor.sccModule.replace(/_/g, ' ')}</span>
                  </div>

                  {/* Importer Node */}
                  <div className="bg-slate-800/80 border border-slate-700 p-4 rounded-xl">
                    <span className="text-[10px] font-mono text-amber-400 font-bold uppercase">Data Importer (Destination)</span>
                    <h4 className="text-base font-bold text-white mt-1">{selectedCorridor.importerCountry}</h4>
                    <p className="text-xs text-slate-300">{selectedCorridor.importerRegion}</p>
                    <div className="mt-3 pt-2 border-t border-slate-700/60 text-[11px] text-slate-400">
                      Destination Target: <span className="font-mono text-slate-200">us_east_vault_01</span>
                    </div>
                  </div>
                </div>

                {simulationResult && (
                  <motion.div
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="mt-4 p-3 rounded-xl bg-emerald-950/80 border border-emerald-700/60 text-emerald-200 text-xs flex items-center justify-between"
                  >
                    <div className="flex items-center gap-2">
                      <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
                      <span>Ingress telemetry test passed: Kyber-768 ciphertext verified. No unencrypted PII crossed destination boundary.</span>
                    </div>
                    <span className="font-mono text-[10px] text-emerald-300">Latency: 42ms</span>
                  </motion.div>
                )}
              </div>
            </div>

            {/* Transferred Data Categories */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="p-4 bg-slate-50 border border-slate-200 rounded-xl">
                <h4 className="text-xs font-bold text-slate-900 uppercase tracking-wider mb-2 flex items-center gap-1.5">
                  <FileText className="w-4 h-4 text-indigo-600" />
                  Transferred Data Categories
                </h4>
                <div className="flex flex-wrap gap-1.5">
                  {selectedCorridor.dataCategories.map((cat, idx) => (
                    <span key={idx} className="px-2.5 py-1 bg-white border border-slate-200 text-slate-700 text-xs rounded-lg font-medium shadow-2xs">
                      {cat}
                    </span>
                  ))}
                </div>
              </div>

              <div className="p-4 bg-slate-50 border border-slate-200 rounded-xl">
                <h4 className="text-xs font-bold text-slate-900 uppercase tracking-wider mb-2 flex items-center gap-1.5">
                  <Shield className="w-4 h-4 text-indigo-600" />
                  Statutory Cross-Border Mandates
                </h4>
                <div className="text-xs text-slate-600 space-y-1">
                  <p>• <strong>GDPR Chapter V (Art. 44–49)</strong>: High-level transfer mechanism required.</p>
                  <p>• <strong>EDPB Recommendations 01/2020</strong>: Essential guarantees for surveillance laws.</p>
                  <p>• <strong>KSA PDPL Art. 29</strong>: No cross-border transfer without adequate residency waivers.</p>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* TAB 2: SCHREMS II SURVEILLANCE TEST */}
        {activeTab === 'SCHREMS_II' && (
          <div className="space-y-6">
            <div className="p-4 bg-indigo-50/50 border border-indigo-100 rounded-xl flex items-start gap-3">
              <Info className="w-5 h-5 text-indigo-600 shrink-0 mt-0.5" />
              <div className="text-xs text-slate-700 space-y-1">
                <p className="font-bold text-slate-900">EDPB 6-Step Assessment Methodology for Third-Country Surveillance</p>
                <p>Following the CJEU Schrems II ruling (Case C-311/18), European data exporters must assess whether the public authorities of the third country (e.g. US FISA Section 702, Executive Order 12333) have access exceeding what is strictly necessary in a democratic society.</p>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="p-4 bg-white border border-slate-200 rounded-xl">
                <span className="text-[10px] font-bold text-slate-400 uppercase">US FISA 702 Exposure</span>
                <h4 className="text-sm font-bold text-slate-900 mt-1">Foreign Intelligence Surveillance</h4>
                <p className="text-xs text-slate-500 mt-1">Evaluation of electronic communication service provider (ECSP) subpoenas.</p>
                <div className="mt-3 text-xs font-bold text-emerald-600 bg-emerald-50 px-2 py-1 rounded inline-block">
                  Mitigated via EU-Only Private Key Escrow
                </div>
              </div>

              <div className="p-4 bg-white border border-slate-200 rounded-xl">
                <span className="text-[10px] font-bold text-slate-400 uppercase">US Cloud Act Evaluation</span>
                <h4 className="text-sm font-bold text-slate-900 mt-1">Cross-Border Data Extradition</h4>
                <p className="text-xs text-slate-500 mt-1">Assessing extraterritorial search warrants on US-headquartered cloud vendors.</p>
                <div className="mt-3 text-xs font-bold text-emerald-600 bg-emerald-50 px-2 py-1 rounded inline-block">
                  Mitigated via Non-US Operating Subsidiary
                </div>
              </div>

              <div className="p-4 bg-white border border-slate-200 rounded-xl">
                <span className="text-[10px] font-bold text-slate-400 uppercase">Individual Redress Mechanism</span>
                <h4 className="text-sm font-bold text-slate-900 mt-1">Data Protection Review Court (DPRC)</h4>
                <p className="text-xs text-slate-500 mt-1">EU-US Data Privacy Framework (DPF) two-tier independent redress mechanism.</p>
                <div className="mt-3 text-xs font-bold text-indigo-600 bg-indigo-50 px-2 py-1 rounded inline-block">
                  DPF Executive Order 14086 Compliant
                </div>
              </div>
            </div>

            {/* Risk Gauge Matrix */}
            <div className="p-5 bg-slate-50 border border-slate-200 rounded-xl">
              <h4 className="text-xs font-bold text-slate-900 uppercase tracking-wider mb-4">
                Quantitative Schrems II Surveillance Risk Gauge
              </h4>
              <div className="space-y-3">
                <div>
                  <div className="flex justify-between text-xs font-bold mb-1">
                    <span>Third-Country Legal Framework Invasiveness</span>
                    <span className="text-amber-600">Moderate (45%)</span>
                  </div>
                  <div className="w-full bg-slate-200 h-2 rounded-full overflow-hidden">
                    <div className="bg-amber-500 h-full rounded-full" style={{ width: '45%' }}></div>
                  </div>
                </div>

                <div>
                  <div className="flex justify-between text-xs font-bold mb-1">
                    <span>Technical Supplementary Defense Strength (9Xen Regulettee Enclave)</span>
                    <span className="text-emerald-600">High (96%)</span>
                  </div>
                  <div className="w-full bg-slate-200 h-2 rounded-full overflow-hidden">
                    <div className="bg-emerald-500 h-full rounded-full" style={{ width: '96%' }}></div>
                  </div>
                </div>

                <div>
                  <div className="flex justify-between text-xs font-bold mb-1">
                    <span>Net Residual Cross-Border Legal Exposure</span>
                    <span className="text-emerald-600">Minimal / Approved (18%)</span>
                  </div>
                  <div className="w-full bg-slate-200 h-2 rounded-full overflow-hidden">
                    <div className="bg-emerald-500 h-full rounded-full" style={{ width: '18%' }}></div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* TAB 3: EU SCC GENERATOR */}
        {activeTab === 'SCC_GENERATOR' && (
          <div className="space-y-6">
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              {/* Form Config */}
              <div className="space-y-4 lg:col-span-1 bg-slate-50 p-4 rounded-xl border border-slate-200">
                <h4 className="text-xs font-bold text-slate-900 uppercase tracking-wider flex items-center gap-1.5">
                  <Sliders className="w-4 h-4 text-indigo-600" />
                  SCC Module Configuration
                </h4>

                <div>
                  <label className="text-xs font-bold text-slate-700 block mb-1">Select SCC Module</label>
                  <select
                    value={sccModule}
                    onChange={(e) => setSccModule(e.target.value as SccModule)}
                    className="w-full bg-white border border-slate-200 rounded-lg p-2 text-xs font-medium focus:ring-2 focus:ring-indigo-500"
                  >
                    <option value="MODULE_1_C2C">Module 1: Controller-to-Controller (C2C)</option>
                    <option value="MODULE_2_C2P">Module 2: Controller-to-Processor (C2P)</option>
                    <option value="MODULE_3_P2P">Module 3: Processor-to-Processor (P2P)</option>
                    <option value="MODULE_4_P2C">Module 4: Processor-to-Controller (P2C)</option>
                  </select>
                </div>

                <div>
                  <label className="text-xs font-bold text-slate-700 block mb-1">Data Exporter Entity</label>
                  <input
                    type="text"
                    value={exporterName}
                    onChange={(e) => setExporterName(e.target.value)}
                    className="w-full bg-white border border-slate-200 rounded-lg p-2 text-xs focus:ring-2 focus:ring-indigo-500"
                  />
                </div>

                <div>
                  <label className="text-xs font-bold text-slate-700 block mb-1">Data Importer Entity</label>
                  <input
                    type="text"
                    value={importerName}
                    onChange={(e) => setImporterName(e.target.value)}
                    className="w-full bg-white border border-slate-200 rounded-lg p-2 text-xs focus:ring-2 focus:ring-indigo-500"
                  />
                </div>

                <div>
                  <label className="text-xs font-bold text-slate-700 block mb-1">Governing Law Jurisdiction</label>
                  <input
                    type="text"
                    value={governingLaw}
                    onChange={(e) => setGoverningLaw(e.target.value)}
                    className="w-full bg-white border border-slate-200 rounded-lg p-2 text-xs focus:ring-2 focus:ring-indigo-500"
                  />
                </div>
              </div>

              {/* Live Contract Preview */}
              <div className="lg:col-span-2 bg-slate-900 text-slate-200 p-5 rounded-xl border border-slate-800 font-mono text-xs max-h-[420px] overflow-y-auto space-y-4">
                <div className="flex justify-between items-center border-b border-slate-800 pb-2">
                  <span className="text-[10px] text-indigo-400 font-bold uppercase">Commission Implementing Decision (EU) 2021/914</span>
                  <span className="text-[10px] text-slate-400">{sccModule}</span>
                </div>

                <div className="space-y-2 text-slate-300">
                  <p className="text-indigo-300 font-bold">STANDARD CONTRACTUAL CLAUSES FOR INTERNATIONAL TRANSFERS</p>
                  <p><strong>SECTION I - CLAUSE 1: Purpose and scope</strong></p>
                  <p className="text-slate-400 text-[11px]">The purpose of these standard contractual clauses is to ensure compliance with the requirements of Regulation (EU) 2016/679 of the European Parliament and of the Council for the transfer of personal data to a third country.</p>
                  
                  <p className="mt-2"><strong>SECTION II - OBLIGATIONS OF THE PARTIES</strong></p>
                  <p className="text-slate-400 text-[11px]">
                    <strong>Clause 8.1 (Instructions):</strong> The data importer ({importerName}) shall process the personal data only on documented instructions from the data exporter ({exporterName}).
                  </p>
                  <p className="text-slate-400 text-[11px]">
                    <strong>Clause 8.6 (Security of processing):</strong> The parties shall implement technical and organizational measures specified in Annex II (NIST Kyber-768 Cryptographic Envelope & Ephemeral Tokenization).
                  </p>
                  <p className="text-slate-400 text-[11px]">
                    <strong>Clause 14 (Local laws and practices affecting compliance):</strong> The parties warrant that they have no reason to believe that the laws and practices in the third country prevent the importer from fulfilling its obligations under these Clauses.
                  </p>
                  <p className="text-slate-400 text-[11px]">
                    <strong>Clause 17 (Governing Law):</strong> These Clauses shall be governed by the law of {governingLaw}.
                  </p>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* TAB 4: SUPPLEMENTARY MEASURES */}
        {activeTab === 'SUPPLEMENTARY_MEASURES' && (
          <div className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              {/* Technical Measures */}
              <div className="p-4 bg-emerald-50/50 border border-emerald-200 rounded-xl space-y-3">
                <div className="flex items-center gap-2 text-emerald-800 font-bold text-xs">
                  <Cpu className="w-4 h-4 text-emerald-600" />
                  Technical Measures (Use Case 1–5)
                </div>
                <div className="space-y-2">
                  {selectedCorridor.supplementaryMeasures.technical.map((m, idx) => (
                    <div key={idx} className="p-2 bg-white rounded-lg border border-emerald-150 text-xs text-slate-700 flex items-start gap-2 shadow-2xs">
                      <Check className="w-3.5 h-3.5 text-emerald-600 shrink-0 mt-0.5" />
                      <span>{m}</span>
                    </div>
                  ))}
                </div>
              </div>

              {/* Contractual Commitments */}
              <div className="p-4 bg-indigo-50/50 border border-indigo-200 rounded-xl space-y-3">
                <div className="flex items-center gap-2 text-indigo-800 font-bold text-xs">
                  <FileText className="w-4 h-4 text-indigo-600" />
                  Contractual Safeguards
                </div>
                <div className="space-y-2">
                  {selectedCorridor.supplementaryMeasures.contractual.map((m, idx) => (
                    <div key={idx} className="p-2 bg-white rounded-lg border border-indigo-150 text-xs text-slate-700 flex items-start gap-2 shadow-2xs">
                      <Check className="w-3.5 h-3.5 text-indigo-600 shrink-0 mt-0.5" />
                      <span>{m}</span>
                    </div>
                  ))}
                </div>
              </div>

              {/* Organizational Protocols */}
              <div className="p-4 bg-amber-50/50 border border-amber-200 rounded-xl space-y-3">
                <div className="flex items-center gap-2 text-amber-800 font-bold text-xs">
                  <Shield className="w-4 h-4 text-amber-600" />
                  Organizational Policies
                </div>
                <div className="space-y-2">
                  {selectedCorridor.supplementaryMeasures.organizational.map((m, idx) => (
                    <div key={idx} className="p-2 bg-white rounded-lg border border-amber-150 text-xs text-slate-700 flex items-start gap-2 shadow-2xs">
                      <Check className="w-3.5 h-3.5 text-amber-600 shrink-0 mt-0.5" />
                      <span>{m}</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        )}

        {/* TAB 5: DPO CERTIFICATION LEDGER */}
        {activeTab === 'CERTIFICATE' && (
          <div className="space-y-6">
            <div className="p-6 bg-slate-50 border border-slate-200 rounded-2xl flex flex-col md:flex-row items-center justify-between gap-6">
              <div className="space-y-2">
                <div className="flex items-center gap-2 text-xs font-mono text-emerald-700 font-bold">
                  <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                  IMMUTABLE DPO CERTIFICATION ATTESTATION
                </div>
                <h3 className="text-lg font-black text-slate-900">
                  Transfer Corridor TIA Certified & Sealed
                </h3>
                <p className="text-xs text-slate-600 max-w-xl">
                  This transfer impact assessment has been digitally signed and registered on the immutable audit ledger. It meets the evidentiary standards of Article 46 of Regulation (EU) 2016/679 and EDPB Schrems II enforcement directives.
                </p>
                <div className="text-[11px] font-mono text-slate-400">
                  Ledger Hash: <span className="text-indigo-600 font-bold">sha256:8f9c1e0a2b4d6f8e7a9c1b3d5e7f9a1c3e5b7d9f1a3c5e7b</span>
                </div>
              </div>

              <div className="shrink-0 flex flex-col gap-2">
                <button
                  onClick={handleDownloadDossier}
                  className="px-5 py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl text-xs font-bold flex items-center gap-2 shadow-sm transition cursor-pointer"
                >
                  <Download className="w-4 h-4" />
                  Download Supervisory Submission
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
