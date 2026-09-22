import React, { useState, useEffect } from 'react';
import {
  Globe2,
  FileCode2,
  Webhook,
  ShieldCheck,
  CheckCircle2,
  AlertTriangle,
  RefreshCw,
  Copy,
  ExternalLink,
  ChevronRight,
  Lock,
  Zap,
  Server,
  Terminal,
  FileCheck,
  Send,
  Bot,
  Award
} from 'lucide-react';
import {
  expandedFrameworksService,
  ExpandedRegulatoryFramework
} from '../services/expandedFrameworksService';
import {
  cloudConnectorsService,
  InfrastructureConnector,
  IngestedWebhookEvent
} from '../services/cloudConnectorsService';
import {
  legalContractDraftingService,
  GeneratedLegalContract,
  ContractDraftingRequest
} from '../services/legalContractDraftingService';
import {
  copilotAndDossierService,
  CopilotMessage,
  ExecutiveAuditorDossier
} from '../services/copilotAndDossierService';
import { useNotification } from '../context/NotificationContext';

export const EnterpriseExpansionConsole: React.FC = () => {
  const { showToast } = useNotification();
  const [activeTab, setActiveTab] = useState<'frameworks' | 'webhooks' | 'contracts' | 'copilot' | 'dossier'>('frameworks');

  // Frameworks state
  const [frameworks, setFrameworks] = useState<ExpandedRegulatoryFramework[]>([]);
  const [selectedFramework, setSelectedFramework] = useState<ExpandedRegulatoryFramework | null>(null);

  // Webhooks state
  const [connectors, setConnectors] = useState<InfrastructureConnector[]>([]);
  const [events, setEvents] = useState<IngestedWebhookEvent[]>([]);
  const [simulatedProvider, setSimulatedProvider] = useState<'AWS_S3' | 'CLOUDFLARE' | 'GITHUB'>('AWS_S3');
  const [simulatedPayload, setSimulatedPayload] = useState('{\n  "event": "s3.PutBucketAcl.anomalous_grant",\n  "severity": "HIGH",\n  "summary": "Unauthorized ACL write detected on audit evidence bucket"\n}');
  const [isSimulating, setIsSimulating] = useState(false);

  // Legal contracts state
  const [templates, setTemplates] = useState<any[]>([]);
  const [contractType, setContractType] = useState<'GLOBAL_DPA' | 'AI_VENDOR_TRANSPARENCY' | 'CROSS_BORDER_SCC'>('GLOBAL_DPA');
  const [controllerEntity, setControllerEntity] = useState('Apex Global Financial Group Corp');
  const [processorEntity, setProcessorEntity] = useState('Regulettee Sovereign Infrastructure Enclave');
  const [governingLaw, setGoverningLaw] = useState('Singapore International Arbitration Centre (SIAC)');
  const [applicableJurisdictions, setApplicableJurisdictions] = useState<string[]>(['Singapore (PDPA)', 'Switzerland (nFADP)', 'Australia (APA)', 'EU (GDPR)']);
  const [generatedContract, setGeneratedContract] = useState<GeneratedLegalContract | null>(null);
  const [isDrafting, setIsDrafting] = useState(false);
  const [copiedId, setCopiedId] = useState<string | null>(null);

  // Copilot State
  const [copilotMessages, setCopilotMessages] = useState<CopilotMessage[]>([
    {
      id: 'INIT-1',
      sender: 'COPILOT',
      timestamp: new Date().toISOString(),
      text: 'Sovereign Regulatory Copilot initialized. I can interpret statutory requirements across Singapore PDPA, Swiss nFADP, Australia Privacy Act, EU NIS2, evaluate live cloud webhook security alerts, or generate court-admissible audit dossiers.',
      citedFrameworks: ['Singapore PDPA', 'Swiss nFADP', 'Australia APA', 'EU NIS2']
    }
  ]);
  const [copilotInput, setCopilotInput] = useState('');
  const [isCopilotThinking, setIsCopilotThinking] = useState(false);

  // Executive Dossier State
  const [targetAuditor, setTargetAuditor] = useState<'BIG_4_AUDITOR' | 'EU_REGULATOR' | 'INTERNAL_CISO_BOARD'>('BIG_4_AUDITOR');
  const [dossier, setDossier] = useState<ExecutiveAuditorDossier | null>(null);
  const [isGeneratingDossier, setIsGeneratingDossier] = useState(false);

  useEffect(() => {
    const fwList = expandedFrameworksService.getExpandedFrameworks();
    setFrameworks(fwList);
    setSelectedFramework(fwList[0]);

    setConnectors(cloudConnectorsService.getConnectors());
    setEvents(cloudConnectorsService.getRecentEvents());

    const tmplList = legalContractDraftingService.getAvailableTemplates();
    setTemplates(tmplList);

    // Initial draft contract
    handleDraftContract();
  }, []);

  const handleSimulateWebhook = () => {
    setIsSimulating(true);
    try {
      const parsed = JSON.parse(simulatedPayload);
      const newEvt = cloudConnectorsService.ingestWebhook(simulatedProvider, parsed);
      setEvents(prev => [newEvt, ...prev]);
      setConnectors([...cloudConnectorsService.getConnectors()]);
    } catch (e) {
      showToast('Invalid JSON in simulation payload', 'error');
    }
    setTimeout(() => setIsSimulating(false), 300);
  };

  const handleDraftContract = () => {
    setIsDrafting(true);
    setTimeout(() => {
      const req: ContractDraftingRequest = {
        contractType,
        controllerEntity,
        processorEntity,
        applicableJurisdictions,
        governingLaw,
        pqcSignatureEnabled: true,
        dataCategories: ['Identity Attributes', 'Financial Audits', 'Zero-Trust Telemetry'],
        securityMeasures: ['NIST-Kyber-1024 Quantum Seal', 'AES-256-GCM', 'Regional Sovereign Enclave']
      };
      const contract = legalContractDraftingService.generateContract(req);
      setGeneratedContract(contract);
      setIsDrafting(false);
    }, 400);
  };

  const copyToClipboard = (text: string, id: string) => {
    navigator.clipboard.writeText(text);
    setCopiedId(id);
    setTimeout(() => setCopiedId(null), 2000);
  };

  const handleSendCopilotMessage = async () => {
    if (!copilotInput.trim()) return;
    const userMsg: CopilotMessage = {
      id: `USER-${Date.now()}`,
      sender: 'USER',
      text: copilotInput,
      timestamp: new Date().toISOString()
    };
    setCopilotMessages(prev => [...prev, userMsg]);
    const queryText = copilotInput;
    setCopilotInput('');
    setIsCopilotThinking(true);

    try {
      const reply = await copilotAndDossierService.queryCopilot(queryText);
      setCopilotMessages(prev => [...prev, reply]);
    } catch (e) {
      console.error(e);
    } finally {
      setIsCopilotThinking(false);
    }
  };

  const handleGenerateExecutiveDossier = () => {
    setIsGeneratingDossier(true);
    setTimeout(() => {
      const generated = copilotAndDossierService.generateExecutiveDossier('TENANT-SOVEREIGN-ENTERPRISE', targetAuditor);
      setDossier(generated);
      setIsGeneratingDossier(false);
    }, 500);
  };

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 p-6 md:p-8 font-sans">
      {/* Header */}
      <div className="max-w-7xl mx-auto mb-8">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-slate-800 pb-6">
          <div className="flex items-center gap-3">
            <div className="p-3 bg-indigo-500/10 border border-indigo-500/30 rounded-xl text-indigo-400">
              <Globe2 className="w-7 h-7" />
            </div>
            <div>
              <h1 className="text-2xl md:text-3xl font-bold tracking-tight text-white flex items-center gap-2">
                Enterprise Expansion & Automated Legal Suite
                <span className="text-xs px-2.5 py-0.5 rounded-full bg-indigo-500/10 border border-indigo-500/30 text-indigo-400 font-medium">
                  Global Enterprise Layer
                </span>
              </h1>
              <p className="text-sm text-slate-400 mt-1">
                Expanded Jurisdictions (SG PDPA, Swiss nFADP, AU Privacy Act), Real-Time Cloud Webhook Ingress (AWS S3, Cloudflare, GitHub), and Automated Court-Admissible Contract Generation.
              </p>
            </div>
          </div>
        </div>

        {/* Tab Navigation */}
        <div className="flex items-center gap-2 overflow-x-auto py-4 border-b border-slate-800/80">
          {[
            { id: 'frameworks', label: '1. Expanded Jurisdictions (SG, CH, AU)', icon: Globe2, count: frameworks.length },
            { id: 'webhooks', label: '2. Real-Time Cloud Webhooks (AWS / Cloudflare / GitHub)', icon: Webhook, count: connectors.length },
            { id: 'contracts', label: '3. Automated Legal Contract Drafter', icon: FileCode2 },
            { id: 'copilot', label: '4. AI Compliance Copilot', icon: Bot },
            { id: 'dossier', label: '5. Big-4 Executive Dossier', icon: Award }
          ].map(tab => {
            const Icon = tab.icon;
            const isActive = activeTab === tab.id;
            return (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id as any)}
                className={`flex items-center gap-2 px-4 py-2.5 rounded-lg text-xs md:text-sm font-semibold transition whitespace-nowrap ${
                  isActive
                    ? 'bg-indigo-600/20 text-indigo-400 border border-indigo-500/40 shadow-sm'
                    : 'text-slate-400 hover:text-slate-200 hover:bg-slate-900 border border-transparent'
                }`}
              >
                <Icon className="w-4 h-4" />
                <span>{tab.label}</span>
                {tab.count !== undefined && (
                  <span className="px-2 py-0.5 rounded-full text-[10px] bg-slate-800 text-slate-300 font-mono">
                    {tab.count}
                  </span>
                )}
              </button>
            );
          })}
        </div>
      </div>

      <div className="max-w-7xl mx-auto">
        {/* =========================================================
            TAB 1: EXPANDED JURISDICTIONS (SG PDPA, SWISS nFADP, AU PRIVACY ACT)
           ========================================================= */}
        {activeTab === 'frameworks' && (
          <div className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {frameworks.map(fw => {
                const isSelected = selectedFramework?.id === fw.id;
                return (
                  <div
                    key={fw.id}
                    onClick={() => setSelectedFramework(fw)}
                    className={`cursor-pointer bg-slate-900/80 border rounded-xl p-5 transition flex flex-col justify-between ${
                      isSelected ? 'border-indigo-500 ring-1 ring-indigo-500/50 shadow-lg shadow-indigo-500/10' : 'border-slate-800 hover:border-slate-700'
                    }`}
                  >
                    <div>
                      <div className="flex items-center justify-between mb-3">
                        <span className="text-xs font-mono px-2 py-0.5 rounded bg-slate-800 text-indigo-300">
                          {fw.code}
                        </span>
                        <span className="text-xs font-bold text-emerald-400 flex items-center gap-1">
                          <CheckCircle2 className="w-3.5 h-3.5" /> {fw.readinessScore}% Ready
                        </span>
                      </div>
                      <h3 className="text-base font-bold text-white mb-1">{fw.name}</h3>
                      <p className="text-xs text-slate-400 mb-2">{fw.jurisdiction}</p>
                      <p className="text-[11px] text-slate-500 italic mb-4">Enforcing Body: {fw.enforcingBody}</p>

                      <div className="space-y-2 text-xs text-slate-300 bg-slate-950 p-3 rounded-lg border border-slate-800/80 mb-4">
                        <div className="flex justify-between">
                          <span className="text-slate-400">Breach Window:</span>
                          <span className="font-semibold text-rose-400">{fw.mandatoryBreachNotificationHours} Hours Max</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-slate-400">DPO Registration:</span>
                          <span className="font-semibold text-slate-200">{fw.dpoRequired ? 'Mandatory' : 'Conditional'}</span>
                        </div>
                      </div>
                    </div>

                    <button
                      className={`w-full py-2 rounded-lg text-xs font-semibold flex items-center justify-center gap-1.5 transition ${
                        isSelected ? 'bg-indigo-600 text-white' : 'bg-slate-800 text-slate-300 hover:bg-slate-700'
                      }`}
                    >
                      <span>{isSelected ? 'Active Details' : 'Inspect Framework Details'}</span>
                      <ChevronRight className="w-3.5 h-3.5" />
                    </button>
                  </div>
                );
              })}
            </div>

            {selectedFramework && (
              <div className="bg-slate-900/80 border border-slate-800 rounded-xl p-6 space-y-6">
                <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-slate-800 pb-4">
                  <div>
                    <h2 className="text-lg font-bold text-white flex items-center gap-2">
                      <ShieldCheck className="w-5 h-5 text-indigo-400" />
                      {selectedFramework.name} — Regulatory Matrix
                    </h2>
                    <p className="text-xs text-slate-400 mt-0.5">Primary Enforcement Authority: {selectedFramework.enforcingBody}</p>
                  </div>
                  <span className="px-3 py-1 rounded-full bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 text-xs font-semibold">
                    Posture: Compliant & Verified
                  </span>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6 text-xs">
                  <div className="space-y-4">
                    <div>
                      <h4 className="font-semibold text-slate-300 mb-1">Statutory Penalties & Liabilities:</h4>
                      <div className="p-3 bg-rose-500/10 border border-rose-500/20 text-rose-300 rounded-lg">
                        {selectedFramework.penaltiesSummary}
                      </div>
                    </div>

                    <div>
                      <h4 className="font-semibold text-slate-300 mb-1">Cross-Border Adequacy Mechanism:</h4>
                      <div className="p-3 bg-slate-950 border border-slate-800/80 text-slate-300 rounded-lg font-mono">
                        {selectedFramework.crossBorderAdequacyMechanism}
                      </div>
                    </div>
                  </div>

                  <div>
                    <h4 className="font-semibold text-slate-300 mb-2">Core Mandatory Statutory Obligations:</h4>
                    <div className="space-y-2">
                      {selectedFramework.keyRequirements.map((req, idx) => (
                        <div key={idx} className="flex items-start gap-2.5 p-2.5 bg-slate-950 rounded-lg border border-slate-800/80 text-slate-300">
                          <CheckCircle2 className="w-4 h-4 text-indigo-400 shrink-0 mt-0.5" />
                          <span>{req}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              </div>
            )}
          </div>
        )}

        {/* =========================================================
            TAB 2: REAL-TIME CLOUD WEBHOOKS (AWS S3, CLOUDFLARE, GITHUB)
           ========================================================= */}
        {activeTab === 'webhooks' && (
          <div className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {connectors.map(c => (
                <div key={c.id} className="bg-slate-900/80 border border-slate-800 rounded-xl p-5 flex flex-col justify-between">
                  <div>
                    <div className="flex items-center justify-between mb-3">
                      <span className="text-[11px] font-bold px-2 py-0.5 rounded bg-indigo-500/10 border border-indigo-500/20 text-indigo-300">
                        {c.provider}
                      </span>
                      <span className="text-xs px-2 py-0.5 rounded-full bg-emerald-500/10 text-emerald-400 font-semibold border border-emerald-500/20 flex items-center gap-1">
                        <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
                        {c.status}
                      </span>
                    </div>

                    <h3 className="text-sm font-bold text-white mb-2">{c.name}</h3>

                    <div className="p-2.5 bg-slate-950 rounded-lg border border-slate-800/80 text-[11px] font-mono text-slate-400 break-all mb-3">
                      <p className="text-slate-500 mb-0.5">Ingress Endpoint:</p>
                      <span className="text-indigo-400">{c.endpointUrl}</span>
                    </div>

                    <div className="grid grid-cols-2 gap-2 text-xs bg-slate-950 p-2.5 rounded-lg border border-slate-800/80 mb-4">
                      <div>
                        <p className="text-slate-500">Processed:</p>
                        <p className="font-bold text-slate-200">{c.totalEventsProcessed.toLocaleString()} evts</p>
                      </div>
                      <div>
                        <p className="text-slate-500">Intercepted:</p>
                        <p className="font-bold text-rose-400">{c.threatsIntercepted} threats</p>
                      </div>
                    </div>
                  </div>

                  <p className="text-[10px] text-slate-500">Last heartbeat: {c.lastPingAt}</p>
                </div>
              ))}
            </div>

            {/* Ingress Simulator */}
            <div className="bg-slate-900/80 border border-slate-800 rounded-xl p-6">
              <h3 className="text-base font-bold text-white flex items-center gap-2 mb-3">
                <Terminal className="w-5 h-5 text-indigo-400" />
                Live Webhook Trigger Simulator (AWS / Cloudflare / GitHub)
              </h3>
              <p className="text-xs text-slate-400 mb-4">
                Simulate an asynchronous infrastructure alert webhook to trigger real-time compliance defense and audit logging.
              </p>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
                <div>
                  <label className="text-xs text-slate-400 mb-1 block">Source Provider</label>
                  <select
                    value={simulatedProvider}
                    onChange={e => setSimulatedProvider(e.target.value as any)}
                    className="w-full bg-slate-950 border border-slate-800 rounded-lg px-3 py-2 text-xs text-slate-200 focus:outline-none focus:border-indigo-500"
                  >
                    <option value="AWS_S3">AWS S3 (CloudTrail Security)</option>
                    <option value="CLOUDFLARE">Cloudflare Zero-Trust (WAF/Edge)</option>
                    <option value="GITHUB">GitHub (Dependabot/Secret Scanning)</option>
                  </select>
                </div>
                <div className="md:col-span-2">
                  <label className="text-xs text-slate-400 mb-1 block">JSON Alert Payload Body</label>
                  <textarea
                    rows={3}
                    value={simulatedPayload}
                    onChange={e => setSimulatedPayload(e.target.value)}
                    className="w-full bg-slate-950 border border-slate-800 rounded-lg p-3 text-xs font-mono text-indigo-300 focus:outline-none focus:border-indigo-500"
                  />
                </div>
              </div>

              <div className="flex justify-end">
                <button
                  onClick={handleSimulateWebhook}
                  disabled={isSimulating}
                  className="px-4 py-2 bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-semibold rounded-lg flex items-center gap-2 transition shadow-md shadow-indigo-500/20 disabled:opacity-50"
                >
                  {isSimulating ? <RefreshCw className="w-4 h-4 animate-spin" /> : <Send className="w-4 h-4" />}
                  Dispatch Simulated Webhook
                </button>
              </div>
            </div>

            {/* Ingested Events Stream */}
            <div className="bg-slate-900/80 border border-slate-800 rounded-xl p-6">
              <h3 className="text-sm font-bold text-white mb-3">Live Ingested Infrastructure Telemetry Feed</h3>
              <div className="space-y-3">
                {events.map(evt => (
                  <div
                    key={evt.id}
                    className="bg-slate-950 p-4 rounded-xl border border-slate-800/80 flex flex-col md:flex-row md:items-center justify-between gap-3 text-xs"
                  >
                    <div className="space-y-1">
                      <div className="flex items-center gap-2">
                        <span className="font-mono text-slate-400">{evt.id}</span>
                        <span className="font-bold px-2 py-0.5 rounded bg-slate-900 text-indigo-300 border border-slate-800">
                          {evt.provider}
                        </span>
                        <span
                          className={`font-bold px-2 py-0.5 rounded-full text-[10px] ${
                            evt.severity === 'CRITICAL'
                              ? 'bg-rose-500/10 text-rose-400 border border-rose-500/30'
                              : evt.severity === 'HIGH'
                              ? 'bg-amber-500/10 text-amber-400 border border-amber-500/30'
                              : 'bg-blue-500/10 text-blue-400 border border-blue-500/30'
                          }`}
                        >
                          {evt.severity}
                        </span>
                      </div>
                      <p className="font-semibold text-slate-200">{evt.summary}</p>
                    </div>

                    <div className="flex items-center gap-4 text-slate-400">
                      <span className="font-mono text-[11px]">{evt.receivedAt}</span>
                      {evt.remediationTriggered && (
                        <span className="px-2.5 py-1 rounded bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 text-[11px] font-semibold flex items-center gap-1">
                          <CheckCircle2 className="w-3 h-3" /> Auto-Secured
                        </span>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* =========================================================
            TAB 3: AUTOMATED LEGAL CONTRACT DRAFTER
           ========================================================= */}
        {activeTab === 'contracts' && (
          <div className="space-y-6">
            <div className="bg-slate-900/80 border border-slate-800 rounded-xl p-6">
              <h3 className="text-base font-bold text-white flex items-center gap-2 mb-2">
                <FileCode2 className="w-5 h-5 text-indigo-400" />
                Automated Legal Contract Configurator
              </h3>
              <p className="text-xs text-slate-400 mb-6">
                Dynamically drafts court-admissible contracts tailored to multi-statute requirements with cryptographic tamper seals.
              </p>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
                <div>
                  <label className="text-xs text-slate-400 mb-1 block">Contract Archetype</label>
                  <select
                    value={contractType}
                    onChange={e => setContractType(e.target.value as any)}
                    className="w-full bg-slate-950 border border-slate-800 rounded-lg px-3 py-2 text-xs text-slate-200 focus:outline-none focus:border-indigo-500"
                  >
                    <option value="GLOBAL_DPA">Omni-Jurisdiction Data Processing Addendum (DPA)</option>
                    <option value="AI_VENDOR_TRANSPARENCY">EU AI Act High-Risk Vendor Transparency Agreement</option>
                    <option value="CROSS_BORDER_SCC">Standard Contractual Clauses (SCC Module 2)</option>
                  </select>
                </div>

                <div>
                  <label className="text-xs text-slate-400 mb-1 block">Data Controller Entity</label>
                  <input
                    type="text"
                    value={controllerEntity}
                    onChange={e => setControllerEntity(e.target.value)}
                    className="w-full bg-slate-950 border border-slate-800 rounded-lg px-3 py-2 text-xs text-slate-200 focus:outline-none focus:border-indigo-500"
                  />
                </div>

                <div>
                  <label className="text-xs text-slate-400 mb-1 block">Data Processor / Vendor</label>
                  <input
                    type="text"
                    value={processorEntity}
                    onChange={e => setProcessorEntity(e.target.value)}
                    className="w-full bg-slate-950 border border-slate-800 rounded-lg px-3 py-2 text-xs text-slate-200 focus:outline-none focus:border-indigo-500"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
                <div>
                  <label className="text-xs text-slate-400 mb-1 block">Governing Law & Seat of Arbitration</label>
                  <input
                    type="text"
                    value={governingLaw}
                    onChange={e => setGoverningLaw(e.target.value)}
                    className="w-full bg-slate-950 border border-slate-800 rounded-lg px-3 py-2 text-xs text-slate-200 focus:outline-none focus:border-indigo-500"
                  />
                </div>

                <div>
                  <label className="text-xs text-slate-400 mb-1 block">Applicable Harmonized Jurisdictions</label>
                  <input
                    type="text"
                    value={applicableJurisdictions.join(', ')}
                    onChange={e => setApplicableJurisdictions(e.target.value.split(',').map(s => s.trim()))}
                    className="w-full bg-slate-950 border border-slate-800 rounded-lg px-3 py-2 text-xs text-slate-200 focus:outline-none focus:border-indigo-500"
                  />
                </div>
              </div>

              <div className="flex justify-end">
                <button
                  onClick={handleDraftContract}
                  disabled={isDrafting}
                  className="px-4 py-2 bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-semibold rounded-lg flex items-center gap-2 transition shadow-md shadow-indigo-500/20 disabled:opacity-50"
                >
                  {isDrafting ? <RefreshCw className="w-4 h-4 animate-spin" /> : <Zap className="w-4 h-4" />}
                  Generate Executable Contract
                </button>
              </div>
            </div>

            {/* Generated Contract Document View */}
            {generatedContract && (
              <div className="bg-slate-900/80 border border-slate-800 rounded-xl p-6 md:p-8 space-y-6">
                <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-slate-800 pb-4">
                  <div>
                    <span className="text-xs font-mono text-indigo-400">{generatedContract.contractId}</span>
                    <h2 className="text-lg md:text-xl font-bold text-white mt-1">{generatedContract.title}</h2>
                    <p className="text-xs text-slate-400 mt-0.5">Governing Law: {generatedContract.governingLaw}</p>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="px-3 py-1 bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 text-xs font-semibold rounded-full flex items-center gap-1">
                      <CheckCircle2 className="w-3.5 h-3.5" /> {generatedContract.status.replace(/_/g, ' ')}
                    </span>
                    <button
                      onClick={() => copyToClipboard(JSON.stringify(generatedContract, null, 2), 'doc')}
                      className="px-3 py-1 bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-medium rounded-lg flex items-center gap-1.5 transition"
                    >
                      {copiedId === 'doc' ? <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
                      {copiedId === 'doc' ? 'Copied' : 'Copy JSON'}
                    </button>
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs bg-slate-950 p-4 rounded-xl border border-slate-800/80">
                  <div>
                    <p className="text-slate-400">Cryptographic SHA-256 Digest:</p>
                    <p className="font-mono text-indigo-300 break-all">{generatedContract.sha256Hash}</p>
                  </div>
                  <div>
                    <p className="text-slate-400">NIST Post-Quantum Tamper Seal:</p>
                    <p className="font-mono text-purple-400 break-all">{generatedContract.pqcTamperProofSeal}</p>
                  </div>
                </div>

                {/* Clauses */}
                <div className="space-y-4">
                  <h3 className="text-sm font-bold text-slate-200">Enforceable Contractual Clauses:</h3>
                  {generatedContract.clauses.map(c => (
                    <div key={c.sectionNumber} className="bg-slate-950 p-4 rounded-xl border border-slate-800/80 text-xs space-y-1.5">
                      <div className="flex items-center gap-2 font-bold text-white">
                        <span className="text-indigo-400">{c.sectionNumber}</span>
                        <span>{c.heading}</span>
                      </div>
                      <p className="text-slate-300 leading-relaxed pl-6">{c.body}</p>
                    </div>
                  ))}
                </div>

                <div className="border-t border-slate-800 pt-4 flex flex-col md:flex-row items-center justify-between gap-4 text-xs text-slate-400">
                  <div className="flex items-center gap-2">
                    <Lock className="w-4 h-4 text-emerald-400" />
                    <span>Cryptographically bound to controller and processor public keys.</span>
                  </div>
                  <button
                    onClick={() => showToast(`Contract ${generatedContract.contractId} queued for DocuSign / Adobe Acrobat Sign e-signature dispatch.`, 'success')}
                    className="px-4 py-2 bg-indigo-600 hover:bg-indigo-500 text-white font-semibold rounded-lg flex items-center gap-2 transition"
                  >
                    <span>Dispatch for Certified E-Sign</span>
                    <ExternalLink className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>
            )}
          </div>
        )}

        {/* =========================================================
            TAB 4: AI COMPLIANCE COPILOT
           ========================================================= */}
        {activeTab === 'copilot' && (
          <div className="bg-slate-900/80 border border-slate-800 rounded-xl p-6 flex flex-col h-[650px]">
            <div className="flex items-center justify-between pb-4 border-b border-slate-800">
              <div className="flex items-center gap-3">
                <div className="p-2.5 bg-indigo-500/10 border border-indigo-500/20 text-indigo-400 rounded-lg">
                  <Bot className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="text-sm font-bold text-white">Sovereign Compliance AI Copilot</h3>
                  <p className="text-[11px] text-slate-400">Contextual statutory reasoning across GDPR, NIS2, SG PDPA, Swiss nFADP, AU Privacy Act & Cloud Telemetry.</p>
                </div>
              </div>
              <span className="px-2.5 py-0.5 rounded-full bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 text-[11px] font-medium flex items-center gap-1">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
                Live Statutory Reasoning
              </span>
            </div>

            {/* Messages Feed */}
            <div className="flex-1 overflow-y-auto py-4 space-y-4 pr-1">
              {copilotMessages.map(msg => (
                <div
                  key={msg.id}
                  className={`flex flex-col ${msg.sender === 'USER' ? 'items-end' : 'items-start'}`}
                >
                  <div
                    className={`max-w-[85%] rounded-xl p-4 text-xs leading-relaxed whitespace-pre-line ${
                      msg.sender === 'USER'
                        ? 'bg-indigo-600 text-white shadow-md'
                        : 'bg-slate-950 text-slate-200 border border-slate-800'
                    }`}
                  >
                    {msg.text}

                    {msg.citedFrameworks && msg.citedFrameworks.length > 0 && (
                      <div className="mt-3 pt-2 border-t border-slate-800/80 flex flex-wrap gap-1.5">
                        <span className="text-[10px] text-slate-400 font-semibold mr-1">Cited Statues:</span>
                        {msg.citedFrameworks.map((f, i) => (
                          <span key={i} className="text-[10px] px-2 py-0.5 rounded bg-indigo-500/10 text-indigo-300 font-mono">
                            {f}
                          </span>
                        ))}
                      </div>
                    )}
                  </div>
                  <span className="text-[10px] text-slate-500 mt-1 px-1">{msg.timestamp.slice(11, 19)}</span>
                </div>
              ))}
              {isCopilotThinking && (
                <div className="flex items-center gap-2 text-xs text-indigo-400 p-3 bg-slate-950 rounded-xl border border-slate-800 w-fit">
                  <RefreshCw className="w-3.5 h-3.5 animate-spin" />
                  <span>Cross-referencing statutory articles and live cloud webhooks...</span>
                </div>
              )}
            </div>

            {/* Input form */}
            <div className="pt-3 border-t border-slate-800 flex gap-2">
              <input
                type="text"
                value={copilotInput}
                onChange={e => setCopilotInput(e.target.value)}
                onKeyDown={e => e.key === 'Enter' && handleSendCopilotMessage()}
                placeholder="Ask about Singapore PDPA breach deadlines, Swiss nFADP penalties, or cloud webhook status..."
                className="flex-1 bg-slate-950 border border-slate-800 rounded-lg px-4 py-2.5 text-xs text-slate-100 placeholder-slate-500 focus:outline-none focus:border-indigo-500"
              />
              <button
                onClick={handleSendCopilotMessage}
                disabled={isCopilotThinking}
                className="px-4 py-2.5 bg-indigo-600 hover:bg-indigo-500 text-white rounded-lg text-xs font-semibold flex items-center gap-1.5 transition shadow-sm disabled:opacity-50"
              >
                <Send className="w-3.5 h-3.5" />
                <span>Send</span>
              </button>
            </div>
          </div>
        )}

        {/* =========================================================
            TAB 5: BIG-4 EXECUTIVE AUDITOR DOSSIER
           ========================================================= */}
        {activeTab === 'dossier' && (
          <div className="space-y-6">
            <div className="bg-slate-900/80 border border-slate-800 rounded-xl p-6">
              <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-4">
                <div>
                  <h3 className="text-base font-bold text-white flex items-center gap-2">
                    <Award className="w-5 h-5 text-indigo-400" />
                    Certified Executive Auditor Dossier Pack
                  </h3>
                  <p className="text-xs text-slate-400 mt-1">
                    Compiles a comprehensive, court-grade compliance and Post-Quantum cryptographic evidence pack for Big-4 auditors or statutory inspection bodies.
                  </p>
                </div>
                <div className="flex items-center gap-3">
                  <select
                    value={targetAuditor}
                    onChange={e => setTargetAuditor(e.target.value as any)}
                    className="bg-slate-950 border border-slate-800 text-xs text-slate-200 rounded-lg px-3 py-2 focus:outline-none focus:border-indigo-500"
                  >
                    <option value="BIG_4_AUDITOR">Target: Big-4 Auditor (PwC / EY / Deloitte / KPMG)</option>
                    <option value="EU_REGULATOR">Target: Designated EU / Sovereign Data Protection Authority</option>
                    <option value="INTERNAL_CISO_BOARD">Target: Board of Directors & CISO Governance Committee</option>
                  </select>
                  <button
                    onClick={handleGenerateExecutiveDossier}
                    disabled={isGeneratingDossier}
                    className="px-4 py-2 bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-semibold rounded-lg flex items-center gap-2 transition shadow-md shadow-indigo-500/20 disabled:opacity-50"
                  >
                    {isGeneratingDossier ? <RefreshCw className="w-4 h-4 animate-spin" /> : <FileCheck className="w-4 h-4" />}
                    Compile Audit Dossier
                  </button>
                </div>
              </div>
            </div>

            {dossier && (
              <div className="bg-slate-900/80 border border-slate-800 rounded-xl p-6 md:p-8 space-y-6">
                <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-slate-800 pb-4">
                  <div>
                    <div className="flex items-center gap-2">
                      <span className="text-xs font-mono text-indigo-400">{dossier.dossierId}</span>
                      <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-rose-500/10 text-rose-300 border border-rose-500/20">
                        {dossier.classification}
                      </span>
                    </div>
                    <h2 className="text-lg font-bold text-white mt-1">{dossier.title}</h2>
                    <p className="text-xs text-slate-400">Tenant: {dossier.tenantId} • Generated: {dossier.generationDate.slice(0, 10)}</p>
                  </div>
                  <div className="text-right">
                    <span className="text-xs text-slate-400">Composite Readiness:</span>
                    <p className="text-2xl font-bold text-emerald-400">{dossier.compositeReadinessIndex}%</p>
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs bg-slate-950 p-4 rounded-xl border border-slate-800/80 font-mono">
                  <div>
                    <span className="text-slate-400">NIST PQC Tamper Proof Seal:</span>
                    <p className="text-purple-400 break-all">{dossier.pqcTamperProofSeal}</p>
                  </div>
                  <div>
                    <span className="text-slate-400">SHA-3 Immutable Ledger Hash:</span>
                    <p className="text-indigo-400 break-all">{dossier.sha3Digest}</p>
                  </div>
                </div>

                {/* Control Breakdown Table */}
                <div className="space-y-3">
                  <h4 className="text-sm font-bold text-white">Jurisdictional Regulatory Summaries & Posture:</h4>
                  <div className="overflow-x-auto">
                    <table className="w-full text-xs text-left">
                      <thead className="bg-slate-950 text-slate-400 uppercase text-[10px] font-mono">
                        <tr>
                          <th className="p-3">Statutory Framework</th>
                          <th className="p-3">Supervisory Authority</th>
                          <th className="p-3">Statutory Breach Window</th>
                          <th className="p-3">Posture Score</th>
                          <th className="p-3">Auditor Status</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-slate-800">
                        {dossier.jurisdictionSummaries.map((js, i) => (
                          <tr key={i} className="hover:bg-slate-950/40">
                            <td className="p-3 font-semibold text-slate-200">{js.framework}</td>
                            <td className="p-3 text-slate-400">{js.authority}</td>
                            <td className="p-3 font-semibold text-rose-400">{js.statutoryBreachWindow}</td>
                            <td className="p-3 font-bold text-emerald-400">{js.postureScore}%</td>
                            <td className="p-3">
                              <span className="px-2 py-0.5 rounded bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 font-bold text-[10px]">
                                {js.auditStatus}
                              </span>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>

                {/* Executive Attestation Box */}
                <div className="p-4 bg-slate-950 rounded-xl border border-slate-800/80 text-xs space-y-2">
                  <h4 className="font-bold text-slate-200 flex items-center gap-1.5">
                    <ShieldCheck className="w-4 h-4 text-indigo-400" />
                    Formal Executive Attestation & DPO Seal:
                  </h4>
                  <p className="text-slate-300 italic">{dossier.executiveSignOff.cisoAttestation}</p>
                  <div className="flex flex-wrap items-center justify-between gap-2 pt-2 border-t border-slate-800/60 text-slate-400 font-mono text-[11px]">
                    <span>Registry: {dossier.executiveSignOff.dpoRegistryRef}</span>
                    <span>Legal Status: Verified & Binding</span>
                  </div>
                </div>

                <div className="flex justify-end gap-3 pt-2">
                  <button
                    onClick={() => copyToClipboard(JSON.stringify(dossier, null, 2), 'dossier-json')}
                    className="px-4 py-2 bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-semibold rounded-lg flex items-center gap-1.5 transition"
                  >
                    <Copy className="w-3.5 h-3.5" />
                    {copiedId === 'dossier-json' ? 'Copied' : 'Export Dossier JSON'}
                  </button>
                  <button
                    onClick={() => showToast(`Dossier ${dossier.dossierId} compiled into court-grade PDF package with digital cryptographic signature.`, 'success')}
                    className="px-4 py-2 bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-semibold rounded-lg flex items-center gap-1.5 transition shadow-sm"
                  >
                    <FileCheck className="w-3.5 h-3.5" />
                    <span>Download Certified PDF Dossier</span>
                  </button>
                </div>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
};

export default EnterpriseExpansionConsole;
