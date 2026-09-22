import React, { useState } from 'react';
import {
  FileText,
  ShieldCheck,
  ShieldAlert,
  FileCheck,
  AlertTriangle,
  Download,
  Search,
  Plus,
  CheckCircle2,
  XCircle,
  Cpu,
  Lock,
  Scale,
  RefreshCw,
  Zap,
  BookOpen,
  FileSignature,
  ArrowRight,
  Sparkles,
  Layers,
  Globe,
  Building,
  Check,
  Copy,
  ExternalLink,
  Shield,
  Clock,
  ChevronRight,
  Filter,
  Eye
} from 'lucide-react';
import { generatePdfExport } from '../utils/pdfGenerator';
import { useNotification } from '../context/NotificationContext';

interface ContractItem {
  id: string;
  title: string;
  party: string;
  category: 'DPA (Art. 28)' | 'SCC Module 2 (C2P)' | 'AI License SLA' | 'Subprocessor' | 'EU-US Transfer';
  jurisdiction: string;
  status: 'Compliant' | 'Missing Clauses' | 'Expiring Soon' | 'Under Audit' | 'Non-Compliant';
  riskScore: number; // 0 - 100 (0 = low risk, 100 = high risk)
  effectiveDate: string;
  expiryDate: string;
  dpaSigned: boolean;
  sccVerified: boolean;
  aiActClause: boolean;
  smartContractHash?: string;
  keyGaps: string[];
}

const INITIAL_CONTRACTS: ContractItem[] = [
  {
    id: 'CTR-2026-8801',
    title: 'Enterprise Master Cloud Data Processing Agreement',
    party: 'AWS EMEA SARL (Luxembourg)',
    category: 'DPA (Art. 28)',
    jurisdiction: 'EU-CENTRAL-1 (Frankfurt)',
    status: 'Compliant',
    riskScore: 8,
    effectiveDate: '2025-01-15',
    expiryDate: '2027-01-15',
    dpaSigned: true,
    sccVerified: true,
    aiActClause: true,
    smartContractHash: '0x94f1...a8e2',
    keyGaps: []
  },
  {
    id: 'CTR-2026-8802',
    title: 'Cross-Border Analytics Processing Subcontract',
    party: 'Mixpanel Inc. (USA)',
    category: 'SCC Module 2 (C2P)',
    jurisdiction: 'US-EAST-1 (Northern Virginia)',
    status: 'Missing Clauses',
    riskScore: 68,
    effectiveDate: '2024-06-10',
    expiryDate: '2026-08-30',
    dpaSigned: true,
    sccVerified: false,
    aiActClause: false,
    smartContractHash: '0x12b7...39c1',
    keyGaps: ['Missing Supplementary Transfer Impact Assessment (TIA)', 'Unclear 72h Subprocessor Breach Notice']
  },
  {
    id: 'CTR-2026-8803',
    title: 'LLM Model Fine-Tuning & Data Residency SLA',
    party: 'Anthropic PBC (EU Enclave)',
    category: 'AI License SLA',
    jurisdiction: 'EU-WEST-1 (Dublin)',
    status: 'Compliant',
    riskScore: 12,
    effectiveDate: '2025-03-01',
    expiryDate: '2026-12-31',
    dpaSigned: true,
    sccVerified: true,
    aiActClause: true,
    smartContractHash: '0x88c0...f21d',
    keyGaps: []
  },
  {
    id: 'CTR-2026-8804',
    title: 'Customer Support CRM Subprocessor Contract',
    party: 'Zendesk International Ltd (Ireland)',
    category: 'Subprocessor',
    jurisdiction: 'EU-CENTRAL-1',
    status: 'Expiring Soon',
    riskScore: 42,
    effectiveDate: '2024-08-01',
    expiryDate: '2026-08-15',
    dpaSigned: true,
    sccVerified: true,
    aiActClause: false,
    smartContractHash: '0x33e9...01a4',
    keyGaps: ['Contract Renewal Pending Signature', 'Missing AI Act Article 12 Log Retention Clause']
  },
  {
    id: 'CTR-2026-8805',
    title: 'Third-Party Fraud Detection API Data Transfer',
    party: 'Sift Science Inc. (US)',
    category: 'EU-US Transfer',
    jurisdiction: 'US / Multi-Region',
    status: 'Non-Compliant',
    riskScore: 89,
    effectiveDate: '2023-11-20',
    expiryDate: '2026-11-20',
    dpaSigned: false,
    sccVerified: false,
    aiActClause: false,
    keyGaps: ['No Signed DPA on file (GDPR Art. 28 violation)', 'Transfers EU resident PII without SCC Module 2', 'Indemnity cap exceeds regulatory fine ceiling']
  }
];

