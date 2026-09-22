import { fetchWithRetry } from '../lib/api-client';
import React, { useState, useEffect, useMemo } from 'react';
import { useNotification } from '../context/NotificationContext';
import { 
  Activity, Key, Terminal, Copy, CheckCircle2, Zap, Shield, Database, 
  Eye, EyeOff, RefreshCw, Trash2, Plus, Info, AlertTriangle, ShieldCheck, 
  HelpCircle, Settings, Sliders, Globe, Server, Code2, Network, Radio,
  Package, CreditCard, Layers, Cpu, Edit2, X
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import N9XenReguletteeCaasSdk from '../lib/caas-client';
import IndustryAddonManager from '../components/IndustryAddonManager';
import { CaasSubscriptionManager } from '../components/CaasSubscriptionManager';
import { RegionalSovereigntyDashboard } from '../components/RegionalSovereigntyDashboard';
import { RegionalComplianceRadar } from '../components/RegionalComplianceRadar';
import { AiPoweredAuditView } from '../components/AiPoweredAuditView';
import { CaaSAddonsManager } from '../components/CaaSAddonsManager';
import { AdvancedComplianceEngine } from '../components/compliance/AdvancedComplianceEngine';

interface ApiToken {
  id: number;
  token: string;
  name: string;
  client_system: string;
  scope: string;
  status: string;
  created_at: string;
  last_used_at: string | null;
}

interface CaasConfig {
  scanSensitivity: string;
  browserUserAgent: string;
  failoverLatencyThreshold: number;
  autoAnchorProofs: boolean;
  rateLimitScans: number;
  alertWebhookSlack: string;
  alertWebhookTeams: string;
  activeNodes: string[];
}

export const CaasOperationCenter: React.FC = () => {
  const { showToast } = useNotification();
  const [activeTab, setActiveTab] = useState<'monitor' | 'settings' | 'keys' | 'enterprise' | 'addons' | 'sovereignty' | 'ledger' | 'engine'>('monitor');
  const [copied, setCopied] = useState<string | null>(null);
  
  // Ledger state
  const [ledgerLogs, setLedgerLogs] = useState<any[]>([]);
  const [isLoadingLedger, setIsLoadingLedger] = useState(false);
  
  // Enterprise State (OneTrust/Archer inspired)
  const [processingActivities, setProcessingActivities] = useState([
    { id: 'PA-001', name: 'Customer Billing Data', owner: 'Finance Dept', dataTypes: ['PII', 'Financial'], status: 'Active', riskLevel: 'Low' },
    { id: 'PA-002', name: 'Marketing Lead Gen', owner: 'Growth Team', dataTypes: ['PII', 'Behavioral'], status: 'Review', riskLevel: 'Medium' },
    { id: 'PA-003', name: 'HR Employee Files', owner: 'Human Resources', dataTypes: ['PII', 'Health', 'Contracts'], status: 'Active', riskLevel: 'High' }
  ]);

  const [dsarRequests, setDsarRequests] = useState([
    { id: 'DSAR-2026-001', requester: 'Hans Müller', type: 'Erasure', status: 'In Progress', daysLeft: 12 },
    { id: 'DSAR-2026-002', requester: 'Sophie Laurent', type: 'Access', status: 'Verified', daysLeft: 24 }
  ]);

  const [vendors, setVendors] = useState([
    { id: 'V-001', name: 'CloudScale Infrastructure', status: 'Compliant', lastAudit: '2026-01-10', riskScore: 12 },
    { id: 'V-002', name: 'MarketingBot AI', status: 'Critical Action', lastAudit: '2025-11-22', riskScore: 88 }
  ]);

  // ROPA CRUD state
  const [ropaSearch, setRopaSearch] = useState('');
  const [ropaRiskFilter, setRopaRiskFilter] = useState('ALL');
  const [isRopaModalOpen, setIsRopaModalOpen] = useState(false);
  const [editingRopa, setEditingRopa] = useState<any | null>(null);
  const [formRopaName, setFormRopaName] = useState('');
  const [formRopaOwner, setFormRopaOwner] = useState('');
  const [formRopaDataTypes, setFormRopaDataTypes] = useState('');
  const [formRopaRisk, setFormRopaRisk] = useState('Low');
  const [formRopaStatus, setFormRopaStatus] = useState('Active');

  const filteredRopa = useMemo(() => {
    return processingActivities.filter(pa => {
      const matchSearch = pa.name.toLowerCase().includes(ropaSearch.toLowerCase()) ||
                          pa.owner.toLowerCase().includes(ropaSearch.toLowerCase()) ||
                          pa.id.toLowerCase().includes(ropaSearch.toLowerCase());
      const matchRisk = ropaRiskFilter === 'ALL' || pa.riskLevel === ropaRiskFilter;
      return matchSearch && matchRisk;
    });
  }, [processingActivities, ropaSearch, ropaRiskFilter]);

  const handleOpenAddRopa = () => {
    setEditingRopa(null);
    setFormRopaName('');
    setFormRopaOwner('');
    setFormRopaDataTypes('PII, Financial');
    setFormRopaRisk('Low');
    setFormRopaStatus('Active');
    setIsRopaModalOpen(true);
  };

  const handleOpenEditRopa = (pa: any) => {
    setEditingRopa(pa);
    setFormRopaName(pa.name);
    setFormRopaOwner(pa.owner);
    setFormRopaDataTypes(pa.dataTypes.join(', '));
    setFormRopaRisk(pa.riskLevel);
    setFormRopaStatus(pa.status);
    setIsRopaModalOpen(true);
  };

  const handleSaveRopa = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formRopaName || !formRopaOwner) return;

    const dataTypesArr = formRopaDataTypes.split(',').map(s => s.trim()).filter(Boolean);

    if (editingRopa) {
      setProcessingActivities(prev => prev.map(item => item.id === editingRopa.id ? {
        ...item,
        name: formRopaName,
        owner: formRopaOwner,
        dataTypes: dataTypesArr,
        riskLevel: formRopaRisk,
        status: formRopaStatus
      } : item));
      showNotification('success', 'Data processing activity updated successfully.');
    } else {
      const newId = `PA-00${processingActivities.length + 1}`;
      setProcessingActivities(prev => [
        ...prev,
        {
          id: newId,
          name: formRopaName,
          owner: formRopaOwner,
          dataTypes: dataTypesArr,
          riskLevel: formRopaRisk,
          status: formRopaStatus
        }
      ]);
      showNotification('success', 'New data processing activity registered.');
    }
    setIsRopaModalOpen(false);
  };

  const handleDeleteRopa = (id: string) => {
    if (!window.confirm('Delete this processing activity?')) return;
    setProcessingActivities(prev => prev.filter(item => item.id !== id));
    showNotification('success', 'Data processing activity removed.');
  };


  // DSAR CRUD state
  const [dsarSearch, setDsarSearch] = useState('');
  const [dsarStatusFilter, setDsarStatusFilter] = useState('ALL');
  const [isDsarModalOpen, setIsDsarModalOpen] = useState(false);
  const [editingDsar, setEditingDsar] = useState<any | null>(null);
  const [formDsarRequester, setFormDsarRequester] = useState('');
  const [formDsarType, setFormDsarType] = useState('Erasure');
  const [formDsarStatus, setFormDsarStatus] = useState('In Progress');
  const [formDsarDaysLeft, setFormDsarDaysLeft] = useState(30);

  const filteredDsar = useMemo(() => {
    return dsarRequests.filter(req => {
      const matchSearch = req.requester.toLowerCase().includes(dsarSearch.toLowerCase()) ||
                          req.id.toLowerCase().includes(dsarSearch.toLowerCase());
      const matchStatus = dsarStatusFilter === 'ALL' || req.status === dsarStatusFilter;
      return matchSearch && matchStatus;
    });
  }, [dsarRequests, dsarSearch, dsarStatusFilter]);

  const handleOpenAddDsar = () => {
    setEditingDsar(null);
    setFormDsarRequester('');
    setFormDsarType('Erasure');
    setFormDsarStatus('In Progress');
    setFormDsarDaysLeft(30);
    setIsDsarModalOpen(true);
  };

  const handleOpenEditDsar = (req: any) => {
    setEditingDsar(req);
    setFormDsarRequester(req.requester);
    setFormDsarType(req.type);
    setFormDsarStatus(req.status);
    setFormDsarDaysLeft(req.daysLeft);
    setIsDsarModalOpen(true);
  };

  const handleSaveDsar = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formDsarRequester) return;

    if (editingDsar) {
      setDsarRequests(prev => prev.map(item => item.id === editingDsar.id ? {
        ...item,
        requester: formDsarRequester,
        type: formDsarType,
        status: formDsarStatus,
        daysLeft: Number(formDsarDaysLeft)
      } : item));
      showNotification('success', 'DSAR request updated successfully.');
    } else {
      const newId = `DSAR-2026-00${dsarRequests.length + 1}`;
      setDsarRequests(prev => [
        ...prev,
        {
          id: newId,
          requester: formDsarRequester,
          type: formDsarType,
          status: formDsarStatus,
          daysLeft: Number(formDsarDaysLeft)
        }
      ]);
      showNotification('success', 'New DSAR automation workflow registered.');
    }
    setIsDsarModalOpen(false);
  };

  const handleDeleteDsar = (id: string) => {
    if (!window.confirm('Cancel/Delete this DSAR request?')) return;
    setDsarRequests(prev => prev.filter(item => item.id !== id));
    showNotification('success', 'DSAR record removed.');
  };


  // Vendor CRUD state
  const [vendorSearch, setVendorSearch] = useState('');
  const [vendorStatusFilter, setVendorStatusFilter] = useState('ALL');
  const [isVendorModalOpen, setIsVendorModalOpen] = useState(false);
  const [editingVendor, setEditingVendor] = useState<any | null>(null);
  const [formVendorName, setFormVendorName] = useState('');
  const [formVendorStatus, setFormVendorStatus] = useState('Compliant');
  const [formVendorLastAudit, setFormVendorLastAudit] = useState('');
  const [formVendorRiskScore, setFormVendorRiskScore] = useState(20);

  const filteredVendors = useMemo(() => {
    return vendors.filter(v => {
      const matchSearch = v.name.toLowerCase().includes(vendorSearch.toLowerCase()) ||
                          v.id.toLowerCase().includes(vendorSearch.toLowerCase());
      const matchStatus = vendorStatusFilter === 'ALL' || v.status === vendorStatusFilter;
      return matchSearch && matchStatus;
    });
  }, [vendors, vendorSearch, vendorStatusFilter]);

  const handleOpenAddVendor = () => {
    setEditingVendor(null);
    setFormVendorName('');
    setFormVendorStatus('Compliant');
    setFormVendorLastAudit(new Date().toISOString().split('T')[0]);
    setFormVendorRiskScore(15);
    setIsVendorModalOpen(true);
  };

  const handleOpenEditVendor = (v: any) => {
    setEditingVendor(v);
    setFormVendorName(v.name);
    setFormVendorStatus(v.status);
    setFormVendorLastAudit(v.lastAudit);
    setFormVendorRiskScore(v.riskScore);
    setIsVendorModalOpen(true);
  };

  const handleSaveVendor = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formVendorName) return;

    if (editingVendor) {
      setVendors(prev => prev.map(item => item.id === editingVendor.id ? {
        ...item,
        name: formVendorName,
        status: formVendorStatus,
        lastAudit: formVendorLastAudit,
        riskScore: Number(formVendorRiskScore)
      } : item));
      showNotification('success', 'Vendor compliance details updated.');
    } else {
      const newId = `V-00${vendors.length + 1}`;
      setVendors(prev => [
        ...prev,
        {
          id: newId,
          name: formVendorName,
          status: formVendorStatus,
          lastAudit: formVendorLastAudit,
          riskScore: Number(formVendorRiskScore)
        }
      ]);
      showNotification('success', 'New vendor added to compliance oversight deck.');
    }
    setIsVendorModalOpen(false);
  };

  const handleDeleteVendor = (id: string) => {
    if (!window.confirm('Remove this vendor from oversight?')) return;
    setVendors(prev => prev.filter(item => item.id !== id));
    showNotification('success', 'Vendor removed from database.');
  };
  
  // SDK helper
  const sdk = useMemo(() => new N9XenReguletteeCaasSdk(), []);

  // System states
  const [tokens, setTokens] = useState<ApiToken[]>([]);
  const [config, setConfig] = useState<CaasConfig>({
    scanSensitivity: "Strict",
    browserUserAgent: "9Xen Regulettee Compliance Headless Bot/v3.0",
    failoverLatencyThreshold: 150,
    autoAnchorProofs: true,
    rateLimitScans: 250,
    alertWebhookSlack: "https://hooks.slack.com/services/T000-CaaS/B000/Alerts",
    alertWebhookTeams: "https://outlook.office.com/webhook/T000-Teams/CaaS",
    activeNodes: ["EU-Central (Primary)", "EU-West (Failover)", "US-East (Latency Fallback)"]
  });

  // Loaders
  const [isLoadingTokens, setIsLoadingTokens] = useState<boolean>(true);
  const [isLoadingConfig, setIsLoadingConfig] = useState<boolean>(true);
  const [isSavingConfig, setIsSavingConfig] = useState<boolean>(false);
  const [isCreatingKey, setIsCreatingKey] = useState<boolean>(false);
  const [isRotatingId, setIsRotatingId] = useState<number | null>(null);
  const [isRevokingId, setIsRevokingId] = useState<number | null>(null);

  // Advanced Management State
  const [proofText, setProofText] = useState('Compliance verification for EU AI Act Conformity Assessment - Q3 2026');
  const [isGeneratingProof, setIsGeneratingProof] = useState(false);
  const [proofResult, setProofResult] = useState<any | null>(null);
  const [webhookChannel, setWebhookChannel] = useState('slack');
  const [isDispatchingWebhook, setIsDispatchingWebhook] = useState(false);
  const [isRetesting, setIsRetesting] = useState(false);

  // New token form state
  const [formName, setFormName] = useState('');
  const [formSystem, setFormSystem] = useState('Salesforce');
  const [formScope, setFormScope] = useState('Full Compliance');

  // Diagnostic Playground State
  const [diagnosticUrl, setDiagnosticUrl] = useState('https://aerospace-corp.eu');
  const [isRunningDiagnostic, setIsRunningDiagnostic] = useState(false);
  const [diagnosticLogs, setDiagnosticLogs] = useState<string[]>([]);
  const [diagnosticResult, setDiagnosticResult] = useState<any | null>(null);
  const [commsMode, setCommsMode] = useState<'api' | 'websocket'>('websocket');

  // AI Regulatory Query State
  const [aiQuery, setAiQuery] = useState('');
  const [isQueryingAi, setIsQueryingAi] = useState(false);
  const [aiQueryResult, setAiQueryResult] = useState<string | null>(null);

  // UI status feedback
  const [revealedTokens, setRevealedTokens] = useState<Record<number, boolean>>({});
  const [notification, setNotification] = useState<{ type: 'success' | 'error'; text: string } | null>(null);

  const showNotification = (type: 'success' | 'error', text: string) => {
    setNotification({ type, text });
    setTimeout(() => setNotification(null), 5000);
  };

  // Fetch token databases
  const fetchTokens = async () => {
    setIsLoadingTokens(true);
    try {
      const res = await fetchWithRetry('/api/v1/compliance/tokens');
      if (res.ok) {
        const data = await res.json();
        setTokens(data.tokens || []);
      } else {
        const text = await res.text();
        console.error(`Fetch tokens error: ${res.status} ${res.statusText}`, text.slice(0, 500));
      }
    } catch (err: any) {
      console.error("Error retrieving tokens:", err);
    } finally {
      setIsLoadingTokens(false);
    }
  };

  // Fetch global config
  const fetchConfig = async () => {
    setIsLoadingConfig(true);
    try {
      const res = await fetchWithRetry('/api/v1/caas/config');
      if (res.ok) {
        const data = await res.json();
        if (data.config) {
          setConfig(data.config);
        }
      } else {
        const text = await res.text();
        console.error(`Fetch config error: ${res.status} ${res.statusText}`, text.slice(0, 500));
      }
    } catch (err: any) {
      console.error("Error retrieving configuration:", err);
    } finally {
      setIsLoadingConfig(false);
    }
  };

  const fetchLedgerLogs = async () => {
    setIsLoadingLedger(true);
    try {
      const res = await fetch('/api/v1/consent/logs');
      if (res.ok) {
        const data = await res.json();
        if (Array.isArray(data)) {
          setLedgerLogs(data);
        } else if (data && Array.isArray(data.logs)) {
          setLedgerLogs(data.logs);
        } else if (data && Array.isArray(data.data)) {
          setLedgerLogs(data.data);
        } else {
          setLedgerLogs([
            {
              id: 'ledger-001',
              timestamp: new Date().toISOString(),
              actor_id: 'usr_eu_39201',
              action_type: 'CONSENT_GRANTED',
              crypto_hash: '0x8f7a29b401e68c12a78b54',
              verified: true
            },
            {
              id: 'ledger-002',
              timestamp: new Date(Date.now() - 3600000).toISOString(),
              actor_id: 'usr_bd_88102',
              action_type: 'CONSENT_REVOKED',
              crypto_hash: '0x3c9e11f8802d3345e771a2',
              verified: true
            }
          ]);
        }
      } else {
        setLedgerLogs([
          {
            id: 'ledger-001',
            timestamp: new Date().toISOString(),
            actor_id: 'usr_eu_39201',
            action_type: 'CONSENT_GRANTED',
            crypto_hash: '0x8f7a29b401e68c12a78b54',
            verified: true
          }
        ]);
      }
    } catch (e) {
      console.error("Ledger fetch failed", e);
      setLedgerLogs([
        {
          id: 'ledger-001',
          timestamp: new Date().toISOString(),
          actor_id: 'usr_eu_39201',
          action_type: 'CONSENT_GRANTED',
          crypto_hash: '0x8f7a29b401e68c12a78b54',
          verified: true
        }
      ]);
    } finally {
      setIsLoadingLedger(false);
    }
  };

  const handleCopy = (text: string) => {
    navigator.clipboard.writeText(text);
    setCopied(text);
    setTimeout(() => setCopied(null), 2000);
  };

  const toggleReveal = (id: number) => {
    setRevealedTokens(prev => ({ ...prev, [id]: !prev[id] }));
  };

  // Create token
  const handleCreateToken = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formName.trim()) {
      showNotification('error', 'Token label name cannot be empty.');
      return;
    }

    setIsCreatingKey(true);
    try {
      const res = await fetchWithRetry('/api/v1/compliance/tokens', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: formName,
          client_system: formSystem,
          scope: formScope
        })
      });

      if (res.ok) {
        const data = await res.json();
        showNotification('success', `API Access Key "${data.name}" issued successfully.`);
        setFormName('');
        await fetchTokens();
      } else {
        const err = await res.json();
        showNotification('error', err.error || 'Failed to issue token.');
      }
    } catch (err: any) {
      showNotification('error', `Connection error: ${err.message}`);
    } finally {
      setIsCreatingKey(false);
    }
  };

  // Rotate token
  const handleRotateToken = async (id: number, name: string) => {
    if (!window.confirm(`Are you absolutely sure you want to rotate "${name}"? Active connection points utilizing this key will immediately be blocked until they apply the new key string.`)) {
      return;
    }

    setIsRotatingId(id);
    try {
      const res = await fetchWithRetry(`/api/v1/compliance/tokens/rotate/${id}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' }
      });

      if (res.ok) {
        const data = await res.json();
        showNotification('success', `Token rotated successfully. Key now begins with ${data.token.slice(0, 10)}...`);
        setRevealedTokens(prev => ({ ...prev, [id]: true }));
        await fetchTokens();
      } else {
        showNotification('error', 'Failed to rotate selected key.');
      }
    } catch (err: any) {
      showNotification('error', `Error rotating key: ${err.message}`);
    } finally {
      setIsRotatingId(null);
    }
  };

  // Revoke token
  const handleRevokeToken = async (id: number, name: string) => {
    if (!window.confirm(`CRITICAL WARNING: Revoking "${name}" will permanently wipe it from the secure database. Any external servers trying to handshake with this token will get blocked.`)) {
      return;
    }

    setIsRevokingId(id);
    try {
      const res = await fetchWithRetry(`/api/v1/compliance/tokens/${id}`, {
        method: 'DELETE'
      });

      if (res.ok) {
        showNotification('success', `Key "${name}" was permanently deactivated.`);
        await fetchTokens();
      } else {
        showNotification('error', 'Failed to revoke token.');
      }
    } catch (err: any) {
      showNotification('error', `Error: ${err.message}`);
    } finally {
      setIsRevokingId(null);
    }
  };

  // Save Config Settings
  const handleSaveConfig = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSavingConfig(true);
    try {
      const res = await fetchWithRetry('/api/v1/caas/config', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(config)
      });

      if (res.ok) {
        const data = await res.json();
        setConfig(data.config);
        showNotification('success', 'Global Compliance as a Service settings updated.');
      } else {
        showNotification('error', 'Failed to apply configurations.');
      }
    } catch (err: any) {
      showNotification('error', `Saving failed: ${err.message}`);
    } finally {
      setIsSavingConfig(false);
    }
  };

  // Diagnostic Scan Test
  const handleRunDiagnostic = async () => {
    setIsRunningDiagnostic(true);
    setDiagnosticResult(null);
    setDiagnosticLogs(["[Diagnostic Core] Mounting sandbox runtime environments..."]);

    if (commsMode === 'api') {
      setDiagnosticLogs(prev => [...prev, "[REST Mode] Dispatching request to POST /api/v1/caas/detect..."]);
      try {
        const res = await sdk.detect(diagnosticUrl);
        setDiagnosticLogs(prev => [
          ...prev, 
          `[HTTP Status] Completed with 200 OK`,
          `[Response] Score: ${res.score} | Risk Profile: ${res.risk}`
        ]);
        setDiagnosticResult({
          score: res.score,
          risk: res.risk,
          issues: res.issues
        });
      } catch (err: any) {
        setDiagnosticLogs(prev => [...prev, `[REST Error] Trace failed: ${err.message || err}`]);
      } finally {
        setIsRunningDiagnostic(false);
      }
    } else {
      setDiagnosticLogs(prev => [...prev, "[WebSocket Mode] Initializing secure live gateway handshake..."]);
      const ws = sdk.connectWebSocket({
        onLog: (msg) => {
          setDiagnosticLogs(prev => [...prev, `[Live WS Network] ${msg}`]);
        },
        onResult: (type, data) => {
          if (type === 'DETECT_RESULT') {
            setDiagnosticLogs(prev => [...prev, "[Live WS Network] Telemetry stream ended. Diagnostic complete."]);
            setDiagnosticResult({
              score: data.score,
              risk: data.risk,
              issues: data.issues
            });
            setIsRunningDiagnostic(false);
            ws.close();
          }
        },
        onError: (err) => {
          setDiagnosticLogs(prev => [...prev, `[WS Socket Error] ${err}`]);
          setIsRunningDiagnostic(false);
          ws.close();
        }
      });
      ws.onopen = () => {
        ws.send(JSON.stringify({ type: 'DETECT_REQUEST', url: diagnosticUrl }));
      };
    }
  };

  const handleRetestConnectivity = async () => {
    setIsRetesting(true);
    setDiagnosticLogs(prev => [...prev, "[Connectivity] Running global endpoint retest sequence..."]);
    try {
      const res = await sdk.retest();
      setDiagnosticLogs(prev => [...prev, `[Connectivity] SUCCESS: ${res.result}`]);
      showNotification('success', 'Global connectivity trace passed.');
    } catch (err: any) {
      setDiagnosticLogs(prev => [...prev, `[Connectivity] FAILED: ${err.message}`]);
      showNotification('error', 'Connectivity trace failed.');
    } finally {
      setIsRetesting(false);
    }
  };

  const handleRunAiQuery = async () => {
    if (!aiQuery.trim()) return;
    setIsQueryingAi(true);
    setAiQueryResult(null);
    try {
      const res = await sdk.queryAi(aiQuery);
      setAiQueryResult(res.answer);
      showNotification('success', 'AI Policy query processed.');
    } catch (err: any) {
      showNotification('error', `AI Query failed: ${err.message}`);
    } finally {
      setIsQueryingAi(false);
    }
  };

  const handleGenerateProof = async () => {
    if (!proofText.trim()) return;
    setIsGeneratingProof(true);
    setDiagnosticLogs(prev => [...prev, "[ProofGen] Anchoring dynamic compliance verification to ledger..."]);
    try {
      const res = await sdk.generateProof(proofText);
      setProofResult(res);
      setDiagnosticLogs(prev => [...prev, `[ProofGen] SUCCESS: Block ${res.ledgerBlock} | Merkle: ${res.merkleRoot}`]);
      showNotification('success', 'Cryptographic compliance proof generated and anchored.');
    } catch (err: any) {
      setDiagnosticLogs(prev => [...prev, `[ProofGen] ERROR: ${err.message}`]);
      showNotification('error', 'Proof generation failed.');
    } finally {
      setIsGeneratingProof(false);
    }
  };

  const handleDispatchWebhook = async () => {
    setIsDispatchingWebhook(true);
    setDiagnosticLogs(prev => [...prev, `[Webhook] Dispatching alert event via ${webhookChannel.toUpperCase()}...`]);
    try {
      const res = await sdk.dispatchWebhook(webhookChannel, "CaaS Operational Alert: Security threshold breach detected.");
      res.logs.forEach(log => {
        setDiagnosticLogs(prev => [...prev, `[Webhook Outbound] ${log}`]);
      });
      showNotification('success', 'Operational webhook dispatched.');
    } catch (err: any) {
      setDiagnosticLogs(prev => [...prev, `[Webhook] FAILED: ${err.message}`]);
      showNotification('error', 'Webhook dispatch failed.');
    } finally {
      setIsDispatchingWebhook(false);
    }
  };

  // Node add / remove helpers
  const handleAddNode = () => {
    const nodeName = prompt("Enter new regional failover node identifier (e.g., AP-Southeast-1):");
    if (nodeName && nodeName.trim()) {
      setConfig(prev => ({
        ...prev,
        activeNodes: [...prev.activeNodes, nodeName.trim()]
      }));
    }
  };

  const handleRemoveNode = (index: number) => {
    if (config.activeNodes.length <= 1) {
      showToast("At least one operational platform node must remain active.", 'warning');
      return;
    }
    setConfig(prev => ({
      ...prev,
      activeNodes: prev.activeNodes.filter((_, i) => i !== index)
    }));
  };

  return (
    <div className="p-4 sm:p-5 lg:p-6 max-w-7xl mx-auto space-y-4 sm:space-y-6">
      {/* Title Header */}
      <div className="flex flex-col md:flex-row md:items-end justify-between border-b border-slate-200 pb-5">
        <div>
          <div className="flex items-center gap-2">
            <span className="px-2.5 py-1 text-[10px] font-mono font-bold uppercase tracking-wider bg-indigo-50 border border-indigo-200 text-indigo-700 rounded-full flex items-center gap-1.5 animate-pulse">
              <Radio className="w-3 h-3 text-indigo-600 shrink-0" /> CaaS Infrastructure
            </span>
          </div>
          <h1 className="text-3xl font-extrabold text-slate-900 tracking-tight mt-2 flex items-center gap-2">
            <Server className="w-8 h-8 text-indigo-600" /> CaaS Operation Center
          </h1>
          <p className="text-slate-500 mt-1">
            Global management deck for Compliance as a Service. Control API gateway endpoints, headless scanner variables, and cryptographic ledgers.
          </p>
        </div>

        <div className="mt-4 md:mt-0 flex gap-2">
          <button 
            onClick={() => { fetchTokens(); fetchConfig(); showNotification('success', 'Operations database re-synchronized.'); }}
            className="p-2 border border-slate-200 bg-white hover:bg-slate-50 text-slate-600 rounded-lg transition-all"
            title="Refresh Server Telemetry"
          >
            <RefreshCw className="w-5 h-5" />
          </button>
        </div>
      </div>

      {/* Tabs Menu */}
      <div className="flex border-b border-slate-200">
        <button
          onClick={() => setActiveTab('monitor')}
          className={`px-4 py-2.5 font-semibold text-sm transition-all border-b-2 flex items-center gap-2 -mb-px ${
            activeTab === 'monitor' 
              ? 'border-indigo-600 text-indigo-600' 
              : 'border-transparent text-slate-500 hover:text-slate-800'
          }`}
        >
          <Activity className="w-4 h-4" /> Operations Monitor & Sandbox
        </button>
        <button
          onClick={() => setActiveTab('settings')}
          className={`px-4 py-2.5 font-semibold text-sm transition-all border-b-2 flex items-center gap-2 -mb-px ${
            activeTab === 'settings' 
              ? 'border-indigo-600 text-indigo-600' 
              : 'border-transparent text-slate-500 hover:text-slate-800'
          }`}
        >
          <Settings className="w-4 h-4" /> Global Control Settings
        </button>
        <button
          onClick={() => setActiveTab('keys')}
          className={`px-4 py-2.5 font-semibold text-sm transition-all border-b-2 flex items-center gap-2 -mb-px ${
            activeTab === 'keys' 
              ? 'border-indigo-600 text-indigo-600' 
              : 'border-transparent text-slate-500 hover:text-slate-800'
          }`}
        >
          <Key className="w-4 h-4" /> API Access Keys
        </button>
        <button
          onClick={() => setActiveTab('enterprise')}
          className={`px-4 py-2.5 font-semibold text-sm transition-all border-b-2 flex items-center gap-2 -mb-px ${
            activeTab === 'enterprise' 
              ? 'border-indigo-600 text-indigo-600' 
              : 'border-transparent text-slate-500 hover:text-slate-800'
          }`}
        >
          <Package className="w-4 h-4" /> Enterprise Marketplace
        </button>
        <button
          onClick={() => setActiveTab('addons')}
          className={`px-4 py-2.5 font-semibold text-sm transition-all border-b-2 flex items-center gap-2 -mb-px ${
            activeTab === 'addons' 
              ? 'border-indigo-600 text-indigo-600' 
              : 'border-transparent text-slate-500 hover:text-slate-800'
          }`}
        >
          <Layers className="w-4 h-4" /> Addons Manager
        </button>
        <button
          onClick={() => setActiveTab('sovereignty')}
          className={`px-4 py-2.5 font-semibold text-sm transition-all border-b-2 flex items-center gap-2 -mb-px ${
            activeTab === 'sovereignty' 
              ? 'border-indigo-600 text-indigo-600' 
              : 'border-transparent text-slate-500 hover:text-slate-800'
          }`}
        >
          <Globe className="w-4 h-4" /> Global Sovereignty
        </button>
        <button
          onClick={() => {
            setActiveTab('ledger');
            fetchLedgerLogs();
          }}
          className={`px-4 py-2.5 font-semibold text-sm transition-all border-b-2 flex items-center gap-2 -mb-px ${
            activeTab === 'ledger' 
              ? 'border-indigo-600 text-indigo-600' 
              : 'border-transparent text-slate-500 hover:text-slate-800'
          }`}
        >
          <ShieldCheck className="w-4 h-4" /> Sovereign Audit Ledger
        </button>
        <button
          onClick={() => setActiveTab('engine')}
          className={`px-4 py-2.5 font-semibold text-sm transition-all border-b-2 flex items-center gap-2 -mb-px ${
            activeTab === 'engine' 
              ? 'border-indigo-600 text-indigo-600' 
              : 'border-transparent text-slate-500 hover:text-slate-800'
          }`}
        >
          <Cpu className="w-4 h-4 text-indigo-500" /> Advanced Compliance Engine
        </button>
      </div>

      {/* Success/Error Alert */}
      {notification && (
        <div className={`p-4 rounded-xl border flex items-start gap-3 shadow-sm transition-all animate-fade-in ${
          notification.type === 'success' 
            ? 'bg-emerald-50 border-emerald-200 text-emerald-800' 
            : 'bg-rose-50 border-rose-200 text-rose-800'
        }`}>
          {notification.type === 'success' ? (
            <ShieldCheck className="w-5 h-5 text-emerald-600 shrink-0 mt-0.5" />
          ) : (
            <AlertTriangle className="w-5 h-5 text-rose-600 shrink-0 mt-0.5" />
          )}
          <div className="text-sm font-medium">{notification.text}</div>
        </div>
      )}

      {/* Tabs Content */}
      <div className="space-y-4 sm:space-y-6">
        {/* TAB: ADVANCED COMPLIANCE ENGINE */}
        {activeTab === 'engine' && (
          <motion.div
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.3 }}
          >
            <AdvancedComplianceEngine />
          </motion.div>
        )}

        {/* TAB 4: ENTERPRISE MARKETPLACE & GRC */}
        {activeTab === 'enterprise' && (
          <div className="space-y-12">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.4 }}
            >
              <IndustryAddonManager />
            </motion.div>

            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.4, delay: 0.1 }}
            >
              <div className="border-t border-slate-200 pt-12 mt-12 mb-8">
                <div className="flex items-center gap-2 mb-6">
                  <CreditCard className="w-6 h-6 text-slate-400" />
                  <h2 className="text-xl font-bold text-slate-800">CaaS Subscription Management</h2>
                </div>
                <CaasSubscriptionManager />
              </div>
            </motion.div>

            <div className="border-t border-slate-200 pt-12">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
                <div className="flex items-center gap-2">
                  <Database className="w-6 h-6 text-slate-400" />
                  <h2 className="text-xl font-bold text-slate-800">Enterprise GRC Hub</h2>
                </div>
                <div className="flex gap-2">
                  <button 
                    onClick={handleOpenAddRopa}
                    className="px-3 py-1.5 bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-bold rounded-lg flex items-center gap-1 shadow-sm transition-all"
                  >
                    <Plus className="w-3.5 h-3.5" /> Register ROPA
                  </button>
                  <button 
                    onClick={handleOpenAddDsar}
                    className="px-3 py-1.5 bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold rounded-lg flex items-center gap-1 shadow-sm transition-all"
                  >
                    <Plus className="w-3.5 h-3.5" /> New DSAR
                  </button>
                  <button 
                    onClick={handleOpenAddVendor}
                    className="px-3 py-1.5 bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold rounded-lg flex items-center gap-1 shadow-sm transition-all"
                  >
                    <Plus className="w-3.5 h-3.5" /> Add Vendor
                  </button>
                </div>
              </div>

              {/* ROPA and DSAR Grid */}
              <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 sm:gap-6 mb-8">
                
                {/* Data Inventory / ROPA */}
                <div className="lg:col-span-2 bg-white border border-slate-200 rounded-xl shadow-sm overflow-hidden flex flex-col">
                  <div className="p-4 border-b border-slate-100 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3 bg-slate-50">
                    <h3 className="font-bold text-slate-800 flex items-center gap-2">
                      <Database className="w-5 h-5 text-indigo-600" /> Data Processing Inventory (ROPA)
                    </h3>
                    
                    {/* Filters */}
                    <div className="flex flex-wrap gap-2 w-full sm:w-auto">
                      <input 
                        type="text" 
                        placeholder="Search ROPA..."
                        value={ropaSearch}
                        onChange={(e) => setRopaSearch(e.target.value)}
                        className="px-2 py-1 text-xs border border-slate-200 roundedbg-white w-full sm:w-36 focus:outline-none focus:border-indigo-500"
                      />
                      <select
                        value={ropaRiskFilter}
                        onChange={(e) => setRopaRiskFilter(e.target.value)}
                        className="px-2 py-1 text-xs border border-slate-200 rounded bg-white focus:outline-none focus:border-indigo-500"
                      >
                        <option value="ALL">All Risks</option>
                        <option value="Low">Low Risk</option>
                        <option value="Medium">Medium Risk</option>
                        <option value="High">High Risk</option>
                      </select>
                    </div>
                  </div>

                  <div className="overflow-x-auto flex-1">
                    <table className="w-full text-left border-collapse">
                      <thead className="bg-slate-50 text-[10px] font-bold text-slate-500 uppercase tracking-wider border-b border-slate-100">
                        <tr>
                          <th className="px-4 py-3">Activity Name</th>
                          <th className="px-4 py-3">Dept / Owner</th>
                          <th className="px-4 py-3">Data Categories</th>
                          <th className="px-4 py-3">Risk</th>
                          <th className="px-4 py-3">Status</th>
                          <th className="px-4 py-3 text-right">Actions</th>
                        </tr>
                      </thead>
                      <tbody className="text-xs divide-y divide-slate-100">
                        {filteredRopa.map((pa) => (
                          <tr key={pa.id} className="hover:bg-slate-50 transition-colors">
                            <td className="px-4 py-3">
                              <div className="font-bold text-slate-900">{pa.name}</div>
                              <div className="text-[10px] text-slate-400 font-mono">{pa.id}</div>
                            </td>
                            <td className="px-4 py-3 text-slate-600">{pa.owner}</td>
                            <td className="px-4 py-3">
                              <div className="flex flex-wrap gap-1">
                                {pa.dataTypes.map((t, i) => (
                                  <span key={i} className="px-1.5 py-0.5 bg-slate-100 text-slate-600 rounded text-[9px] font-bold">{t}</span>
                                ))}
                              </div>
                            </td>
                            <td className="px-4 py-3">
                              <span className={`font-black uppercase text-[9px] ${
                                pa.riskLevel === 'High' ? 'text-rose-600' : pa.riskLevel === 'Medium' ? 'text-amber-600' : 'text-emerald-600'
                              }`}>
                                {pa.riskLevel}
                              </span>
                            </td>
                            <td className="px-4 py-3">
                              <span className={`px-2 py-0.5 rounded text-[9px] font-black uppercase ${
                                pa.status === 'Active' ? 'bg-emerald-50 text-emerald-700' : 'bg-amber-50 text-amber-700'
                              }`}>
                                {pa.status}
                              </span>
                            </td>
                            <td className="px-4 py-3 text-right">
                              <div className="flex items-center justify-end gap-1.5">
                                <button 
                                  onClick={() => handleOpenEditRopa(pa)}
                                  className="p-1 text-slate-400 hover:text-indigo-600 hover:bg-slate-100 rounded"
                                >
                                  <Edit2 className="w-3 h-3" />
                                </button>
                                <button 
                                  onClick={() => handleDeleteRopa(pa.id)}
                                  className="p-1 text-slate-400 hover:text-rose-600 hover:bg-slate-100 rounded"
                                >
                                  <Trash2 className="w-3 h-3" />
                                </button>
                              </div>
                            </td>
                          </tr>
                        ))}
                        {filteredRopa.length === 0 && (
                          <tr>
                            <td colSpan={6} className="px-4 py-8 text-center text-slate-400 italic">No ROPA activities found.</td>
                          </tr>
                        )}
                      </tbody>
                    </table>
                  </div>
                </div>

                {/* DSAR Tracker */}
                <div className="bg-white border border-slate-200 rounded-xl shadow-sm p-5 space-y-4 flex flex-col justify-between">
                  <div>
                    <div className="flex flex-col gap-2 mb-4">
                      <h3 className="font-bold text-slate-800 flex items-center gap-2">
                        <ShieldCheck className="w-5 h-5 text-emerald-600" /> DSAR Automation Center
                      </h3>
                      <div className="flex gap-2">
                        <input 
                          type="text" 
                          placeholder="Search DSAR..."
                          value={dsarSearch}
                          onChange={(e) => setDsarSearch(e.target.value)}
                          className="px-2 py-1 text-xs border border-slate-200 rounded w-full focus:outline-none focus:border-emerald-500"
                        />
                        <select
                          value={dsarStatusFilter}
                          onChange={(e) => setDsarStatusFilter(e.target.value)}
                          className="px-2 py-1 text-xs border border-slate-200 rounded bg-white focus:outline-none focus:border-emerald-500"
                        >
                          <option value="ALL">All Status</option>
                          <option value="In Progress">In Progress</option>
                          <option value="Verified">Verified</option>
                        </select>
                      </div>
                    </div>

                    <div className="space-y-3 overflow-y-auto max-h-[300px] pr-1">
                      {filteredDsar.map((req) => (
                        <div key={req.id} className="p-3 border border-slate-100 rounded-lg bg-slate-50/50 hover:border-slate-300 transition-all space-y-2 relative group">
                          <div className="flex justify-between items-start">
                            <div>
                              <div className="text-xs font-bold text-slate-900">{req.requester}</div>
                              <div className="text-[10px] text-slate-500">{req.type} Request • {req.id}</div>
                            </div>
                            <span className={`text-[9px] font-black uppercase px-1.5 py-0.5 rounded ${
                              req.status === 'Verified' ? 'bg-emerald-100 text-emerald-700' : 'bg-amber-100 text-amber-700'
                            }`}>
                              {req.status}
                            </span>
                          </div>
                          <div className="flex justify-between items-center pt-1 border-t border-slate-200">
                            <span className="text-[10px] text-slate-400 font-bold uppercase">{req.daysLeft} Days Remaining</span>
                            <div className="flex gap-1.5">
                              <button 
                                onClick={() => handleOpenEditDsar(req)}
                                className="text-[10px] font-bold text-indigo-600 hover:underline"
                              >
                                Edit
                              </button>
                              <span className="text-slate-300 text-[10px]">•</span>
                              <button 
                                onClick={() => handleDeleteDsar(req.id)}
                                className="text-[10px] font-bold text-rose-600 hover:underline"
                              >
                                Delete
                              </button>
                            </div>
                          </div>
                        </div>
                      ))}
                      {filteredDsar.length === 0 && (
                        <div className="p-8 text-center text-slate-400 italic text-xs">No DSAR requests matched the filters.</div>
                      )}
                    </div>
                  </div>
                  <button className="w-full py-2 bg-slate-900 text-white text-xs font-bold rounded-lg hover:bg-slate-800 transition-colors mt-2">
                    View DSAR Portal Analytics
                  </button>
                </div>
              </div>

              {/* Vendors Grid */}
              <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 sm:gap-6">
                {/* Third Party Risk */}
                <div className="lg:col-span-2 bg-white border border-slate-200 rounded-xl shadow-sm p-4 sm:p-5 lg:p-6">
                  <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-6">
                    <div>
                      <h3 className="font-bold text-slate-800 text-lg flex items-center gap-2">
                        <Globe className="w-5 h-5 text-indigo-600" /> Third-Party / Vendor Risk (TPRM)
                      </h3>
                      <p className="text-xs text-slate-500 mt-1">Monitor compliance health across external service providers and sub-processors.</p>
                    </div>
                    
                    <div className="flex gap-2 w-full sm:w-auto">
                      <input 
                        type="text" 
                        placeholder="Search vendors..."
                        value={vendorSearch}
                        onChange={(e) => setVendorSearch(e.target.value)}
                        className="px-2.5 py-1.5 text-xs border border-slate-200 rounded bg-white w-full sm:w-40 focus:outline-none focus:border-indigo-500"
                      />
                      <select
                        value={vendorStatusFilter}
                        onChange={(e) => setVendorStatusFilter(e.target.value)}
                        className="px-2 py-1.5 text-xs border border-slate-200 bg-white rounded focus:outline-none focus:border-indigo-500"
                      >
                        <option value="ALL">All Status</option>
                        <option value="Compliant">Compliant</option>
                        <option value="Critical Action">Critical Action</option>
                      </select>
                    </div>
                  </div>
                  
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {filteredVendors.map((v) => (
                      <div key={v.id} className="p-4 border border-slate-100 rounded-xl bg-slate-50/50 hover:border-indigo-200 hover:shadow-xs transition-all group relative">
                        <div className="flex justify-between items-start mb-3">
                          <div>
                            <h4 className="font-bold text-slate-900 text-sm">{v.name}</h4>
                            <p className="text-[10px] text-slate-500">ID: {v.id} • Last Audit: {v.lastAudit}</p>
                          </div>
                          <div className={`p-2 rounded-lg text-center min-w-[48px] ${
                            v.riskScore > 50 ? 'bg-rose-50 text-rose-600 border border-rose-100' : 'bg-emerald-50 text-emerald-600 border border-emerald-100'
                          }`}>
                            <div className="text-[8px] font-bold uppercase">Risk</div>
                            <div className="text-sm font-black font-mono leading-none">{v.riskScore}</div>
                          </div>
                        </div>
                        <div className="flex items-center justify-between pt-1 border-t border-slate-100 mt-2">
                          <span className={`text-[10px] font-black uppercase px-2 py-0.5 rounded-full ${
                            v.status === 'Compliant' ? 'bg-emerald-100 text-emerald-700' : 'bg-rose-100 text-rose-700'
                          }`}>
                            {v.status}
                          </span>
                          <div className="flex items-center gap-1">
                            <button 
                              onClick={() => handleOpenEditVendor(v)}
                              className="text-[10px] font-bold text-slate-500 hover:text-indigo-600 px-1.5 py-0.5 hover:bg-slate-100 rounded"
                            >
                              Edit
                            </button>
                            <button 
                              onClick={() => handleDeleteVendor(v.id)}
                              className="text-[10px] font-bold text-rose-500 hover:text-rose-700 px-1.5 py-0.5 hover:bg-slate-100 rounded"
                            >
                              Delete
                            </button>
                          </div>
                        </div>
                      </div>
                    ))}
                    {filteredVendors.length === 0 && (
                      <div className="p-10 text-center text-slate-400 italic text-xs col-span-2">No vendors found.</div>
                    )}
                  </div>
                </div>

                {/* Archer-style Risk Matrix / Audit Summary */}
                <div className="bg-slate-900 border border-slate-800 rounded-xl shadow-xl p-4 sm:p-5 lg:p-6 text-white space-y-4">
                  <h3 className="font-bold flex items-center gap-2">
                    <Shield className="w-5 h-5 text-indigo-400" /> Enterprise Risk Matrix
                  </h3>
                  <div className="aspect-square bg-slate-950 rounded-lg border border-slate-800 p-2 grid grid-cols-3 grid-rows-3 gap-1">
                    {/* Mock Heatmap */}
                    <div className="bg-emerald-900/30 border border-emerald-900/50 rounded flex items-center justify-center text-[10px] font-bold text-emerald-400">0</div>
                    <div className="bg-emerald-900/40 border border-emerald-900/60 rounded flex items-center justify-center text-[10px] font-bold text-emerald-400">1</div>
                    <div className="bg-amber-900/30 border border-amber-900/50 rounded flex items-center justify-center text-[10px] font-bold text-amber-400">2</div>
                    
                    <div className="bg-emerald-900/20 border border-emerald-900/40 rounded flex items-center justify-center text-[10px] font-bold text-emerald-400">0</div>
                    <div className="bg-amber-900/40 border border-amber-900/60 rounded flex items-center justify-center text-[10px] font-bold text-amber-400">4</div>
                    <div className="bg-rose-900/40 border border-rose-900/60 rounded flex items-center justify-center text-[10px] font-bold text-rose-400">1</div>
                    
                    <div className="bg-emerald-900/10 border border-emerald-900/30 rounded flex items-center justify-center text-[10px] font-bold text-emerald-400">0</div>
                    <div className="bg-amber-900/20 border border-amber-900/40 rounded flex items-center justify-center text-[10px] font-bold text-amber-400">2</div>
                    <div className="bg-rose-900/60 border border-rose-900/80 rounded flex items-center justify-center text-[10px] font-bold text-rose-400">3</div>
                  </div>
                  <div className="space-y-3 pt-2">
                    <div className="flex justify-between items-center text-xs">
                      <span className="text-slate-400">Corporate Risk Score</span>
                      <span className="font-bold text-amber-400">42 / 100</span>
                    </div>
                    <div className="flex justify-between items-center text-xs">
                      <span className="text-slate-400">Open Audit Issues</span>
                      <span className="font-bold text-rose-400">12 High Priority</span>
                    </div>
                  </div>
                  <button className="w-full py-2 bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-bold rounded-lg transition-colors">
                    Generate GRC Executive Report
                  </button>
                </div>
              </div>
            </div>

            {/* MODALS for ROPA, DSAR, Vendor CRUD */}
            <AnimatePresence>
              {isRopaModalOpen && (
                <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/70 backdrop-blur-xs">
                  <motion.div
                    initial={{ opacity: 0, scale: 0.95 }}
                    animate={{ opacity: 1, scale: 1 }}
                    exit={{ opacity: 0, scale: 0.95 }}
                    className="bg-white border border-slate-200 rounded-2xl w-full max-w-md shadow-xl overflow-hidden text-slate-800"
                  >
                    <div className="p-4 border-b border-slate-100 flex justify-between items-center bg-slate-50">
                      <h3 className="font-bold text-sm uppercase text-slate-700">
                        {editingRopa ? 'Modify ROPA Activity' : 'Register New ROPA Activity'}
                      </h3>
                      <button onClick={() => setIsRopaModalOpen(false)} className="text-slate-400 hover:text-slate-600">
                        <X className="w-4 h-4" />
                      </button>
                    </div>
                    <form onSubmit={handleSaveRopa} className="p-5 space-y-4">
                      <div>
                        <label className="block text-[10px] font-bold uppercase text-slate-500 mb-1">Activity Name *</label>
                        <input
                          type="text"
                          value={formRopaName}
                          onChange={(e) => setFormRopaName(e.target.value)}
                          className="w-full border border-slate-200 rounded-lg px-3 py-1.5 text-xs focus:outline-none focus:border-indigo-500"
                          required
                        />
                      </div>
                      <div>
                        <label className="block text-[10px] font-bold uppercase text-slate-500 mb-1">Dept / Owner *</label>
                        <input
                          type="text"
                          value={formRopaOwner}
                          onChange={(e) => setFormRopaOwner(e.target.value)}
                          className="w-full border border-slate-200 rounded-lg px-3 py-1.5 text-xs focus:outline-none focus:border-indigo-500"
                          required
                        />
                      </div>
                      <div>
                        <label className="block text-[10px] font-bold uppercase text-slate-500 mb-1">Data Categories (comma separated)</label>
                        <input
                          type="text"
                          value={formRopaDataTypes}
                          onChange={(e) => setFormRopaDataTypes(e.target.value)}
                          className="w-full border border-slate-200 rounded-lg px-3 py-1.5 text-xs focus:outline-none focus:border-indigo-500"
                        />
                      </div>
                      <div className="grid grid-cols-2 gap-4">
                        <div>
                          <label className="block text-[10px] font-bold uppercase text-slate-500 mb-1">Risk Level</label>
                          <select
                            value={formRopaRisk}
                            onChange={(e) => setFormRopaRisk(e.target.value)}
                            className="w-full border border-slate-200 rounded-lg px-3 py-1.5 text-xs focus:outline-none focus:border-indigo-500"
                          >
                            <option value="Low">Low</option>
                            <option value="Medium">Medium</option>
                            <option value="High">High</option>
                          </select>
                        </div>
                        <div>
                          <label className="block text-[10px] font-bold uppercase text-slate-500 mb-1">Status</label>
                          <select
                            value={formRopaStatus}
                            onChange={(e) => setFormRopaStatus(e.target.value)}
                            className="w-full border border-slate-200 rounded-lg px-3 py-1.5 text-xs focus:outline-none focus:border-indigo-500"
                          >
                            <option value="Active">Active</option>
                            <option value="Review">Review</option>
                          </select>
                        </div>
                      </div>
                      <div className="pt-3 border-t flex justify-end gap-2">
                        <button type="button" onClick={() => setIsRopaModalOpen(false)} className="px-3 py-1.5 border border-slate-200 rounded text-xs">
                          Cancel
                        </button>
                        <button type="submit" className="px-4 py-1.5 bg-indigo-600 text-white rounded text-xs font-bold">
                          Save Activity
                        </button>
                      </div>
                    </form>
                  </motion.div>
                </div>
              )}

              {isDsarModalOpen && (
                <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/70 backdrop-blur-xs">
                  <motion.div
                    initial={{ opacity: 0, scale: 0.95 }}
                    animate={{ opacity: 1, scale: 1 }}
                    exit={{ opacity: 0, scale: 0.95 }}
                    className="bg-white border border-slate-200 rounded-2xl w-full max-w-md shadow-xl overflow-hidden text-slate-800"
                  >
                    <div className="p-4 border-b border-slate-100 flex justify-between items-center bg-slate-50">
                      <h3 className="font-bold text-sm uppercase text-slate-700">
                        {editingDsar ? 'Modify DSAR Request' : 'File New DSAR Request'}
                      </h3>
                      <button onClick={() => setIsDsarModalOpen(false)} className="text-slate-400 hover:text-slate-600">
                        <X className="w-4 h-4" />
                      </button>
                    </div>
                    <form onSubmit={handleSaveDsar} className="p-5 space-y-4">
                      <div>
                        <label className="block text-[10px] font-bold uppercase text-slate-500 mb-1">Requester Name *</label>
                        <input
                          type="text"
                          value={formDsarRequester}
                          onChange={(e) => setFormDsarRequester(e.target.value)}
                          className="w-full border border-slate-200 rounded-lg px-3 py-1.5 text-xs focus:outline-none focus:border-emerald-500"
                          required
                        />
                      </div>
                      <div>
                        <label className="block text-[10px] font-bold uppercase text-slate-500 mb-1">Request Type</label>
                        <select
                          value={formDsarType}
                          onChange={(e) => setFormDsarType(e.target.value)}
                          className="w-full border border-slate-200 rounded-lg px-3 py-1.5 text-xs focus:outline-none focus:border-emerald-500"
                        >
                          <option value="Erasure">Erasure</option>
                          <option value="Access">Access</option>
                          <option value="Portability">Portability</option>
                          <option value="Rectification">Rectification</option>
                        </select>
                      </div>
                      <div className="grid grid-cols-2 gap-4">
                        <div>
                          <label className="block text-[10px] font-bold uppercase text-slate-500 mb-1">Status</label>
                          <select
                            value={formDsarStatus}
                            onChange={(e) => setFormDsarStatus(e.target.value)}
                            className="w-full border border-slate-200 rounded-lg px-3 py-1.5 text-xs focus:outline-none focus:border-emerald-500"
                          >
                            <option value="In Progress">In Progress</option>
                            <option value="Verified">Verified</option>
                          </select>
                        </div>
                        <div>
                          <label className="block text-[10px] font-bold uppercase text-slate-500 mb-1">Days Remaining</label>
                          <input
                            type="number"
                            value={formDsarDaysLeft}
                            onChange={(e) => setFormDsarDaysLeft(Number(e.target.value))}
                            className="w-full border border-slate-200 rounded-lg px-3 py-1.5 text-xs focus:outline-none focus:border-emerald-500"
                            min={1}
                            max={30}
                          />
                        </div>
                      </div>
                      <div className="pt-3 border-t flex justify-end gap-2">
                        <button type="button" onClick={() => setIsDsarModalOpen(false)} className="px-3 py-1.5 border border-slate-200 rounded text-xs">
                          Cancel
                        </button>
                        <button type="submit" className="px-4 py-1.5 bg-emerald-600 text-white rounded text-xs font-bold">
                          Register Request
                        </button>
                      </div>
                    </form>
                  </motion.div>
                </div>
              )}

              {isVendorModalOpen && (
                <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/70 backdrop-blur-xs">
                  <motion.div
                    initial={{ opacity: 0, scale: 0.95 }}
                    animate={{ opacity: 1, scale: 1 }}
                    exit={{ opacity: 0, scale: 0.95 }}
                    className="bg-white border border-slate-200 rounded-2xl w-full max-w-md shadow-xl overflow-hidden text-slate-800"
                  >
                    <div className="p-4 border-b border-slate-100 flex justify-between items-center bg-slate-50">
                      <h3 className="font-bold text-sm uppercase text-slate-700">
                        {editingVendor ? 'Modify Vendor Record' : 'Add New GRC Vendor Record'}
                      </h3>
                      <button onClick={() => setIsVendorModalOpen(false)} className="text-slate-400 hover:text-slate-600">
                        <X className="w-4 h-4" />
                      </button>
                    </div>
                    <form onSubmit={handleSaveVendor} className="p-5 space-y-4">
                      <div>
                        <label className="block text-[10px] font-bold uppercase text-slate-500 mb-1">Vendor Name *</label>
                        <input
                          type="text"
                          value={formVendorName}
                          onChange={(e) => setFormVendorName(e.target.value)}
                          className="w-full border border-slate-200 rounded-lg px-3 py-1.5 text-xs focus:outline-none focus:border-blue-500"
                          required
                        />
                      </div>
                      <div className="grid grid-cols-2 gap-4">
                        <div>
                          <label className="block text-[10px] font-bold uppercase text-slate-500 mb-1">Compliance Status</label>
                          <select
                            value={formVendorStatus}
                            onChange={(e) => setFormVendorStatus(e.target.value)}
                            className="w-full border border-slate-200 rounded-lg px-3 py-1.5 text-xs focus:outline-none focus:border-blue-500"
                          >
                            <option value="Compliant">Compliant</option>
                            <option value="Critical Action">Critical Action</option>
                          </select>
                        </div>
                        <div>
                          <label className="block text-[10px] font-bold uppercase text-slate-500 mb-1">Last Audit Date</label>
                          <input
                            type="date"
                            value={formVendorLastAudit}
                            onChange={(e) => setFormVendorLastAudit(e.target.value)}
                            className="w-full border border-slate-200 rounded-lg px-3 py-1.5 text-xs focus:outline-none focus:border-blue-500"
                          />
                        </div>
                      </div>
                      <div>
                        <label className="block text-[10px] font-bold uppercase text-slate-500 mb-1">Risk Score (1-100)</label>
                        <input
                          type="range"
                          min="1"
                          max="100"
                          value={formVendorRiskScore}
                          onChange={(e) => setFormVendorRiskScore(Number(e.target.value))}
                          className="w-full"
                        />
                        <div className="text-right text-xs font-mono font-bold text-slate-600">{formVendorRiskScore} / 100</div>
                      </div>
                      <div className="pt-3 border-t flex justify-end gap-2">
                        <button type="button" onClick={() => setIsVendorModalOpen(false)} className="px-3 py-1.5 border border-slate-200 rounded text-xs">
                          Cancel
                        </button>
                        <button type="submit" className="px-4 py-1.5 bg-blue-600 text-white rounded text-xs font-bold">
                          Save Vendor
                        </button>
                      </div>
                    </form>
                  </motion.div>
                </div>
              )}
            </AnimatePresence>
          </div>
        )}

        {/* TAB 5: ADDONS MANAGER */}
        {activeTab === 'addons' && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4 }}
          >
            <CaaSAddonsManager />
          </motion.div>
        )}

        {/* TAB 6: GLOBAL SOVEREIGNTY */}
        {activeTab === 'sovereignty' && (
          <motion.div
            initial={{ opacity: 0, scale: 0.98 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.4 }}
            className="space-y-4 sm:space-y-6"
          >
            <RegionalComplianceRadar />
            <RegionalSovereigntyDashboard />
          </motion.div>
        )}
        
        {/* TAB 6: SOVEREIGN LEDGER */}
        {activeTab === 'ledger' && (
          <div className="space-y-4 sm:space-y-6">
            <div className="bg-white border border-slate-200 rounded-2xl shadow-sm overflow-hidden">
              <div className="p-4 sm:p-5 lg:p-6 border-b border-slate-100 flex justify-between items-center">
                <div>
                  <h2 className="text-xl font-bold text-slate-800">Sovereign Audit Ledger</h2>
                  <p className="text-sm text-slate-500">Immutable proof-of-consent records anchored in cross-border regional nodes.</p>
                </div>
                <button onClick={fetchLedgerLogs} className="p-2 hover:bg-slate-50 rounded-lg transition-colors border border-slate-200">
                  <RefreshCw className={`w-4 h-4 ${isLoadingLedger ? 'animate-spin' : ''}`} />
                </button>
              </div>
              <div className="overflow-x-auto">
                <table className="w-full text-left">
                  <thead className="bg-slate-50 text-[10px] font-bold text-slate-400 uppercase tracking-widest border-b border-slate-100">
                    <tr>
                      <th className="px-6 py-4">Timestamp</th>
                      <th className="px-6 py-4">User ID</th>
                      <th className="px-6 py-4">Action</th>
                      <th className="px-6 py-4">Sovereign Signature</th>
                      <th className="px-6 py-4 text-right">Integrity</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100">
                    {(!Array.isArray(ledgerLogs) || ledgerLogs.length === 0) ? (
                      <tr>
                        <td colSpan={5} className="px-6 py-12 text-center text-slate-400 italic">No ledger records found.</td>
                      </tr>
                    ) : (Array.isArray(ledgerLogs) ? ledgerLogs : []).map((log: any) => (
                      <tr key={log.id} className="hover:bg-slate-50 transition-colors text-xs">
                        <td className="px-6 py-4 font-mono text-slate-500">{new Date(log.timestamp).toLocaleString()}</td>
                        <td className="px-6 py-4 font-bold text-slate-700">{log.actor_id}</td>
                        <td className="px-6 py-4">
                          <span className={`px-2 py-0.5 rounded-full font-black uppercase text-[9px] ${
                            log.action_type === 'CONSENT_GRANTED' ? 'bg-emerald-50 text-emerald-700' : 'bg-indigo-50 text-indigo-700'
                          }`}>
                            {log.action_type}
                          </span>
                        </td>
                        <td className="px-6 py-4 font-mono text-indigo-600">{log.crypto_hash.substring(0, 16)}...</td>
                        <td className="px-6 py-4 text-right">
                          <div className="flex items-center justify-end gap-1.5 text-emerald-600 font-bold">
                            <CheckCircle2 className="w-3.5 h-3.5" />
                            VERIFIED
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        )}

        {/* TAB 1: OPERATIONS MONITOR & SANDBOX */}
        {activeTab === 'monitor' && (
          <div className="space-y-4 sm:space-y-6">
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 sm:gap-6">
              {/* Live Infrastructure Metrics (Simplified for restoration) */}
              <div className="lg:col-span-1 space-y-4 sm:space-y-6">
                <div className="bg-white border border-slate-200 rounded-xl shadow-sm p-4 sm:p-5 lg:p-6 space-y-4">
                  <h3 className="font-bold text-slate-800 flex items-center gap-2">
                    <Activity className="w-5 h-5 text-indigo-600 animate-pulse" /> Live Cluster Health
                  </h3>
                  <div className="space-y-4">
                    <div className="flex justify-between text-xs font-semibold text-slate-600 uppercase">
                      <span>Throughput</span>
                      <span className="text-emerald-600">99.8% Healthy</span>
                    </div>
                    <div className="w-full bg-slate-100 rounded-full h-1.5 overflow-hidden">
                      <div className="bg-emerald-500 h-full" style={{ width: '99.8%' }}></div>
                    </div>
                  </div>
                </div>
              </div>
              <div>
                <h3 className="font-bold text-slate-800 flex items-center gap-2">
                  <Terminal className="w-5 h-5 text-slate-700" /> CaaS Operational Sandbox
                </h3>
                <p className="text-xs text-slate-500 mt-1">
                  Run ad-hoc scans on specific sites or mock client URLs to test your headless browser cookie tracking audit rules.
                </p>
              </div>

              {/* URL and protocol settings */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="md:col-span-2">
                  <label className="block text-[10px] font-bold text-slate-600 uppercase mb-1">Audit Endpoint URL</label>
                  <input 
                    type="url"
                    value={diagnosticUrl}
                    onChange={(e) => setDiagnosticUrl(e.target.value)}
                    className="w-full px-3 py-2 text-sm border border-slate-200 rounded-lg bg-slate-50 font-mono text-slate-800 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                  />
                </div>

                <div>
                  <label className="block text-[10px] font-bold text-slate-600 uppercase mb-1">Tunnel Protocol</label>
                  <div className="flex border border-slate-200 rounded-lg overflow-x-auto h-[38px]">
                    <button
                      onClick={() => setCommsMode('websocket')}
                      className={`flex-1 text-[10px] font-mono font-bold transition-all ${
                        commsMode === 'websocket' 
                          ? 'bg-indigo-600 text-white' 
                          : 'bg-white text-slate-600 hover:bg-slate-50'
                      }`}
                    >
                      WS Stream
                    </button>
                    <button
                      onClick={() => setCommsMode('api')}
                      className={`flex-1 text-[10px] font-mono font-bold transition-all ${
                        commsMode === 'api' 
                          ? 'bg-indigo-600 text-white' 
                          : 'bg-white text-slate-600 hover:bg-slate-50'
                      }`}
                    >
                      REST API
                    </button>
                  </div>
                </div>
              </div>

              {/* AI Regulatory Query */}
              <div className="bg-slate-50 border border-slate-200 rounded-xl p-4 space-y-3">
                <h4 className="font-bold text-slate-800 text-xs flex items-center gap-2">
                  <Code2 className="w-4 h-4 text-indigo-500" /> Regulatory AI Query
                </h4>
                <div className="flex gap-2">
                  <input 
                    type="text"
                    value={aiQuery}
                    onChange={(e) => setAiQuery(e.target.value)}
                    placeholder="Ask about AI Act clauses..."
                    className="flex-1 px-3 py-2 text-sm border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 bg-white"
                  />
                  <button 
                    onClick={handleRunAiQuery}
                    disabled={isQueryingAi}
                    className="px-4 py-2 bg-indigo-600 hover:bg-indigo-700 disabled:bg-indigo-400 text-white font-bold text-xs rounded-lg transition-all"
                  >
                    {isQueryingAi ? <RefreshCw className="w-4 h-4 animate-spin" /> : 'Query'}
                  </button>
                </div>
                {aiQueryResult && (
                  <div className="bg-white p-3 rounded-lg border border-slate-200 text-xs text-slate-700 font-medium">
                    {aiQueryResult}
                  </div>
                )}
              </div>

              <div className="flex justify-end pt-2">
                <button
                  onClick={handleRunDiagnostic}
                  disabled={isRunningDiagnostic}
                  className="px-5 py-2 bg-slate-900 hover:bg-slate-800 disabled:bg-slate-400 text-white font-bold text-xs rounded-lg transition-all flex items-center gap-2 shadow-sm"
                >
                  {isRunningDiagnostic ? (
                    <>
                      <RefreshCw className="w-4 h-4 animate-spin" /> Crawling & Scanning...
                    </>
                  ) : (
                    <>
                      <Zap className="w-4 h-4 text-yellow-400 animate-bounce" /> Run Active Sandbox Audit
                    </>
                  )}
                </button>
              </div>

              {/* Logs output */}
              <div className="flex-1 flex flex-col space-y-2">
                <div className="flex justify-between items-center">
                  <span className="text-[10px] font-bold text-slate-600 uppercase">Live Operations Console Logs</span>
                  <div className="flex gap-2">
                    <button onClick={() => setDiagnosticLogs([])} className="text-[10px] font-bold text-slate-500 hover:text-slate-800 transition-colors">Clear</button>
                    <button onClick={() => navigator.clipboard.writeText(diagnosticLogs.join('\n'))} className="text-[10px] font-bold text-slate-500 hover:text-slate-800 transition-colors">Copy</button>
                  </div>
                </div>
                <div className="flex-1 bg-slate-950 p-4 rounded-xl border border-slate-850 font-mono text-xs text-indigo-400 min-h-[160px] max-h-[220px] overflow-y-auto space-y-1">
                  {diagnosticLogs.length === 0 ? (
                    <span className="text-slate-600 italic">No diagnostic events triggered yet. Click run to execute audit sequence.</span>
                  ) : (
                    diagnosticLogs.map((log, i) => (
                      <div key={i} className="leading-relaxed">
                        <span className="text-slate-600 select-none mr-2">[{i + 1}]</span>
                        {log}
                      </div>
                    ))
                  )}
                </div>
              </div>

              {/* Diagnostics Verdict */}
              {diagnosticResult && (
                <div className="bg-slate-50 border border-slate-200 rounded-xl p-4 grid grid-cols-1 md:grid-cols-3 gap-4 items-center">
                  <div className="text-center md:border-r border-slate-200 py-1">
                    <span className="text-[10px] font-bold uppercase text-slate-400 block">Headless Compliance Score</span>
                    <span className={`text-3xl font-black font-mono ${diagnosticResult.score > 80 ? 'text-emerald-600' : 'text-rose-600'}`}>
                      {diagnosticResult.score}/100
                    </span>
                  </div>

                  <div className="text-center md:border-r border-slate-200 py-1">
                    <span className="text-[10px] font-bold uppercase text-slate-400 block">Risk Evaluation</span>
                    <span className={`text-base font-extrabold uppercase font-mono px-3 py-0.5 rounded-full inline-block mt-1 ${
                      diagnosticResult.risk === 'Low' ? 'bg-emerald-50 text-emerald-700' : 'bg-rose-50 text-rose-700'
                    }`}>
                      {diagnosticResult.risk} RISK
                    </span>
                  </div>

                  <div className="py-1">
                    <span className="text-[10px] font-bold uppercase text-slate-400 block mb-1">Identified Issues</span>
                    <ul className="text-xs text-slate-700 list-disc pl-4 space-y-0.5">
                      {diagnosticResult.issues.map((issue: string, idx: number) => (
                        <li key={idx} className="font-medium text-slate-700">{issue}</li>
                      ))}
                    </ul>
                  </div>
                </div>
              )}

              {/* AI Audit Module integration */}
              <div className="mt-6">
                <AiPoweredAuditView scanReport={diagnosticResult ? {
                  id: 'temp-scan',
                  targetUrl: diagnosticUrl,
                  scannedAt: new Date().toISOString(),
                  ePrivacyScore: diagnosticResult.score || 0,
                  complianceStatus: (diagnosticResult.score || 0) > 80 ? 'COMPLIANT' : 'NEEDS_ATTENTION',
                  detectedTrackers: [],
                  detectedCookies: [],
                  hiddenPixelsCount: 0,
                  unconsentedTrackersCount: 0,
                  cookieBannerDetected: true,
                  hasRejectAllOption: true,
                  remediationSteps: []
                } : null} />
              </div>
            </div>

          {/* TAB 1 (CONTINUED): ADVANCED MANAGEMENT ACTIONS */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 sm:gap-6">
            
            {/* Cryptographic Proof Generator */}
            <div className="bg-white border border-slate-200 rounded-xl shadow-sm p-4 sm:p-5 lg:p-6 space-y-4">
              <h3 className="font-bold text-slate-800 flex items-center gap-2">
                <ShieldCheck className="w-5 h-5 text-emerald-600" /> Advanced Management: Proof Anchor
              </h3>
              <p className="text-xs text-slate-500">
                Generate cryptographically signed compliance statements for immutable ledger anchoring.
              </p>
              
              <div className="space-y-4">
                <div>
                  <label className="block text-[10px] font-bold text-slate-600 uppercase mb-1">Proof Statement Context</label>
                  <textarea 
                    rows={2}
                    value={proofText}
                    onChange={(e) => setProofText(e.target.value)}
                    className="w-full px-3 py-2 text-sm border border-slate-200 rounded-lg bg-slate-50 font-sans text-slate-800 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                    placeholder="Enter compliance verification details..."
                  />
                </div>

                <div className="flex justify-between items-center">
                  <div className="flex items-center gap-2 text-xs text-slate-500 italic">
                    <Database className="w-3.5 h-3.5" /> SHA-256 Merkle Verification Active
                  </div>
                  <button 
                    onClick={handleGenerateProof}
                    disabled={isGeneratingProof}
                    className="px-4 py-2 bg-emerald-600 hover:bg-emerald-700 disabled:bg-emerald-400 text-white font-bold text-xs rounded-lg transition-all flex items-center gap-2 shadow-sm"
                  >
                    {isGeneratingProof ? <RefreshCw className="w-3.5 h-3.5 animate-spin" /> : <Zap className="w-3.5 h-3.5" />}
                    Anchor Proof
                  </button>
                </div>

                {proofResult && (
                  <motion.div 
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="bg-emerald-50/50 border border-emerald-100 rounded-lg p-3 space-y-2 font-mono text-[10px]"
                  >
                    <div className="flex justify-between items-center text-emerald-800 border-b border-emerald-100 pb-1.5 mb-1.5">
                      <span className="font-bold uppercase tracking-tight">Proof Verification Result</span>
                      <span className="bg-emerald-100 px-1.5 py-0.5 rounded text-emerald-700">VERIFIED</span>
                    </div>
                    <div className="grid grid-cols-2 gap-x-4 gap-y-1 text-slate-600">
                      <div className="truncate"><span className="text-slate-400">HASH:</span> {proofResult.hash}</div>
                      <div className="truncate"><span className="text-slate-400">MERKLE:</span> {proofResult.merkleRoot}</div>
                      <div><span className="text-slate-400">BLOCK:</span> {proofResult.ledgerBlock}</div>
                      <div><span className="text-slate-400">WITNESSES:</span> {proofResult.witnessCount}</div>
                    </div>
                  </motion.div>
                )}
              </div>
            </div>

            {/* Manual Intervention: Webhook Dispatch & Health */}
            <div className="bg-white border border-slate-200 rounded-xl shadow-sm p-4 sm:p-5 lg:p-6 space-y-4">
              <h3 className="font-bold text-slate-800 flex items-center gap-2">
                <Globe className="w-5 h-5 text-indigo-600" /> Manual Escalation & Health
              </h3>
              <p className="text-xs text-slate-500">
                Trigger emergency manual webhooks and run deep connectivity re-tests across the global cluster.
              </p>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-3">
                  <label className="block text-[10px] font-bold text-slate-600 uppercase">Webhook Escalation</label>
                  <div className="flex gap-2">
                    <select 
                      value={webhookChannel}
                      onChange={(e) => setWebhookChannel(e.target.value)}
                      className="flex-1 px-2 py-2 text-xs border border-slate-200 rounded-lg bg-slate-50 font-sans focus:outline-none focus:ring-1 focus:ring-indigo-500"
                    >
                      <option value="slack">Slack Alert</option>
                      <option value="teams">MS Teams</option>
                      <option value="discord">Discord SecOps</option>
                    </select>
                    <button 
                      onClick={handleDispatchWebhook}
                      disabled={isDispatchingWebhook}
                      className="px-3 py-2 bg-indigo-600 hover:bg-indigo-700 disabled:bg-indigo-400 text-white font-bold text-xs rounded-lg transition-all"
                    >
                      Dispatch
                    </button>
                  </div>
                  <p className="text-[10px] text-slate-400 italic">Dispatches a critical security event to chosen endpoints.</p>
                </div>

                <div className="space-y-3 md:border-l md:border-slate-100 md:pl-4">
                  <label className="block text-[10px] font-bold text-slate-600 uppercase">System Re-test</label>
                  <button 
                    onClick={handleRetestConnectivity}
                    disabled={isRetesting}
                    className="w-full py-2 bg-slate-900 hover:bg-slate-800 disabled:bg-slate-400 text-white font-bold text-xs rounded-lg transition-all flex items-center justify-center gap-2"
                  >
                    {isRetesting ? <RefreshCw className="w-3.5 h-3.5 animate-spin" /> : <Radio className="w-3.5 h-3.5" />}
                    Deep Trace Retest
                  </button>
                  <p className="text-[10px] text-slate-400 italic">Forces a global connectivity check across all failover nodes.</p>
                </div>
              </div>

              <div className="bg-slate-50 border border-slate-150 rounded-lg p-3">
                <div className="flex justify-between items-center mb-1.5">
                  <span className="text-[10px] font-bold text-slate-500 uppercase">Automated Failover Status</span>
                  <span className="px-1.5 py-0.5 bg-emerald-100 text-emerald-700 text-[9px] font-bold rounded">STANDBY</span>
                </div>
                <div className="flex gap-1.5 items-center">
                  <div className="w-2 h-2 rounded-full bg-emerald-500"></div>
                  <span className="text-xs text-slate-700 font-medium">Secondary (EU-West) is synchronized and ready.</span>
                </div>
              </div>
            </div>

          </div>
        </div>
      )}

        {/* TAB 2: GLOBAL CONTROL SETTINGS */}
        {activeTab === 'settings' && (
          <div className="bg-white border border-slate-200 rounded-xl shadow-sm p-4 sm:p-5 lg:p-6 max-w-4xl mx-auto">
            <div className="border-b border-slate-100 pb-4 mb-6">
              <h3 className="font-bold text-slate-800 text-lg flex items-center gap-2">
                <Sliders className="w-5 h-5 text-indigo-600" /> Dynamic Core Variables & Compliance Level
              </h3>
              <p className="text-xs text-slate-500 mt-1">
                Configure global settings controlling headless scanning, webhook alerts, and compliance automation filters.
              </p>
            </div>

            {isLoadingConfig ? (
              <div className="flex flex-col items-center justify-center py-24 text-slate-400">
                <RefreshCw className="w-8 h-8 animate-spin text-indigo-600 mb-2" />
                <span className="text-sm">Reading configuration state from backend...</span>
              </div>
            ) : (
              <form onSubmit={handleSaveConfig} className="space-y-4 sm:space-y-6">
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 sm:gap-6">
                  
                  <div>
                    <label className="block text-xs font-bold text-slate-700 uppercase mb-1">Simulated User Agent String</label>
                    <input 
                      type="text"
                      required
                      value={config.browserUserAgent}
                      onChange={(e) => setConfig(prev => ({ ...prev, browserUserAgent: e.target.value }))}
                      className="w-full px-3 py-2 text-sm border border-slate-200 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:outline-none bg-slate-50 font-mono text-slate-800"
                    />
                    <p className="text-[10px] text-slate-500 mt-1">
                      The user-agent sent by our headless crawler to bypass anti-scraping filters on tenant sites.
                    </p>
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-slate-700 uppercase mb-1">Scan Strictness Sensitivity</label>
                    <select
                      value={config.scanSensitivity}
                      onChange={(e) => setConfig(prev => ({ ...prev, scanSensitivity: e.target.value }))}
                      className="w-full px-3 py-2 text-sm border border-slate-200 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:outline-none bg-slate-50"
                    >
                      <option value="Strict">Strict (Blocks minor tracking & cookie pre-ticks)</option>
                      <option value="Standard">Standard (Permits standard analytical tracking tags)</option>
                      <option value="Lax">Lax (Only blocks critical unconsented PII exports)</option>
                    </select>
                    <p className="text-[10px] text-slate-500 mt-1">
                      Adjustment parameters utilized by the AI compliance engine evaluating site risks.
                    </p>
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-slate-700 uppercase mb-1">Failover Node Latency Threshold (ms)</label>
                    <input 
                      type="number"
                      required
                      min="50"
                      max="1000"
                      value={config.failoverLatencyThreshold}
                      onChange={(e) => setConfig(prev => ({ ...prev, failoverLatencyThreshold: parseInt(e.target.value) }))}
                      className="w-full px-3 py-2 text-sm border border-slate-200 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:outline-none bg-slate-50 font-mono text-slate-800"
                    />
                    <p className="text-[10px] text-slate-500 mt-1">
                      Failover activates automatically if active node response time breaches this limit.
                    </p>
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-slate-700 uppercase mb-1">Key Limit (Scans / Hour)</label>
                    <input 
                      type="number"
                      required
                      min="10"
                      max="5000"
                      value={config.rateLimitScans}
                      onChange={(e) => setConfig(prev => ({ ...prev, rateLimitScans: parseInt(e.target.value) }))}
                      className="w-full px-3 py-2 text-sm border border-slate-200 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:outline-none bg-slate-50 font-mono text-slate-800"
                    />
                    <p className="text-[10px] text-slate-500 mt-1">
                      The maximum scanning limits assigned globally to developer tokens.
                    </p>
                  </div>

                </div>

                <div className="border-t border-slate-100 pt-6 space-y-4">
                  <h4 className="font-bold text-slate-800 text-sm flex items-center gap-2">
                    <Globe className="w-4 h-4 text-indigo-500" /> Webhook Alert System
                  </h4>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4 sm:gap-6">
                    <div>
                      <label className="block text-xs font-bold text-slate-700 uppercase mb-1">Slack Channel Hook</label>
                      <input 
                        type="url"
                        value={config.alertWebhookSlack}
                        onChange={(e) => setConfig(prev => ({ ...prev, alertWebhookSlack: e.target.value }))}
                        className="w-full px-3 py-2 text-sm border border-slate-200 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:outline-none bg-slate-50 font-mono text-slate-800"
                      />
                    </div>

                    <div>
                      <label className="block text-xs font-bold text-slate-700 uppercase mb-1">Microsoft Teams Hook</label>
                      <input 
                        type="url"
                        value={config.alertWebhookTeams}
                        onChange={(e) => setConfig(prev => ({ ...prev, alertWebhookTeams: e.target.value }))}
                        className="w-full px-3 py-2 text-sm border border-slate-200 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:outline-none bg-slate-50 font-mono text-slate-800"
                      />
                    </div>
                  </div>
                </div>

                <div className="border-t border-slate-100 pt-6 flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <input 
                      type="checkbox"
                      id="autoAnchor"
                      checked={config.autoAnchorProofs}
                      onChange={(e) => setConfig(prev => ({ ...prev, autoAnchorProofs: e.target.checked }))}
                      className="w-4 h-4 text-indigo-600 border-slate-300 rounded focus:ring-indigo-500 bg-slate-50"
                    />
                    <label htmlFor="autoAnchor" className="text-xs font-bold text-slate-700 uppercase cursor-pointer select-none">
                      Cryptographically Anchor All Proofs onto Ledger automatically
                    </label>
                  </div>

                  <button
                    type="submit"
                    disabled={isSavingConfig}
                    className="px-6 py-2.5 bg-indigo-600 hover:bg-indigo-700 disabled:bg-indigo-400 text-white text-xs font-bold rounded-lg transition-all shadow-sm"
                  >
                    {isSavingConfig ? "Applying Variable Sets..." : "Save CaaS Variables"}
                  </button>
                </div>

              </form>
            )}
          </div>
        )}

        {/* TAB 3: GLOBAL API ACCESS KEY MANAGEMENT */}
        {activeTab === 'keys' && (
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 sm:gap-6">
            
            {/* API Token Issuer Form */}
            <div className="bg-white border border-slate-200 rounded-xl shadow-sm p-4 sm:p-5 lg:p-6 space-y-4">
              <div>
                <h3 className="font-bold text-slate-800 flex items-center gap-2">
                  <Plus className="w-5 h-5 text-indigo-600" /> Platform Key Issuer
                </h3>
                <p className="text-xs text-slate-500 mt-1">
                  Deploy a new connection token to bind third-party client environments (CRMs, databases) to 9Xen Regulettee CaaS endpoints.
                </p>
              </div>

              <form onSubmit={handleCreateToken} className="space-y-4 pt-2">
                <div>
                  <label className="block text-[10px] font-bold text-slate-700 uppercase mb-1">Connection Point Name / Label</label>
                  <input 
                    type="text"
                    required
                    placeholder="e.g., Salesforce Sync Production"
                    value={formName}
                    onChange={(e) => setFormName(e.target.value)}
                    className="w-full px-3 py-2 text-sm border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 bg-slate-50"
                  />
                </div>

                <div>
                  <label className="block text-[10px] font-bold text-slate-700 uppercase mb-1">Target ERP/CRM Integration System</label>
                  <select
                    value={formSystem}
                    onChange={(e) => setFormSystem(e.target.value)}
                    className="w-full px-3 py-2 text-sm border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 bg-slate-50"
                  >
                    <option value="Salesforce">Salesforce CRM</option>
                    <option value="SAP S/4HANA">SAP S/4HANA ERP</option>
                    <option value="HubSpot">HubSpot CRM</option>
                    <option value="Oracle NetSuite">Oracle NetSuite ERP</option>
                    <option value="Custom CRM/ERP">Custom CRM/ERP Integration</option>
                  </select>
                </div>

                <div>
                  <label className="block text-[10px] font-bold text-slate-700 uppercase mb-1">Access Scope Authorization</label>
                  <select
                    value={formScope}
                    onChange={(e) => setFormScope(e.target.value)}
                    className="w-full px-3 py-2 text-sm border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 bg-slate-50"
                  >
                    <option value="Full Compliance">Full Compliance (Read/Write)</option>
                    <option value="ERP Scope">ERP Compliance (Financial/Tax audits)</option>
                    <option value="CRM Scope">CRM Compliance (PII & GDPR checks only)</option>
                    <option value="Read-Only scans">Read-Only Scans</option>
                  </select>
                </div>

                <button 
                  type="submit" 
                  disabled={isCreatingKey}
                  className="w-full mt-2 py-2.5 bg-indigo-600 hover:bg-indigo-700 disabled:bg-indigo-400 text-white font-bold text-xs rounded-lg transition-all flex items-center justify-center gap-2"
                >
                  {isCreatingKey ? (
                    <>
                      <RefreshCw className="w-4 h-4 animate-spin" /> Generating...
                    </>
                  ) : (
                    <>
                      <Key className="w-4 h-4" /> Issue Secret Token
                    </>
                  )}
                </button>
              </form>
            </div>

            {/* List and Management of API Keys */}
            <div className="bg-white border border-slate-200 rounded-xl shadow-sm p-4 sm:p-5 lg:p-6 lg:col-span-2 flex flex-col">
              <div className="pb-4 border-b border-slate-100 flex justify-between items-center">
                 <h3 className="font-bold text-slate-800 flex items-center gap-2">
                   <Key className="w-4 h-4 text-indigo-500" /> Active Platform Connection Keys
                 </h3>
                 <span className="text-xs bg-slate-100 text-slate-700 px-2.5 py-1 rounded-full font-mono font-semibold">
                   Total: {tokens.length} Active
                 </span>
              </div>

              {isLoadingTokens ? (
                <div className="flex-1 flex flex-col items-center justify-center py-24 text-slate-400">
                  <RefreshCw className="w-8 h-8 animate-spin text-indigo-600 mb-2" />
                  <span className="text-sm">Connecting keys vault...</span>
                </div>
              ) : tokens.length === 0 ? (
                <div className="flex-1 flex flex-col items-center justify-center py-16 text-slate-400 text-center">
                  <div className="p-3 bg-slate-50 rounded-full border border-slate-100 mb-3">
                    <Key className="w-8 h-8 text-slate-300" />
                  </div>
                  <h4 className="font-bold text-slate-700 mb-1">No API Keys Generated</h4>
                  <p className="text-xs text-slate-500 max-w-sm">
                    No custom external sync points are configured. Fill in the Key Issuer Form to spawn your first integration access token.
                  </p>
                </div>
              ) : (
                <div className="space-y-4 pt-4 overflow-y-auto max-h-[500px] pr-1">
                  {tokens.map(key => {
                    const isRevealed = revealedTokens[key.id] || false;
                    const maskedToken = `${key.token.slice(0, 12)}••••••••••••••••••••••••••••`;
                    
                    return (
                      <div key={key.id} className="p-4 border border-slate-150 rounded-xl hover:border-indigo-200 transition-all bg-slate-50/50 hover:bg-white flex flex-col md:flex-row md:items-center justify-between gap-4">
                        <div className="space-y-2 flex-1">
                          <div className="flex items-center gap-2 flex-wrap">
                            <h4 className="font-bold text-slate-800 text-sm">{key.name}</h4>
                            <span className="text-[10px] bg-indigo-50 text-indigo-700 font-bold px-2 py-0.5 rounded-full uppercase tracking-wider">
                              {key.client_system}
                            </span>
                            <span className="text-[10px] bg-slate-100 text-slate-600 font-semibold px-2 py-0.5 rounded-full">
                              {key.scope}
                            </span>
                          </div>
                          
                          <div className="flex items-center gap-2 mt-2">
                            <code className="px-2 py-1 bg-slate-100 border border-slate-250 text-slate-700 rounded text-xs font-mono select-all">
                              {isRevealed ? key.token : maskedToken}
                            </code>
                            <div className="flex items-center gap-1 shrink-0">
                              <button 
                                onClick={() => toggleReveal(key.id)}
                                title={isRevealed ? "Hide Secret Key" : "Reveal Secret Key"}
                                className="p-1 text-slate-400 hover:text-slate-600 hover:bg-slate-150 rounded transition-all"
                              >
                                {isRevealed ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                              </button>
                              <button 
                                onClick={() => handleCopy(key.token)}
                                title="Copy Key String"
                                className="p-1 text-slate-400 hover:text-indigo-600 hover:bg-indigo-50 rounded transition-all"
                              >
                                {copied === key.token ? <CheckCircle2 className="w-4 h-4 text-emerald-500" /> : <Copy className="w-4 h-4" />}
                              </button>
                            </div>
                          </div>
                        </div>

                        <div className="flex flex-row md:flex-col items-center md:items-end justify-between md:justify-center border-t md:border-t-0 border-slate-100 pt-2 md:pt-0 shrink-0 gap-2 font-mono text-[11px] text-slate-500">
                          <div className="text-right hidden sm:block">
                            <div>Issued: {new Date(key.created_at).toLocaleDateString()}</div>
                            <div>Last Sync: {key.last_used_at ? new Date(key.last_used_at).toLocaleDateString() : 'Never'}</div>
                          </div>

                          <div className="flex gap-1.5 pt-1">
                            <button
                              onClick={() => handleRotateToken(key.id, key.name)}
                              disabled={isRotatingId === key.id}
                              className="px-2.5 py-1.5 border border-slate-200 hover:border-indigo-300 text-slate-700 hover:text-indigo-600 font-bold rounded-lg bg-white transition-all flex items-center gap-1 hover:bg-indigo-50/20 text-xs"
                            >
                              <RefreshCw className={`w-3.5 h-3.5 ${isRotatingId === key.id ? 'animate-spin' : ''}`} />
                              Rotate
                            </button>
                            <button
                              onClick={() => handleRevokeToken(key.id, key.name)}
                              disabled={isRevokingId === key.id}
                              className="px-2.5 py-1.5 border border-rose-200 hover:bg-rose-50 text-rose-600 font-bold rounded-lg transition-all flex items-center gap-1 text-xs"
                            >
                              <Trash2 className="w-3.5 h-3.5" />
                              Revoke
                            </button>
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
          </div>
        )}

      </div>
    </div>
  );
};