export const ContractCompliance: React.FC = () => {
  const { showToast } = useNotification();
  const [activeTab, setActiveTab] = useState<'overview' | 'scanner' | 'generator' | 'scc' | 'repository'>('overview');
  const [contracts, setContracts] = useState<ContractItem[]>(INITIAL_CONTRACTS);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [categoryFilter, setCategoryFilter] = useState<string>('all');

  // Scanner state
  const [contractText, setContractText] = useState<string>(`DATA PROCESSING AGREEMENT (DPA)
This Data Processing Agreement ("DPA") is entered into by and between Enterprise Client ("Controller") and External SaaS Vendor ("Processor").

SECTION 1: PROCESSING OF PERSONAL DATA
1.1 Processor shall process Personal Data on behalf of Controller strictly in accordance with documented instructions.
1.2 Data will be hosted in secondary cloud facilities located in North America and EU.

SECTION 2: CONFIDENTIALITY & AUDITS
2.1 Processor staff shall be bound by confidentiality obligations.
2.2 Controller may request security audits once every 24 months, subject to 60 days advance written notice and a maximum audit fee of €10,000.

SECTION 3: SUB-PROCESSORS & TRANSFERS
3.1 Processor may engage third-party sub-processors without prior notification.
3.2 International transfers to third countries shall rely on Processor's general corporate safety policies.`);

  const [isScanning, setIsScanning] = useState(false);
  const [scanResults, setScanResults] = useState<{
    overallScore: number;
    gdprArt28Compliant: boolean;
    sccModule2Valid: boolean;
    aiActLiabilityValid: boolean;
    auditRightsValid: boolean;
    breachNotificationHours: number;
    findings: Array<{
      clause: string;
      risk: 'High' | 'Medium' | 'Low';
      issue: string;
      recommendation: string;
    }>;
  } | null>(null);

  // Template Generator state
  const [genController, setGenController] = useState('EuroShield Enterprise B.V.');
  const [genProcessor, setGenProcessor] = useState('Cloud Hosting Global GmbH');
  const [genJurisdiction, setGenJurisdiction] = useState('EU-CENTRAL-1 (Frankfurt)');
  const [genType, setGenType] = useState<'DPA' | 'SCC' | 'AI_SLA'>('DPA');
  const [generatedDoc, setGeneratedDoc] = useState<string>('');
  const [isCopied, setIsCopied] = useState(false);

  // Filtered contracts
  const filteredContracts = contracts.filter((c) => {
    const matchesSearch =
      c.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      c.party.toLowerCase().includes(searchTerm.toLowerCase()) ||
      c.id.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus = statusFilter === 'all' || c.status === statusFilter;
    const matchesCategory = categoryFilter === 'all' || c.category === categoryFilter;
    return matchesSearch && matchesStatus && matchesCategory;
  });

  const compliantCount = contracts.filter((c) => c.status === 'Compliant').length;
  const nonCompliantCount = contracts.filter((c) => c.status === 'Non-Compliant' || c.status === 'Missing Clauses').length;
  const avgRiskScore = Math.round(contracts.reduce((acc, c) => acc + c.riskScore, 0) / contracts.length);

  // Run AI Contract Scanner
  const handleRunScan = () => {
    setIsScanning(true);
    setScanResults(null);

    setTimeout(() => {
      setIsScanning(false);
      setScanResults({
        overallScore: 62,
        gdprArt28Compliant: false,
        sccModule2Valid: false,
        aiActLiabilityValid: false,
        auditRightsValid: false,
        breachNotificationHours: 0,
        findings: [
          {
            clause: '3.1 Sub-processor Engagement',
            risk: 'High',
            issue: 'Engaging sub-processors without prior written notice/objection rights violates GDPR Article 28(2).',
            recommendation: 'Replace with: "Processor shall notify Controller 30 days prior to engaging any new sub-processor with Controller right to object."'
          },
          {
            clause: '3.2 International Data Transfers',
            risk: 'High',
            issue: 'General corporate safety policies do NOT satisfy GDPR Chapter V for US/third country transfers.',
            recommendation: 'Incorporate Standard Contractual Clauses (SCC Module 2 / Controller-to-Processor) and attach Transfer Impact Assessment (TIA).'
          },
          {
            clause: '2.2 Controller Audit Rights',
            risk: 'Medium',
            issue: 'Limiting audits to once every 24 months with a €10,000 fee severely restricts Article 28(3)(h) mandatory audit rights.',
            recommendation: 'Ensure annual audit rights or upon reasonable security suspicion without arbitrary financial penalties.'
          },
          {
            clause: 'Missing Incident Notification',
            risk: 'High',
            issue: 'No explicit 72-hour or immediate personal data breach notification clause found.',
            recommendation: 'Add Section: "Processor shall notify Controller without undue delay and at latest within 24 hours of confirming a security incident."'
          }
        ]
      });
      showToast('Contract scan complete. 4 compliance gaps identified.', 'info');
    }, 1200);
  };

  // Generate Document
  const handleGenerateDocument = () => {
    let text = '';
    if (genType === 'DPA') {
      text = `STANDARD DATA PROCESSING AGREEMENT (DPA)
Pursuant to Article 28 of the General Data Protection Regulation (EU 2016/679)

BETWEEN:
Data Controller: ${genController}
Data Processor: ${genProcessor}
Primary Execution Enclave: ${genJurisdiction}

1. PURPOSE AND SCOPE OF PROCESSING
1.1 The Processor shall process personal data solely on documented instructions from the Controller, including with regard to transfers of personal data to a third country or an international organization.
1.2 Primary processing shall take place exclusively within ${genJurisdiction}. Any failover must comply strictly with EU data sovereignty standards.

2. SUB-PROCESSOR APPROVAL & NOTIFICATIONS
2.1 The Processor shall not engage another processor ("Sub-processor") without prior specific or general written authorization of the Controller.
2.2 In the case of general written authorization, the Processor shall inform the Controller of any intended changes concerning the addition or replacement of other processors at least 30 calendar days in advance.

3. SECURITY MEASURES & BREACH NOTIFICATION
3.1 Taking into account the state of the art, the Processor shall implement Post-Quantum Encryption (Kyber-768/AES-256-GCM) at rest and in transit.
3.2 In the event of a personal data breach, the Processor shall notify the Controller within 24 hours of becoming aware of the breach.

4. AUDIT & INSPECTION RIGHTS
4.1 The Processor shall make available to the Controller all information necessary to demonstrate compliance with Article 28 and allow for and contribute to audits, including inspections, conducted by the Controller or an independent auditor.

5. DATA DESTRUCTION & RETURN
5.1 Upon completion of processing services, the Processor shall, at the choice of the Controller, delete or return all personal data within 14 days and certify zero residual storage copies.

IN WITNESS WHEREOF, the parties have executed this DPA under EU Law.
Signed electronically via Cryptographic Smart Contract Ledger.`;
    } else if (genType === 'SCC') {
      text = `STANDARD CONTRACTUAL CLAUSES (SCC) - MODULE 2 (C2P)
For the Transfer of Personal Data to Third Countries pursuant to EU Regulation 2016/679

EXPORTING ORGANIZATION (Controller): ${genController}
IMPORTING ORGANIZATION (Processor): ${genProcessor}
Target Residency Zone: ${genJurisdiction}

SECTION I - CLAUSE 1: CLAUSE ENFORCEABILITY
These Clauses set out appropriate safeguards, including enforceable data subject rights and effective legal remedies, pursuant to Article 46(1) and Article 46(2)(c) of Regulation (EU) 2016/679.

SECTION II - CLAUSE 8: DATA PROTECTION SAFEGUARDS
8.1 Instructions: The data importer shall process personal data only on documented instructions from the data exporter.
8.2 Purpose Limitation: The data importer shall process personal data only for the specific purpose(s) of the transfer.
8.3 Supplementary Technical Measures: End-to-end PQC envelope encryption is enforced. No foreign government surveillance backdoors are permitted.

SECTION III - CLAUSE 14: LOCAL LAWS AND PRACTICES
The parties warrant that they have no reason to believe that the laws and practices in the third country of destination prevent the data importer from fulfilling its obligations under these Clauses (Transfer Impact Assessment validated).

Governing Law: Courts of Ireland / Luxembourg.`;
    } else {
      text = `EU AI ACT COMPLIANCE & LIABILITY ALLOCATION SLA
Pursuant to Regulation (EU) 2024/1689 (EU AI Act) for High-Risk & Generative AI Systems

PROVIDER / CONTROLLER: ${genController}
DEPLOYER / SUBCONTRACTOR: ${genProcessor}
Primary Enclave: ${genJurisdiction}

1. SYSTEM CLASSIFICATION & RISK MANAGEMENT
1.1 Provider certifies that the AI model architecture undergoes continuous automated bias, safety, and robustness evaluations under Article 9.
1.2 High-Risk AI systems shall maintain continuous event logging for a minimum of 6 months pursuant to Article 12.

2. TRANSPARENCY & SYNTHETIC CONTENT MARKING
2.1 All generated outputs, synthetic text, and media must be cryptographically watermarked in compliance with Article 50.
2.2 Deployer shall ensure human oversight mechanisms (Article 14) are configured prior to model invocation.

3. INDEMNIFICATION & REGULATORY PENALTY ESCROW
3.1 Non-compliance fines issued by national AI Market Surveillance Authorities due to Provider model defect shall be fully indemnified by Provider up to €35,000,000 or 7% of annual worldwide turnover.
3.2 Automated smart contract escrow shall lock regulatory penalty reserves upon verified safety threshold breach.`;
    }

    setGeneratedDoc(text);
    showToast('Contract agreement template generated successfully.', 'success');
  };

  const handleCopyDoc = () => {
    if (!generatedDoc) return;
    navigator.clipboard.writeText(generatedDoc);
    setIsCopied(true);
    showToast('Document copied to clipboard!', 'info');
    setTimeout(() => setIsCopied(false), 2000);
  };

  const handleExportPDF = () => {
    const headers = ['Contract ID', 'Title', 'Counterparty', 'Category', 'Jurisdiction', 'Status', 'Risk Score', 'DPA', 'SCC'];
    const rows = filteredContracts.map((c) => [
      c.id,
      c.title,
      c.party,
      c.category,
      c.jurisdiction,
      c.status,
      `${c.riskScore}/100`,
      c.dpaSigned ? 'Yes' : 'No',
      c.sccVerified ? 'Yes' : 'No'
    ]);
    generatePdfExport('EuroPrivacy Contract Compliance & DPA Audit Ledger', headers, rows, 'contract-compliance-report');
    showToast('Contract Compliance PDF exported successfully.', 'success');
  };

  return (
    <div className="min-h-screen bg-slate-50/50 p-4 md:p-8 space-y-5 sm:space-y-8">
      {/* Page Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-slate-200 pb-6">
        <div>
          <div className="flex items-center gap-2 text-xs font-bold text-indigo-600 uppercase tracking-widest mb-1 font-mono">
            <Scale className="w-4 h-4" />
            Legal & Regulatory Contract Compliance Hub
          </div>
          <h1 className="text-2xl md:text-3xl font-black text-slate-900 tracking-tight">
            Contract & DPA Compliance Engine
          </h1>
          <p className="text-sm text-slate-500 mt-1 max-w-3xl">
            Automate GDPR Article 28 DPAs, Standard Contractual Clauses (SCCs), AI Act SLAs, vendor liability caps, and smart contract escrow validations across all enterprise vendors and processors.
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          <button
            onClick={handleExportPDF}
            className="px-4 py-2 bg-slate-900 hover:bg-slate-800 text-white rounded-xl text-xs font-bold transition-all shadow-sm flex items-center gap-2 cursor-pointer"
          >
            <Download className="w-4 h-4" />
            Export Audit Report
          </button>
          <button
            onClick={() => setActiveTab('generator')}
            className="px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl text-xs font-bold transition-all shadow-sm flex items-center gap-2 cursor-pointer"
          >
            <Plus className="w-4 h-4" />
            New DPA / Contract
          </button>
        </div>
      </div>

      {/* KPI Stats Row */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-3xs flex items-center justify-between">
          <div>
            <p className="text-xs font-bold text-slate-500 uppercase tracking-wider">Monitored Contracts</p>
            <p className="text-2xl font-black text-slate-900 mt-1">{contracts.length}</p>
            <span className="text-[11px] text-slate-500 font-medium">100% Active in Vault</span>
          </div>
          <div className="p-3 bg-indigo-50 border border-indigo-100 text-indigo-600 rounded-xl">
            <FileText className="w-6 h-6" />
          </div>
        </div>

        <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-3xs flex items-center justify-between">
          <div>
            <p className="text-xs font-bold text-slate-500 uppercase tracking-wider">Art. 28 Compliant</p>
            <p className="text-2xl font-black text-emerald-600 mt-1">{compliantCount} / {contracts.length}</p>
            <span className="text-[11px] text-emerald-600 font-semibold">{Math.round((compliantCount / contracts.length) * 100)}% Pass Rate</span>
          </div>
          <div className="p-3 bg-emerald-50 border border-emerald-100 text-emerald-600 rounded-xl">
            <ShieldCheck className="w-6 h-6" />
          </div>
        </div>

        <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-3xs flex items-center justify-between">
          <div>
            <p className="text-xs font-bold text-slate-500 uppercase tracking-wider">Contract Gaps / Risks</p>
            <p className="text-2xl font-black text-rose-600 mt-1">{nonCompliantCount}</p>
            <span className="text-[11px] text-rose-600 font-semibold">Requires Remediation</span>
          </div>
          <div className="p-3 bg-rose-50 border border-rose-100 text-rose-600 rounded-xl">
            <ShieldAlert className="w-6 h-6" />
          </div>
        </div>

        <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-3xs flex items-center justify-between">
          <div>
            <p className="text-xs font-bold text-slate-500 uppercase tracking-wider">Average Risk Score</p>
            <p className="text-2xl font-black text-slate-900 mt-1">{avgRiskScore} <span className="text-xs text-slate-400 font-normal">/ 100</span></p>
            <span className="text-[11px] text-indigo-600 font-semibold">Low Enterprise Risk</span>
          </div>
          <div className="p-3 bg-amber-50 border border-amber-100 text-amber-600 rounded-xl">
            <Cpu className="w-6 h-6" />
          </div>
        </div>
      </div>

      {/* Navigation Tabs */}
      <div className="flex border-b border-slate-200 overflow-x-auto gap-2 text-sm font-bold">
        <button
          onClick={() => setActiveTab('overview')}
          className={`pb-3 px-4 flex items-center gap-2 border-b-2 transition-colors cursor-pointer whitespace-nowrap ${
            activeTab === 'overview'
              ? 'border-indigo-600 text-indigo-600 font-bold'
              : 'border-transparent text-slate-500 hover:text-slate-800'
          }`}
        >
          <Layers className="w-4 h-4" />
          Overview & Audit Summary
        </button>
        <button
          onClick={() => setActiveTab('scanner')}
          className={`pb-3 px-4 flex items-center gap-2 border-b-2 transition-colors cursor-pointer whitespace-nowrap ${
            activeTab === 'scanner'
              ? 'border-indigo-600 text-indigo-600 font-bold'
              : 'border-transparent text-slate-500 hover:text-slate-800'
          }`}
        >
          <Sparkles className="w-4 h-4 text-indigo-600" />
          AI Clause Inspector & Scanner
        </button>
        <button
          onClick={() => setActiveTab('generator')}
          className={`pb-3 px-4 flex items-center gap-2 border-b-2 transition-colors cursor-pointer whitespace-nowrap ${
            activeTab === 'generator'
              ? 'border-indigo-600 text-indigo-600 font-bold'
              : 'border-transparent text-slate-500 hover:text-slate-800'
          }`}
        >
          <FileSignature className="w-4 h-4" />
          DPA & SCC Generator
        </button>
        <button
          onClick={() => setActiveTab('scc')}
          className={`pb-3 px-4 flex items-center gap-2 border-b-2 transition-colors cursor-pointer whitespace-nowrap ${
            activeTab === 'scc'
              ? 'border-indigo-600 text-indigo-600 font-bold'
              : 'border-transparent text-slate-500 hover:text-slate-800'
          }`}
        >
          <Globe className="w-4 h-4" />
          Cross-Border SCC & TIA
        </button>
        <button
          onClick={() => setActiveTab('repository')}
          className={`pb-3 px-4 flex items-center gap-2 border-b-2 transition-colors cursor-pointer whitespace-nowrap ${
            activeTab === 'repository'
              ? 'border-indigo-600 text-indigo-600 font-bold'
              : 'border-transparent text-slate-500 hover:text-slate-800'
          }`}
        >
          <FileText className="w-4 h-4" />
          Contract Repository ({filteredContracts.length})
        </button>
      </div>

      {/* TAB 1: OVERVIEW */}
      {activeTab === 'overview' && (
        <div className="space-y-4 sm:space-y-6">
          {/* Executive Overview Banner */}
          <div className="bg-gradient-to-r from-slate-900 via-indigo-950 to-slate-900 text-white p-4 sm:p-5 lg:p-6 rounded-2xl shadow-md border border-slate-800 space-y-4">
            <div className="flex items-center justify-between">
              <div className="inline-flex items-center gap-2 px-3 py-1 bg-indigo-500/20 border border-indigo-400/30 rounded-full text-indigo-300 text-xs font-bold font-mono">
                <ShieldCheck className="w-3.5 h-3.5" />
                GDPR ART. 28 & EU AI ACT COMPLIANT
              </div>
              <span className="text-xs text-slate-400 font-mono">Last Synchronized: Real-Time</span>
            </div>
            <div>
              <h2 className="text-xl font-bold text-white">Continuous Legal Contract Surveillance</h2>
              <p className="text-xs text-slate-300 mt-1 max-w-2xl leading-relaxed">
                EuroPrivacy Engine continuously validates vendor Data Processing Agreements (DPAs), Standard Contractual Clauses (SCCs), and Subprocessor terms. Any contract gap triggers automatic risk flags and deploys smart contract escrow controls.
              </p>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 pt-2 border-t border-slate-800/80">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-emerald-500/10 border border-emerald-500/20 rounded-lg text-emerald-400">
                  <CheckCircle2 className="w-5 h-5" />
                </div>
                <div>
                  <p className="text-xs font-bold text-slate-200">SCC Module 2 Validation</p>
                  <p className="text-[11px] text-slate-400">80% Verified across third-country transfers</p>
                </div>
              </div>
              <div className="flex items-center gap-3">
                <div className="p-2 bg-indigo-500/10 border border-indigo-500/20 rounded-lg text-indigo-400">
                  <Zap className="w-5 h-5" />
                </div>
                <div>
                  <p className="text-xs font-bold text-slate-200">AI Act Article 12 Log SLAs</p>
                  <p className="text-[11px] text-slate-400">2 LLM vendor SLAs active</p>
                </div>
              </div>
              <div className="flex items-center gap-3">
                <div className="p-2 bg-amber-500/10 border border-amber-500/20 rounded-lg text-amber-400">
                  <Clock className="w-5 h-5" />
                </div>
                <div>
                  <p className="text-xs font-bold text-slate-200">Impending Renewals</p>
                  <p className="text-[11px] text-slate-400">1 contract expiring within 30 days</p>
                </div>
              </div>
            </div>
          </div>

          {/* Critical Attention Required Cards */}
          <div className="bg-white p-4 sm:p-5 lg:p-6 rounded-2xl border border-slate-200 shadow-3xs space-y-4">
            <h3 className="text-base font-bold text-slate-900 flex items-center gap-2">
              <AlertTriangle className="w-5 h-5 text-amber-500" />
              Contracts Requiring Immediate Legal Action
            </h3>
            <div className="divide-y divide-slate-100">
              {contracts
                .filter((c) => c.status === 'Non-Compliant' || c.status === 'Missing Clauses')
                .map((contract) => (
                  <div key={contract.id} className="py-4 flex flex-col md:flex-row md:items-center justify-between gap-4">
                    <div className="space-y-1">
                      <div className="flex items-center gap-2">
                        <span className="font-mono text-xs font-bold text-slate-400">{contract.id}</span>
                        <span className="font-bold text-slate-900 text-sm">{contract.title}</span>
                        <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-rose-100 text-rose-700 border border-rose-200">
                          {contract.status}
                        </span>
                      </div>
                      <p className="text-xs text-slate-500">
                        Party: <strong className="text-slate-700">{contract.party}</strong> | Category: {contract.category} | Jurisdiction: {contract.jurisdiction}
                      </p>
                      <div className="flex flex-wrap gap-1 mt-2">
                        {contract.keyGaps.map((gap, i) => (
                          <span key={i} className="text-[10px] bg-amber-50 text-amber-800 border border-amber-200 px-2 py-0.5 rounded font-medium">
                            • {gap}
                          </span>
                        ))}
                      </div>
                    </div>
                    <button
                      onClick={() => {
                        setContractText(`CONTRACT ID: ${contract.id}\nTITLE: ${contract.title}\nPARTY: ${contract.party}\n\nPaste contract clause text here to run AI inspection...`);
                        setActiveTab('scanner');
                      }}
                      className="px-3 py-1.5 bg-indigo-50 hover:bg-indigo-100 text-indigo-700 border border-indigo-200 rounded-lg text-xs font-bold transition-colors cursor-pointer flex items-center gap-1.5 whitespace-nowrap self-start md:self-center"
                    >
                      <Sparkles className="w-3.5 h-3.5" />
                      Scan & Fix Clauses
                    </button>
                  </div>
                ))}
            </div>
          </div>

          {/* Regulatory Requirements Grid */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 sm:gap-6">
            <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-3xs space-y-3">
              <div className="flex items-center gap-2 text-indigo-600 font-bold text-sm">
                <BookOpen className="w-4 h-4" />
                GDPR Article 28 Mandatory Terms
              </div>
              <p className="text-xs text-slate-500">
                Data processors must execute binding contracts containing technical security guarantees, audit rights, subprocessor consent, and breach notification terms.
              </p>
              <ul className="text-xs space-y-2 text-slate-600">
                <li className="flex items-start gap-2">
                  <CheckCircle2 className="w-4 h-4 text-emerald-600 flex-shrink-0 mt-0.5" />
                  <span>Processing solely on documented Controller instructions</span>
                </li>
                <li className="flex items-start gap-2">
                  <CheckCircle2 className="w-4 h-4 text-emerald-600 flex-shrink-0 mt-0.5" />
                  <span>Mandatory confidentiality & security measures</span>
                </li>
                <li className="flex items-start gap-2">
                  <CheckCircle2 className="w-4 h-4 text-emerald-600 flex-shrink-0 mt-0.5" />
                  <span>Assisting Controller in Data Protection Impact Assessments (DPIAs)</span>
                </li>
              </ul>
            </div>

            <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-3xs space-y-3">
              <div className="flex items-center gap-2 text-indigo-600 font-bold text-sm">
                <Globe className="w-4 h-4" />
                EU Standard Contractual Clauses (SCCs)
              </div>
              <p className="text-xs text-slate-500">
                Required for transfers of EU PII to non-adequate third countries (e.g. US, India) along with supplementary Transfer Impact Assessments (TIAs).
              </p>
              <ul className="text-xs space-y-2 text-slate-600">
                <li className="flex items-start gap-2">
                  <CheckCircle2 className="w-4 h-4 text-emerald-600 flex-shrink-0 mt-0.5" />
                  <span>Module 1: Controller-to-Controller (C2C)</span>
                </li>
                <li className="flex items-start gap-2">
                  <CheckCircle2 className="w-4 h-4 text-emerald-600 flex-shrink-0 mt-0.5" />
                  <span>Module 2: Controller-to-Processor (C2P)</span>
                </li>
                <li className="flex items-start gap-2">
                  <CheckCircle2 className="w-4 h-4 text-emerald-600 flex-shrink-0 mt-0.5" />
                  <span>TIA Validation against foreign surveillance laws</span>
                </li>
              </ul>
            </div>

            <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-3xs space-y-3">
              <div className="flex items-center gap-2 text-indigo-600 font-bold text-sm">
                <Zap className="w-4 h-4" />
                EU AI Act Provider & Deployer SLAs
              </div>
              <p className="text-xs text-slate-500">
                Articles 12, 14, and 50 mandate contractual allocation of liability, event logging, model transparency, and algorithmic bias audit rights.
              </p>
              <ul className="text-xs space-y-2 text-slate-600">
                <li className="flex items-start gap-2">
                  <CheckCircle2 className="w-4 h-4 text-emerald-600 flex-shrink-0 mt-0.5" />
                  <span>6-Month mandatory technical log retention</span>
                </li>
                <li className="flex items-start gap-2">
                  <CheckCircle2 className="w-4 h-4 text-emerald-600 flex-shrink-0 mt-0.5" />
                  <span>Synthetic content cryptographic marking clause</span>
                </li>
                <li className="flex items-start gap-2">
                  <CheckCircle2 className="w-4 h-4 text-emerald-600 flex-shrink-0 mt-0.5" />
                  <span>Regulatory penalty escrow & indemnity caps</span>
                </li>
              </ul>
            </div>
          </div>
        </div>
      )}

      {/* TAB 2: AI CLAUSE INSPECTOR & SCANNER */}
      {activeTab === 'scanner' && (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-4 sm:gap-6">
          <div className="lg:col-span-6 bg-white p-4 sm:p-5 lg:p-6 rounded-2xl border border-slate-200 shadow-3xs space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="text-base font-bold text-slate-900 flex items-center gap-2">
                <Sparkles className="w-5 h-5 text-indigo-600" />
                Contract Text & Clause Auditor
              </h3>
              <span className="text-xs text-slate-400">Paste DPA or Vendor Agreement</span>
            </div>

            <textarea
              rows={14}
              value={contractText}
              onChange={(e) => setContractText(e.target.value)}
              className="w-full p-4 border border-slate-200 rounded-xl font-mono text-xs focus:ring-2 focus:ring-indigo-500 focus:outline-none bg-slate-50/50"
              placeholder="Paste contract text, DPA clauses, or vendor terms here..."
            />

            <button
              onClick={handleRunScan}
              disabled={isScanning || !contractText.trim()}
              className="w-full py-3 bg-indigo-600 hover:bg-indigo-700 text-white font-bold rounded-xl text-sm transition-all shadow-sm flex items-center justify-center gap-2 disabled:opacity-50 cursor-pointer"
            >
              {isScanning ? (
                <>
                  <RefreshCw className="w-4 h-4 animate-spin" />
                  Analyzing Legal Clauses against EU Regulatory Frameworks...
                </>
              ) : (
                <>
                  <Sparkles className="w-4 h-4" />
                  Execute AI Compliance Audit
                </>
              )}
            </button>
          </div>

          <div className="lg:col-span-6 bg-white p-4 sm:p-5 lg:p-6 rounded-2xl border border-slate-200 shadow-3xs space-y-4 sm:space-y-6">
            <h3 className="text-base font-bold text-slate-900 flex items-center gap-2">
              <ShieldCheck className="w-5 h-5 text-indigo-600" />
              Compliance Audit Findings
            </h3>

            {!scanResults && !isScanning && (
              <div className="p-12 text-center text-slate-400 space-y-3">
                <FileCheck className="w-12 h-12 mx-auto text-slate-300" />
                <p className="text-sm font-semibold">No Contract Analyzed Yet</p>
                <p className="text-xs max-w-sm mx-auto">
                  Paste vendor contract text on the left and click "Execute AI Compliance Audit" to detect GDPR Art. 28 gaps, SCC deficiencies, and liability limits.
                </p>
              </div>
            )}

            {scanResults && (
              <div className="space-y-4 sm:space-y-6">
                {/* Score Header */}
                <div className="flex items-center justify-between p-4 bg-slate-50 rounded-xl border border-slate-200">
                  <div>
                    <p className="text-xs font-bold text-slate-500 uppercase">Overall Compliance Score</p>
                    <p className="text-3xl font-black text-amber-600">{scanResults.overallScore} <span className="text-sm font-normal text-slate-400">/ 100</span></p>
                  </div>
                  <div className="text-right">
                    <span className="px-3 py-1 bg-amber-100 text-amber-800 text-xs font-bold rounded-full border border-amber-200">
                      Action Required
                    </span>
                    <p className="text-[11px] text-slate-500 mt-1">4 Deficiencies Detected</p>
                  </div>
                </div>

                {/* Key Checklist */}
                <div className="grid grid-cols-2 gap-3 text-xs">
                  <div className={`p-3 rounded-lg border ${scanResults.gdprArt28Compliant ? 'bg-emerald-50 border-emerald-200 text-emerald-800' : 'bg-rose-50 border-rose-200 text-rose-800'}`}>
                    <p className="font-bold flex items-center gap-1.5">
                      {scanResults.gdprArt28Compliant ? <Check className="w-4 h-4" /> : <XCircle className="w-4 h-4" />}
                      GDPR Art. 28 Terms
                    </p>
                  </div>
                  <div className={`p-3 rounded-lg border ${scanResults.sccModule2Valid ? 'bg-emerald-50 border-emerald-200 text-emerald-800' : 'bg-rose-50 border-rose-200 text-rose-800'}`}>
                    <p className="font-bold flex items-center gap-1.5">
                      {scanResults.sccModule2Valid ? <Check className="w-4 h-4" /> : <XCircle className="w-4 h-4" />}
                      SCC Module 2 Valid
                    </p>
                  </div>
                </div>

                {/* Detailed Findings */}
                <div className="space-y-3">
                  <p className="text-xs font-bold text-slate-700 uppercase tracking-wider">Identified Clause Risks</p>
                  <div className="space-y-3">
                    {scanResults.findings.map((item, idx) => (
                      <div key={idx} className="p-4 bg-slate-50 border border-slate-200 rounded-xl space-y-2">
                        <div className="flex items-center justify-between">
                          <span className="font-bold text-xs text-slate-900">{item.clause}</span>
                          <span className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                            item.risk === 'High' ? 'bg-rose-100 text-rose-700' : 'bg-amber-100 text-amber-700'
                          }`}>
                            {item.risk} Risk
                          </span>
                        </div>
                        <p className="text-xs text-rose-600 font-medium">• {item.issue}</p>
                        <div className="p-2.5 bg-emerald-50/80 border border-emerald-200/60 rounded-lg text-xs text-emerald-900">
                          <strong className="block text-[10px] uppercase font-bold text-emerald-700 mb-0.5">Recommended Wording:</strong>
                          {item.recommendation}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      )}

      {/* TAB 3: DPA & SCC TEMPLATE GENERATOR */}
      {activeTab === 'generator' && (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-4 sm:gap-6">
          <div className="lg:col-span-5 bg-white p-4 sm:p-5 lg:p-6 rounded-2xl border border-slate-200 shadow-3xs space-y-5">
            <h3 className="text-base font-bold text-slate-900 flex items-center gap-2">
              <FileSignature className="w-5 h-5 text-indigo-600" />
              Automated Contract Agreement Builder
            </h3>

            <div className="space-y-4 text-xs">
              <div>
                <label className="block font-bold text-slate-700 mb-1">Select Agreement Type</label>
                <div className="grid grid-cols-3 gap-2">
                  <button
                    onClick={() => setGenType('DPA')}
                    className={`p-2.5 rounded-xl border font-bold text-center cursor-pointer ${
                      genType === 'DPA' ? 'bg-indigo-50 border-indigo-200 text-indigo-700' : 'bg-slate-50 border-slate-200 text-slate-600'
                    }`}
                  >
                    GDPR DPA
                  </button>
                  <button
                    onClick={() => setGenType('SCC')}
                    className={`p-2.5 rounded-xl border font-bold text-center cursor-pointer ${
                      genType === 'SCC' ? 'bg-indigo-50 border-indigo-200 text-indigo-700' : 'bg-slate-50 border-slate-200 text-slate-600'
                    }`}
                  >
                    SCC Module 2
                  </button>
                  <button
                    onClick={() => setGenType('AI_SLA')}
                    className={`p-2.5 rounded-xl border font-bold text-center cursor-pointer ${
                      genType === 'AI_SLA' ? 'bg-indigo-50 border-indigo-200 text-indigo-700' : 'bg-slate-50 border-slate-200 text-slate-600'
                    }`}
                  >
                    AI Act SLA
                  </button>
                </div>
              </div>

              <div>
                <label className="block font-bold text-slate-700 mb-1">Data Controller / Exporter Enterprise</label>
                <input
                  type="text"
                  value={genController}
                  onChange={(e) => setGenController(e.target.value)}
                  className="w-full p-2.5 border border-slate-200 rounded-lg focus:ring-1 focus:ring-indigo-500 focus:outline-none"
                />
              </div>

              <div>
                <label className="block font-bold text-slate-700 mb-1">Data Processor / Importer Enterprise</label>
                <input
                  type="text"
                  value={genProcessor}
                  onChange={(e) => setGenProcessor(e.target.value)}
                  className="w-full p-2.5 border border-slate-200 rounded-lg focus:ring-1 focus:ring-indigo-500 focus:outline-none"
                />
              </div>

              <div>
                <label className="block font-bold text-slate-700 mb-1">Primary Sovereign Enclave / Jurisdiction</label>
                <select
                  value={genJurisdiction}
                  onChange={(e) => setGenJurisdiction(e.target.value)}
                  className="w-full p-2.5 border border-slate-200 rounded-lg focus:ring-1 focus:ring-indigo-500 focus:outline-none bg-white"
                >
                  <option value="EU-CENTRAL-1 (Frankfurt)">EU-CENTRAL-1 (Frankfurt)</option>
                  <option value="EU-WEST-1 (Ireland)">EU-WEST-1 (Ireland)</option>
                  <option value="EU-WEST-3 (Paris)">EU-WEST-3 (Paris)</option>
                  <option value="US-EAST-1 (Northern Virginia with SCC)">US-EAST-1 (Northern Virginia with SCC)</option>
                </select>
              </div>

              <button
                onClick={handleGenerateDocument}
                className="w-full py-3 bg-indigo-600 hover:bg-indigo-700 text-white font-bold rounded-xl text-sm transition-all shadow-sm flex items-center justify-center gap-2 cursor-pointer mt-2"
              >
                <Sparkles className="w-4 h-4" />
                Generate Legally Binding Draft
              </button>
            </div>
          </div>

          <div className="lg:col-span-7 bg-white p-4 sm:p-5 lg:p-6 rounded-2xl border border-slate-200 shadow-3xs space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="text-base font-bold text-slate-900 flex items-center gap-2">
                <FileText className="w-5 h-5 text-indigo-600" />
                Generated Legal Document
              </h3>
              {generatedDoc && (
                <div className="flex items-center gap-2">
                  <button
                    onClick={handleCopyDoc}
                    className="px-3 py-1.5 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-lg text-xs font-bold transition-colors flex items-center gap-1 cursor-pointer"
                  >
                    {isCopied ? <Check className="w-3.5 h-3.5 text-emerald-600" /> : <Copy className="w-3.5 h-3.5" />}
                    {isCopied ? 'Copied' : 'Copy'}
                  </button>
                </div>
              )}
            </div>

            {!generatedDoc ? (
              <div className="p-16 text-center text-slate-400 space-y-3">
                <FileSignature className="w-12 h-12 mx-auto text-slate-300" />
                <p className="text-sm font-semibold">Document Generator Ready</p>
                <p className="text-xs max-w-sm mx-auto">
                  Configure parties and jurisdiction on the left, then click "Generate Legally Binding Draft" to produce an Article 28 DPA or EU Standard Contractual Clause agreement.
                </p>
              </div>
            ) : (
              <textarea
                rows={16}
                readOnly
                value={generatedDoc}
                className="w-full p-4 border border-slate-200 rounded-xl font-mono text-xs bg-slate-50 text-slate-800 leading-relaxed focus:outline-none"
              />
            )}
          </div>
        </div>
      )}

      {/* TAB 4: CROSS-BORDER SCC & TIA */}
      {activeTab === 'scc' && (
        <div className="space-y-4 sm:space-y-6">
          <div className="bg-white p-4 sm:p-5 lg:p-6 rounded-2xl border border-slate-200 shadow-3xs space-y-4">
            <h3 className="text-base font-bold text-slate-900 flex items-center gap-2">
              <Globe className="w-5 h-5 text-indigo-600" />
              Cross-Border Data Transfer Framework & Module Matrix
            </h3>
            <p className="text-xs text-slate-500">
              Pursuant to the Schrems II ruling and GDPR Chapter V, all third-country data flows must be mapped to specific Standard Contractual Clauses (SCC) modules and supplemented by Transfer Impact Assessments (TIA).
            </p>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 pt-2">
              <div className="p-4 bg-slate-50 rounded-xl border border-slate-200 space-y-2">
                <span className="px-2 py-0.5 rounded bg-indigo-100 text-indigo-700 font-mono text-[10px] font-bold">MODULE 1</span>
                <p className="font-bold text-xs text-slate-900">Controller to Controller (C2C)</p>
                <p className="text-[11px] text-slate-500 leading-normal">
                  Used when data exporter and importer independently determine processing purposes.
                </p>
                <span className="inline-block text-[10px] text-emerald-600 font-bold">2 Active Agreements</span>
              </div>

              <div className="p-4 bg-indigo-50 rounded-xl border border-indigo-200 space-y-2">
                <span className="px-2 py-0.5 rounded bg-indigo-600 text-white font-mono text-[10px] font-bold">MODULE 2</span>
                <p className="font-bold text-xs text-indigo-900">Controller to Processor (C2P)</p>
                <p className="text-[11px] text-indigo-700 leading-normal">
                  Standard SaaS cloud hosting transfers (e.g., US SaaS subprocessor processing EU resident PII).
                </p>
                <span className="inline-block text-[10px] text-indigo-800 font-bold">5 Active Agreements</span>
              </div>

              <div className="p-4 bg-slate-50 rounded-xl border border-slate-200 space-y-2">
                <span className="px-2 py-0.5 rounded bg-indigo-100 text-indigo-700 font-mono text-[10px] font-bold">MODULE 3</span>
                <p className="font-bold text-xs text-slate-900">Processor to Processor (P2P)</p>
                <p className="text-[11px] text-slate-500 leading-normal">
                  Subprocessor to secondary downstream data processor transfer arrangements.
                </p>
                <span className="inline-block text-[10px] text-slate-600 font-bold">1 Active Agreement</span>
              </div>

              <div className="p-4 bg-slate-50 rounded-xl border border-slate-200 space-y-2">
                <span className="px-2 py-0.5 rounded bg-indigo-100 text-indigo-700 font-mono text-[10px] font-bold">MODULE 4</span>
                <p className="font-bold text-xs text-slate-900">Processor to Controller (P2C)</p>
                <p className="text-[11px] text-slate-500 leading-normal">
                  EU data processor processing data for a foreign non-EU data controller enterprise.
                </p>
                <span className="inline-block text-[10px] text-slate-600 font-bold">0 Active Agreements</span>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* TAB 5: REPOSITORY & TABLE */}
      {activeTab === 'repository' && (
        <div className="bg-white rounded-2xl border border-slate-200 shadow-3xs overflow-hidden space-y-4 p-4 sm:p-5 lg:p-6">
          {/* Controls Header */}
          <div className="flex flex-col md:flex-row justify-between gap-4">
            <div className="relative flex-1">
              <Search className="w-4 h-4 text-slate-400 absolute left-3 top-3" />
              <input
                type="text"
                placeholder="Search contracts by title, party, or ID..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-9 pr-4 py-2 border border-slate-200 rounded-xl text-xs focus:ring-1 focus:ring-indigo-500 focus:outline-none"
              />
            </div>

            <div className="flex items-center gap-2">
              <select
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value)}
                className="p-2 border border-slate-200 rounded-xl text-xs bg-white text-slate-700 font-medium"
              >
                <option value="all">All Statuses</option>
                <option value="Compliant">Compliant</option>
                <option value="Missing Clauses">Missing Clauses</option>
                <option value="Expiring Soon">Expiring Soon</option>
                <option value="Non-Compliant">Non-Compliant</option>
              </select>

              <select
                value={categoryFilter}
                onChange={(e) => setCategoryFilter(e.target.value)}
                className="p-2 border border-slate-200 rounded-xl text-xs bg-white text-slate-700 font-medium"
              >
                <option value="all">All Categories</option>
                <option value="DPA (Art. 28)">DPA (Art. 28)</option>
                <option value="SCC Module 2 (C2P)">SCC Module 2 (C2P)</option>
                <option value="AI License SLA">AI License SLA</option>
                <option value="Subprocessor">Subprocessor</option>
                <option value="EU-US Transfer">EU-US Transfer</option>
              </select>
            </div>
          </div>

          {/* Table */}
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-50 border-b border-slate-200 text-slate-500 font-bold uppercase tracking-wider font-mono">
                <tr>
                  <th className="p-3">Contract ID & Title</th>
                  <th className="p-3">Counterparty</th>
                  <th className="p-3">Category</th>
                  <th className="p-3">Enclave Zone</th>
                  <th className="p-3">Risk Score</th>
                  <th className="p-3">DPA / SCC</th>
                  <th className="p-3">Status</th>
                  <th className="p-3 text-right">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {filteredContracts.map((c) => (
                  <tr key={c.id} className="hover:bg-slate-50/80 transition-colors">
                    <td className="p-3">
                      <span className="font-mono font-bold text-[10px] text-slate-400 block">{c.id}</span>
                      <span className="font-bold text-slate-900 block">{c.title}</span>
                      {c.smartContractHash && (
                        <span className="inline-flex items-center gap-1 font-mono text-[9px] text-indigo-600 mt-0.5">
                          <Lock className="w-2.5 h-2.5" /> {c.smartContractHash}
                        </span>
                      )}
                    </td>
                    <td className="p-3 font-semibold text-slate-700">{c.party}</td>
                    <td className="p-3">
                      <span className="px-2 py-0.5 rounded bg-slate-100 text-slate-700 font-medium text-[10px]">
                        {c.category}
                      </span>
                    </td>
                    <td className="p-3 text-slate-600 font-mono text-[11px]">{c.jurisdiction}</td>
                    <td className="p-3 font-mono font-bold">
                      <span className={c.riskScore > 50 ? 'text-rose-600' : 'text-emerald-600'}>
                        {c.riskScore} / 100
                      </span>
                    </td>
                    <td className="p-3">
                      <div className="flex items-center gap-1.5">
                        <span className={`px-1.5 py-0.5 rounded text-[10px] font-bold ${c.dpaSigned ? 'bg-emerald-100 text-emerald-800' : 'bg-rose-100 text-rose-800'}`}>
                          DPA: {c.dpaSigned ? '✓' : '✗'}
                        </span>
                        <span className={`px-1.5 py-0.5 rounded text-[10px] font-bold ${c.sccVerified ? 'bg-emerald-100 text-emerald-800' : 'bg-rose-100 text-rose-800'}`}>
                          SCC: {c.sccVerified ? '✓' : '✗'}
                        </span>
                      </div>
                    </td>
                    <td className="p-3">
                      <span className={`px-2.5 py-1 rounded-full text-[10px] font-bold border ${
                        c.status === 'Compliant'
                          ? 'bg-emerald-50 text-emerald-700 border-emerald-200'
                          : c.status === 'Non-Compliant'
                          ? 'bg-rose-50 text-rose-700 border-rose-200'
                          : 'bg-amber-50 text-amber-700 border-amber-200'
                      }`}>
                        {c.status}
                      </span>
                    </td>
                    <td className="p-3 text-right">
                      <button
                        onClick={() => {
                          setContractText(`CONTRACT ID: ${c.id}\nTITLE: ${c.title}\nPARTY: ${c.party}\nJURISDICTION: ${c.jurisdiction}`);
                          setActiveTab('scanner');
                        }}
                        className="p-1.5 hover:bg-slate-100 text-indigo-600 rounded-lg transition-colors cursor-pointer"
                        title="Inspect in Scanner"
                      >
                        <Eye className="w-4 h-4" />
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
};

export default ContractCompliance;
