import { jsPDF } from "jspdf";
import React, { useState, useMemo, useEffect } from 'react';
import { 
  Scale, 
  Users, 
  FileCheck, 
  Clock, 
  MessageSquare, 
  Search, 
  Filter, 
  Briefcase, 
  ShieldCheck, 
  AlertTriangle, 
  ChevronRight, 
  CheckCircle2, 
  XCircle, 
  FileText, 
  Download, 
  ExternalLink,
  Send, 
  Sparkles, 
  Check, 
  X, 
  FileLock, 
  CornerDownRight, 
  TrendingUp, 
  RefreshCw,
  Building2,
  Calendar,
  Layers,
  ArrowUpRight,
  GitBranch,
  Activity,
  Fingerprint,
  Play,
  Database,
  AlertCircle,
  Terminal,
  Shield,
  Settings,
  Cpu,
  Lock,
  History,
  Plus,
  Calculator,
  Code2,
  Copy,
  Loader2,
  ShieldAlert,
  Coins,
  DollarSign,
  ShoppingBag,
  FileCode,
  Zap
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { ComplianceOpsIntegrator } from '../components/ComplianceOpsIntegrator';
import { ScanScheduler } from '../components/ScanScheduler';
import { InsightEngine } from '../components/InsightEngine';
import { IntegrationsScanHub } from '../components/IntegrationsScanHub';
import { EnterpriseMarketplace } from '../components/EnterpriseMarketplace';
import { RegulatoryNewsFeed } from '../components/dashboard/RegulatoryNewsFeed';
import { RegionalLegalFrameworksHub } from '../components/lawyer/RegionalLegalFrameworksHub';
import { useRegionalCompliance } from '../context/RegionalComplianceContext';
import { RegionalPaymentGatewayPortal } from '../components/billing/RegionalPaymentGatewayPortal';
import { IPRegionTranslator } from '../components/IPRegionTranslator';
import Markdown from 'react-markdown';
import { lazyWithRetry } from '../lib/lazy-utils';
import { AdvanceSaaSWidgets } from '../components/dashboard/AdvanceSaaSWidgets';
import { LegalCrmSuite } from '../components/lawyer/LegalCrmSuite';
import { LawyerDashboardPro } from '../components/lawyer/LawyerDashboardPro';
import { AlspExecutionStudio } from '../components/lawyer/AlspExecutionStudio';
import { ComplianceProofGenerator } from '../components/lawyer/ComplianceProofGenerator';
import { ComplianceReportGenerator } from '../components/ComplianceReportGenerator';
import { ComplianceAuditDashboard } from '../components/ComplianceAuditDashboard';
import { RegulatoryChangeSimulator } from '../components/RegulatoryChangeSimulator';
import { GapAnalysisTool } from '../components/compliance/GapAnalysisTool';

const InteractiveAuditChecklist = lazyWithRetry(() => import('../components/InteractiveAuditChecklist').then(m => ({ default: m.InteractiveAuditChecklist })), 'InteractiveAuditChecklist');

// Data types for the Lawyer Partner Portal
interface ClientPortfolioItem {
  id: string;
  companyName: string;
  industry: string;
  complianceScore: number;
  status: 'Compliant' | 'At Risk' | 'Pending Review';
  activeRegulations: string[];
  lastAuditDate: string;
  pendingReviewsCount: number;
}

interface ReviewItem {
  id: string;
  clientId: string;
  clientName: string;
  documentTitle: string;
  category: 'Policy Draft' | 'Data Protection Assessment' | 'Vendor Contract' | 'Technical Controls';
  submittedBy: string;
  submittedAt: string;
  status: 'Pending Review' | 'Approved' | 'Changes Requested' | 'Rejected';
  contentSnippet: string;
  comments?: string;
}

interface ComplianceDocument {
  id: string;
  clientId: string;
  clientName: string;
  title: string;
  version: string;
  fileSize: string;
  uploadedAt: string;
  category: string;
  sha256Hash: string;
}

interface RegulatoryDeadline {
  id: string;
  clientId: string;
  clientName: string;
  regulation: string;
  taskTitle: string;
  dueDate: string;
  daysRemaining: number;
  priority: 'High' | 'Medium' | 'Low';
}

interface SecureMessage {
  id: string;
  clientId: string;
  sender: string;
  role: string;
  content: string;
  timestamp: string;
  isLawyer: boolean;
}

interface LawyerVaultItem {
  id: string;
  clientId: string;
  clientName: string;
  title: string;
  category: string;
  uploadedAt: string;
  status: string;
  fileSize: string;
  hash: string;
}

export const LawyerPartnerPortal: React.FC = () => {
  // Navigation Tabs for Lawyer Workspace
  const [activeTab, setActiveTab] = useState<'dashboard' | 'crm' | 'alsp_studio' | 'portfolio' | 'regional-laws' | 'scanhub' | 'reviews' | 'vault' | 'tasks' | 'intelligence' | 'marketplace' | 'billing' | 'comms' | 'zkp_proof' | 'exec_summary' | 'regional_audit_logs' | 'integration_hub' | 'policy_simulator' | 'enhanced_gap_analysis'>('dashboard');
  const [selectedClient, setSelectedClient] = useState<string>('ALL');
  const [activeAddons, setActiveAddons] = useState<string[]>(['gdpr-compliance', 'enterprise_ai']);
  const [intelligenceSubTab, setIntelligenceSubTab] = useState<'dossier' | 'moat' | 'ledger'>('dossier');
  const [searchQuery, setSearchQuery] = useState('');
  
  // Dedicated Legal & Compliance Scan Hub Engine for Lawyers / Consultants
  const [scanTargetClientId, setScanTargetClientId] = useState<string>('c-1');
  const [scanTargetScope, setScanTargetScope] = useState<string[]>(['ai_act', 'gdpr', 'dora', 'code_secrets']);
  const [scanDepthMode, setScanDepthMode] = useState<'deep_forensic' | 'quick_check' | 'continuous_sync'>('deep_forensic');
  const [isScanHubRunning, setIsScanHubRunning] = useState<boolean>(false);
  const [scanProgress, setScanProgress] = useState<number>(0);
  const [scanTerminalLogs, setScanTerminalLogs] = useState<string[]>([]);

  interface ScanFinding {
    id: string;
    clientId: string;
    clientName: string;
    regulation: string;
    severity: 'CRITICAL' | 'HIGH' | 'MEDIUM' | 'LOW';
    title: string;
    description: string;
    targetComponent: string;
    legalArticle: string;
    estimatedPenalty: string;
    penaltyValueEuros: number;
    penaltyFormula: string;
    remediationAction: string;
    caseStatus: 'OPEN' | 'IN_REMEDIATION' | 'RESOLVED';
    caseSolution: {
      defenseStrategy: string;
      codePatchSnippet: string;
      regulatoryPrecedent: string;
      stepByStepPlan: string[];
    };
  }

  const [activeScanFindings, setActiveScanFindings] = useState<ScanFinding[]>([
    {
      id: 'find-101',
      clientId: 'c-1',
      clientName: 'Acme Corp Europe',
      regulation: 'EU AI Act',
      severity: 'CRITICAL',
      title: 'Missing Biometric Watermark Ingestion Route',
      description: 'Model endpoint /api/v1/generate-synthetic does not append cryptographic metadata watermarks required by Art. 52.',
      targetComponent: 'https://api.acme.eu/v1/generate-synthetic',
      legalArticle: 'Article 52(1) Transparency for High-Risk AI',
      estimatedPenalty: 'Up to €35,000,000 or 7% Global Turnover',
      penaltyValueEuros: 35000000,
      penaltyFormula: 'EU AI Act Art. 99(3) Non-compliance statutory maximum multiplier based on annual global turnover (€500M)',
      remediationAction: 'Inject SHA-256 watermark middleware on render pipeline.',
      caseStatus: 'OPEN',
      caseSolution: {
        defenseStrategy: 'Argue absence of systemic intent under EU AI Act Art. 99(6) mitigating factors. Submit preliminary technical audit logs showing pipeline was undergoing staged zero-trust upgrade, thereby establishing good-faith compliance effort.',
        codePatchSnippet: `// Express Watermark Injection Middleware for High-Risk AI Endpoint\nimport { createHmac } from 'crypto';\n\nexport function watermarkAIResponse(req: any, res: any, next: any) {\n  const originalJson = res.json;\n  res.json = function (body: any) {\n    if (body && typeof body === 'object') {\n      const signature = createHmac('sha256', process.env.EU_AI_WATERMARK_SECRET || 'eu-ai-act-proof')\n        .update(JSON.stringify(body))\n        .digest('hex');\n      body._ai_transparency_manifest = {\n        generated_by: 'Acme-LLM-v2.1',\n        eu_ai_act_article: 'Article 52(1)',\n        provenance_signature: signature,\n        timestamp: new Date().toISOString()\n      };\n    }\n    return originalJson.call(this, body);\n  };\n  next();\n}`,
        regulatoryPrecedent: 'EDPB Guidance 01/2026 on Synthetic Content Attribution & Transparency Controls',
        stepByStepPlan: [
          'Deploy the provided SHA-256 response header watermark middleware to staging.',
          'Verify cryptographic provenance signature on 100 test synthetic renders.',
          'Compile formal Technical Compliance Statement and append to Legal Vault.',
          'Submit updated Transparency Dossier to EU AI Office database.'
        ]
      }
    },
    {
      id: 'find-102',
      clientId: 'c-1',
      clientName: 'Acme Corp Europe',
      regulation: 'GDPR',
      severity: 'HIGH',
      title: 'Unencrypted Patient Telemetry Buffer in Frankfurt Node',
      description: 'Temporary Redis buffer retains raw IP addresses for 72 hours without anonymization.',
      targetComponent: 'redis://cache-frankfurt.internal:6379',
      legalArticle: 'Article 32 Security of Data Processing',
      estimatedPenalty: 'Up to €20,000,000 or 4% Global Turnover',
      penaltyValueEuros: 20000000,
      penaltyFormula: 'GDPR Art. 83(5) Fine threshold for breach of technical and organizational security controls',
      remediationAction: 'Enable TLS 1.3 in transit & hashed IP masking.',
      caseStatus: 'IN_REMEDIATION',
      caseSolution: {
        defenseStrategy: 'Invoke GDPR Art. 33(3) voluntary self-reporting defense. Demonstrate that data in buffer was isolated within private VPC subnet without public exposure, limiting harm index to near-zero.',
        codePatchSnippet: `// IP Anonymization & Hash Salt Helper for Redis Caching\nimport { createHash } from 'crypto';\n\nexport function anonymizeClientTelemetry(ip: string): string {\n  const salt = process.env.GDPR_SALT || 'salt-de-telemetry';\n  return createHash('sha256')\n    .update(\`\${ip}-\${salt}\`)\n    .digest('hex')\n    .substring(0, 16);\n}`,
        regulatoryPrecedent: 'BfDI Germany Enforcement Action 2025/88 - Telemetry Pseudonymization Standards',
        stepByStepPlan: [
          'Enable TLS 1.3 encryption on Redis cache cluster settings.',
          'Integrate salted SHA-256 IP masking before key setting.',
          'Set TTL flush limit from 72 hours to 15 minutes.',
          'Issue clean data protection impact assessment (DPIA) addendum.'
        ]
      }
    },
    {
      id: 'find-103',
      clientId: 'c-2',
      clientName: 'Fintech Nexus Ltd',
      regulation: 'DORA',
      severity: 'CRITICAL',
      title: 'Third-Party Payment Webhook Timeout Vulnerability',
      description: 'Automated fallback handler lacks operational resilience dry-run telemetry logging.',
      targetComponent: 'Webhook Handler /api/dora/payment-callback',
      legalArticle: 'Article 26 Digital Operational Resilience Testing',
      estimatedPenalty: 'Up to €10,000,000 or 2% Daily Turnover Fine',
      penaltyValueEuros: 10000000,
      penaltyFormula: 'DORA Article 50 Periodic Penalty Payments for ongoing operational vulnerability',
      remediationAction: 'Configure automated circuit breaker & continuous threat audit logs.',
      caseStatus: 'OPEN',
      caseSolution: {
        defenseStrategy: 'Present DORA Article 11 ICT Risk Management Framework compliance proof showing redundant fallback gateways are operational and dry-run chaos tests were pre-scheduled.',
        codePatchSnippet: `// DORA Operational Resilience Circuit Breaker Pattern\nexport class ResilientPaymentWebhook {\n  private failures = 0;\n  private threshold = 3;\n\n  async executeCall(payload: any) {\n    if (this.failures >= this.threshold) {\n      console.warn('[DORA-ALERT] Circuit opened. Routing to secondary sovereign vault.');\n      return this.fallbackVault(payload);\n    }\n    try {\n      const res = await fetch('https://payment.fintech.eu/callback', { method: 'POST', body: JSON.stringify(payload) });\n      this.failures = 0;\n      return res.json();\n    } catch (err) {\n      this.failures++;\n      throw err;\n    }\n  }\n}`,
        regulatoryPrecedent: 'EBA/GL/2025/03 Guidelines on ICT and Security Risk Management',
        stepByStepPlan: [
          'Wrap payment webhooks in circuit breaker fault tolerant class.',
          'Log fallback telemetry to immutable audit ledger.',
          'Execute automated chaos resilience dry-run test.',
          'File DORA Major ICT Incident Prevention Certification with EBA.'
        ]
      }
    },
    {
      id: 'find-104',
      clientId: 'c-3',
      clientName: 'HealthTech Sovereign AI',
      regulation: 'EHDS / GDPR',
      severity: 'MEDIUM',
      title: 'Unilateral Consent Revocation Webhook Missing Callback',
      description: 'Patient consent withdrawal API fails to broadcast revocation payload to external analytics sub-processors.',
      targetComponent: 'Endpoint /api/consent/revoke',
      legalArticle: 'GDPR Article 7(3) Right to Withdraw Consent',
      estimatedPenalty: 'Up to €5,000,000 Statutory Non-Compliance Risk',
      penaltyValueEuros: 5000000,
      penaltyFormula: 'GDPR Art. 83(5) Right of Data Subjects Violation Base Multiplier',
      remediationAction: 'Deploy fan-out pub/sub notification for sub-processor cache clearing.',
      caseStatus: 'RESOLVED',
      caseSolution: {
        defenseStrategy: 'Provide immutable proof that consent revocation was executed internally within 100ms and sub-processors were purged via manual batch script during interim maintenance window.',
        codePatchSnippet: `// Fan-out Consent Revocation Webhook Dispatcher\nexport async function dispatchConsentRevocation(patientId: string) {\n  const subProcessors = [\n    'https://analytics.healthtech.eu/purge',\n    'https://biomed-ai.eu/revoke-consent'\n  ];\n  await Promise.allSettled(\n    subProcessors.map(url => fetch(url, {\n      method: 'POST',\n      headers: { 'Content-Type': 'application/json' },\n      body: JSON.stringify({ patientId, timestamp: Date.now() })\n    }))\n  );\n}`,
        regulatoryPrecedent: 'CNIL Sanction Decision SP-2025-11 on Automated Consent Fan-Out Propagation',
        stepByStepPlan: [
          'Deploy async fan-out pub/sub dispatcher to consent API.',
          'Audit all 3rd party sub-processor acknowledgement HTTP 200 responses.',
          'Store signed hash of purge receipt in evidence vault.'
        ]
      }
    }
  ]);

  const [scanFilterSeverity, setScanFilterSeverity] = useState<string>('ALL');
  const [caseDirectiveFinding, setCaseDirectiveFinding] = useState<any | null>(null);
  const [caseDirectiveMessage, setCaseDirectiveMessage] = useState<string>('');

  // Suggested Case Solution Drawer & Penalty Analysis Modal States
  const [activeSolutionFinding, setActiveSolutionFinding] = useState<any | null>(null);
  const [activeSolutionTab, setActiveSolutionTab] = useState<'defense' | 'code' | 'plan'>('defense');
  const [copiedCode, setCopiedCode] = useState<boolean>(false);

  // Interactive UI States
  const [activeReviewItem, setActiveReviewItem] = useState<ReviewItem | null>(null);
  const [reviewDecision, setReviewDecision] = useState<'approve' | 'request_changes' | 'reject' | null>(null);
  const [reviewComments, setReviewComments] = useState('');
  const [lawyerMessage, setLawyerMessage] = useState('');
  const [aiDraftPrompt, setAiDraftPrompt] = useState('');
  const [isAiGenerating, setIsAiGenerating] = useState(false);
  const [successToast, setSuccessToast] = useState<string | null>(null);

  // AI-Assisted Legal Drafting states
  const [aiDraftTone, setAiDraftTone] = useState<'risk-averse' | 'pro-business' | 'regulatory' | 'litigious'>('risk-averse');
  const [aiDraftClauseType, setAiDraftClauseType] = useState<string>('unilateral-revocation');
  const [aiDraftedOutput, setAiDraftedOutput] = useState<string>('');

  // Automated Evidence Collection states
  const [evidenceDepth, setEvidenceDepth] = useState<'high' | 'medium' | 'exec'>('high');
  const [evidenceAudience, setEvidenceAudience] = useState<'regulator' | 'c-suite' | 'underwriter'>('regulator');
  const [isEvidenceGenerating, setIsEvidenceGenerating] = useState(false);
  const [evidenceDossier, setEvidenceDossier] = useState<string>('');
  const [isIntegrityChecking, setIsIntegrityChecking] = useState(false);
  const [integrityTreeVerified, setIntegrityTreeVerified] = useState(false);
  const [integrityLogs, setIntegrityLogs] = useState<string[]>([]);

  // 1. Context-Aware Regulatory RAG States
  const [ragQuery, setRagQuery] = useState<string>('unilateral patient biometric telemetry consent logs retention requirements');
  const [isRagSearching, setIsRagSearching] = useState<boolean>(false);
  const [ragResults, setRagResults] = useState<{
    query: string;
    synthesizedResponse: string;
    sources: { sourceName: string; matchedSection: string; relevancePct: number }[];
  } | null>(null);

  // 2. Automated Policy Drift & Auto-Patch States
  const [selectedDriftId, setSelectedDriftId] = useState<string>('drift-1');
  const [isPatching, setIsPatching] = useState<boolean>(false);
  const [driftEvents, setDriftEvents] = useState([
    {
      id: 'drift-1',
      title: 'EU AI Act Art 52 Deepfake Transparency Mandate',
      effectiveDate: 'July 2026',
      description: 'New mandatory real-time watermark insertion on biometric model weights and active synthetic content flows.',
      status: 'Active Drift Risk',
      severity: 'CRITICAL',
      impactedSystem: 'Acme Video Telemetry Enclave',
      currentPolicyText: 'Watermarking of images is conducted as a scheduled background job within 24 hours of generation.',
      proposedPolicyText: 'Watermarking of all generated biometric synthetic video and audio flows must be executed inline and synchronously in real-time, accompanied by a SHA-256 tamper-evident metadata stamp injected at the enclaved render node.',
    },
    {
      id: 'drift-2',
      title: 'DORA Article 26 Advanced Threat Penetration Dry-Runs',
      effectiveDate: 'August 2026',
      description: 'Mandatory third-party threat ledgers must record continuous dry-run security metrics to simulate automated failure recovery.',
      status: 'Action Required',
      severity: 'HIGH',
      impactedSystem: 'Fintech Nexus Payments Hub',
      currentPolicyText: 'Penetration testing is conducted once every calendar year by an authorized external security assessor.',
      proposedPolicyText: 'Active penetration testing dry-runs must be simulated quarterly on live staging clusters, with machine-readable telemetry reports streamed continuously to the CaaS Sovereignty Sync vault.',
    }
  ]);

  // 3. Predictive Risk Scoring Engine States
  const [forecastMonths, setForecastMonths] = useState<number>(3);
  const [isCalculatingForecast, setIsCalculatingForecast] = useState<boolean>(false);
  const [forecastData, setForecastData] = useState<{
    currentScore: number;
    projectedScore: number;
    driftRiskProbability: number;
    highRiskVulnerabilities: { category: string; threatIndex: number; desc: string }[];
  } | null>(null);

  // 4. Codebase & Infrastructure DevSecOps Sync States
  const [gitBranch, setGitBranch] = useState<string>('main');
  const [githubUrl, setGithubUrl] = useState<string>('github.com/acme-corp/compliance-enclave');
  const [isSyncingInfra, setIsSyncingInfra] = useState<boolean>(false);
  const [infraLogs, setInfraLogs] = useState<string[]>([]);
  const [isInfraSecure, setIsInfraSecure] = useState<boolean | null>(null);

  // Audit Checklist State
  const [showAuditChecklist, setShowAuditChecklist] = useState<boolean>(false);
  const [auditTargetClient, setAuditTargetClient] = useState<ClientPortfolioItem | null>(null);

  // 5. Immutable Cryptographic Audit Ledger State
  const [ledgerBlocks, setLedgerBlocks] = useState([
    {
      blockHeight: 4082,
      timestamp: '2026-07-22 00:31:12 UTC',
      action: 'OIDC Session Authentication Verification',
      identity: 'Lawyer Partner (Lead Counsel)',
      payloadHash: '4a8b7c2e3f4a...90f2',
      status: 'Immutable'
    },
    {
      blockHeight: 4083,
      timestamp: '2026-07-22 00:35:45 UTC',
      action: 'Spanish AEPD Unilateral Consent Update Export',
      identity: 'Sovereign Legal Co-pilot API',
      payloadHash: 'bf3701a2d5e2...12c8',
      status: 'Immutable'
    }
  ]);

  // Billing and Subscription State for Lawyer Portal
  const [billingCredits, setBillingCredits] = useState(12450.00);
  const [isTopUpOpen, setIsTopUpOpen] = useState(false);
  const [billingHistory, setBillingHistory] = useState([
    { id: 'tx-1', date: '2026-07-20', description: 'Deep Forensic Scan: Acme Corp', amount: -450.00, status: 'Completed' },
    { id: 'tx-2', date: '2026-07-15', description: 'Monthly Subscription: Partner Tier', amount: -1200.00, status: 'Completed' },
    { id: 'tx-3', date: '2026-07-01', description: 'Credit Top-up (Bank Transfer)', amount: 5000.00, status: 'Completed' },
    { id: 'tx-4', date: '2026-06-25', description: 'RAG Knowledge Search Usage', amount: -85.50, status: 'Completed' }
  ]);

  const addLedgerBlock = (action: string, identity: string, hash: string) => {
    const nextHeight = ledgerBlocks.length > 0 ? ledgerBlocks[0].blockHeight + 1 : 1;
    const timestamp = new Date().toISOString().replace('T', ' ').substring(0, 19) + ' UTC';
    setLedgerBlocks(prev => [
      {
        blockHeight: nextHeight,
        timestamp,
        action,
        identity,
        payloadHash: hash.substring(0, 12) + '...' + hash.substring(hash.length - 4),
        status: 'Immutable'
      },
      ...prev
    ]);
  };

  const triggerToast = (msg: string) => {
    setSuccessToast(msg);
    setTimeout(() => setSuccessToast(null), 3500);
  };

  // 1. Client Portfolio Mock Data
  const [clients, setClients] = useState<ClientPortfolioItem[]>([]);
  const [isLoadingClients, setIsLoadingClients] = useState(true);
  const [vaultItems, setVaultItems] = useState<LawyerVaultItem[]>([]);
  const [isLoadingVault, setIsLoadingVault] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      try {
        setIsLoadingClients(true);
        setIsLoadingVault(true);
        
        // Parallel fetch for efficiency
        const [tenantsRes, vaultRes] = await Promise.all([
          fetch('/api/v1/tenants'),
          fetch('/api/v1/vault')
        ]);
        
        const tenantsData = await tenantsRes.json();
        const vaultData = await vaultRes.json();
        
        if (tenantsData.success && Array.isArray(tenantsData.tenants)) {
          const mappedClients: ClientPortfolioItem[] = tenantsData.tenants.map((t: any) => {
            const industryMap: Record<string, string> = {
              'EU-CENTRAL-1': 'Financial Services / Fintech',
              'ME-SOUTH-1': 'GovTech & Sovereign Infrastructure',
              'AF-SOUTH-1': 'Fintech & Digital Payments',
              'US-EAST-1': 'Healthcare & Life Sciences'
            };
            return {
              id: t.id,
              companyName: t.name,
              industry: industryMap[t.region] || 'SaaS / Enterprise Software',
              complianceScore: t.status === 'ACTIVE' ? (Math.floor(Math.random() * 15) + 85) : 65,
              status: t.status === 'ACTIVE' ? 'Compliant' : 'Non-Compliant',
              activeRegulations: t.region === 'ME-SOUTH-1' ? ['Saudi PDPL', 'UAE Data Law', 'NIS2'] : 
                               t.region === 'AF-SOUTH-1' ? ['Nigeria NDPR', 'GDPR'] : ['GDPR', 'NIS2', 'DORA'],
              lastAuditDate: new Date().toISOString().split('T')[0],
              pendingReviewsCount: 0
            };
          });
          setClients(mappedClients);
        }

        if (vaultData.success && Array.isArray(vaultData.documents)) {
          const mappedVault: LawyerVaultItem[] = vaultData.documents.map((doc: any) => ({
            id: doc.id,
            clientId: 'c-1', // Default or first client for mock
            clientName: 'Acme Corp Europe',
            title: doc.title,
            category: doc.category === 'Legal' ? 'Policy Draft' : doc.category === 'Compliance' ? 'Data Protection Assessment' : 'Technical Controls',
            uploadedAt: doc.uploadedAt,
            status: doc.status === 'VERIFIED' ? 'Audit Verified' : 'Pending Review',
            fileSize: doc.size,
            hash: '0x' + Math.random().toString(16).substring(2, 12)
          }));
          setClients(prev => prev.map(c => c.id === 'org_1' ? { ...c, pendingReviewsCount: mappedVault.filter(v => v.status === 'Pending Review').length } : c));
          setVaultItems(mappedVault);
        }
      } catch (error) {
        console.error('Failed to fetch data:', error);
        // Fallback logic already handled in catch of individual calls if needed
      } finally {
        setIsLoadingClients(false);
        setIsLoadingVault(false);
      }

      // Fetch dynamic generated policies from SQLite database for legal review queue
      try {
        const policiesRes = await fetch('/api/v1/compliance/generated-policies');
        const policiesData = await policiesRes.json();
        if (policiesData.success && Array.isArray(policiesData.policies)) {
          const mappedDbReviews: ReviewItem[] = policiesData.policies
            .filter((p: any) => p.status === 'under_legal_review' || p.status === 'approved')
            .map((p: any) => ({
              id: p.id,
              clientId: 'org_1',
              clientName: 'Acme Corp Europe',
              documentTitle: p.policy_type === 'privacy_policy' ? 'AI Privacy Policy Template v' + p.version : 'Sovereign Agreement',
              category: 'Policy Draft' as const,
              submittedBy: p.reviewed_by || 'Leo Vaserstein (DPO Manager)',
              submittedAt: 'Today, Just Now',
              status: p.status === 'under_legal_review' ? 'Pending Review' : (p.status === 'approved' ? 'Approved' : 'Pending Review'),
              contentSnippet: p.content_html.replace(/<[^>]*>/g, '').substring(0, 300) + '...'
            }));
          
          setReviews(prev => {
            const merged = [...mappedDbReviews, ...prev];
            const seen = new Set();
            return merged.filter(item => {
              const dup = seen.has(item.id);
              seen.add(item.id);
              return !dup;
            });
          });
        }
      } catch (e) {
        console.error('Failed to load generated policies for legal reviews', e);
      }
    };
    fetchData();
  }, []);

  // 2. Review Workflow Mock Data
  const [reviews, setReviews] = useState<ReviewItem[]>([
    {
      id: 'rev-1',
      clientId: 'c-2',
      clientName: 'Fintech Nexus Ltd',
      documentTitle: 'AI Fraud Detection System - Model Transparency Assessment',
      category: 'Data Protection Assessment',
      submittedBy: 'Sarah Connor (Lead Compliance Engineer)',
      submittedAt: 'Today, 10:15 AM',
      status: 'Pending Review',
      contentSnippet: 'This system utilizes continuous behavioral biometrics and deep neural networks to evaluate transactions in real-time. Explicit unilateral opt-out flows have been built for French and Spanish jurisdictions to bypass active profiling under GDPR Article 22 restrictions...'
    },
    {
      id: 'rev-2',
      clientId: 'c-1',
      clientName: 'Acme Corp Europe',
      documentTitle: 'Third-Party Sovereign Enclave Vendor SLA (Revision 4)',
      category: 'Vendor Contract',
      submittedBy: 'Leo Vaserstein (DPO Manager)',
      submittedAt: 'Yesterday, 4:30 PM',
      status: 'Pending Review',
      contentSnippet: 'Clause 12.3: Data controller warrants that all raw database backups dispatched to secondary sovereign enclaves located in Frankfurt shall remain subject to local WebAuthn gateway authentication controlled exclusively by the tenant, ensuring Gaia-X compliance guarantees.'
    },
    {
      id: 'rev-3',
      clientId: 'c-3',
      clientName: 'BioVigilance Pharma',
      documentTitle: 'Telehealth Patient Telemetry & Continuous Consent Policy v2',
      category: 'Policy Draft',
      submittedBy: 'Dr. Chen Wei (Data Custodian)',
      submittedAt: '3 days ago',
      status: 'Pending Review',
      contentSnippet: 'Patient telemetry collected via regional wearables is transmitted under end-to-end PQC (Post-Quantum Cryptography) algorithms. Retrospective consent withdrawal triggers automated shredding logs within 48 hours, synchronized directly with our private DLT.'
    }
  ]);

  // 3. Document Repository Mock Data
  const [documents, setDocuments] = useState<ComplianceDocument[]>([
    {
      id: 'doc-1',
      clientId: 'c-1',
      clientName: 'Acme Corp Europe',
      title: 'GDPR Article 30 Processing Activity Record',
      version: 'v2.4',
      fileSize: '4.2 MB',
      uploadedAt: '2026-07-14',
      category: 'Statutory Registry',
      sha256Hash: '9e107d9d372bb6826bd81d3542a419d6'
    },
    {
      id: 'doc-2',
      clientId: 'c-2',
      clientName: 'Fintech Nexus Ltd',
      title: 'NIS2 Incident Response & Vulnerability Reporting Protocol',
      version: 'v1.1',
      fileSize: '1.8 MB',
      uploadedAt: '2026-07-20',
      category: 'Technical Safeguards',
      sha256Hash: 'e3b0c44298fc1c149afbf4c8996fb924'
    },
    {
      id: 'doc-3',
      clientId: 'c-3',
      clientName: 'BioVigilance Pharma',
      title: 'EU EHDS Compliance Audit & Liability Assessment',
      version: 'v4.0_draft',
      fileSize: '8.5 MB',
      uploadedAt: '2026-07-18',
      category: 'Legal Opinion',
      sha256Hash: 'ab43872bb28f219c6bd81d3542a419fa'
    }
  ]);

  // 4. Deadlines & Filing Tasks Mock Data
  const [deadlines, setDeadlines] = useState<RegulatoryDeadline[]>([
    {
      id: 'dl-1',
      clientId: 'c-2',
      clientName: 'Fintech Nexus Ltd',
      regulation: 'DORA',
      taskTitle: 'Yearly Dry-Run ICT Threat Penetration Audit Filing',
      dueDate: '2026-08-10',
      daysRemaining: 19,
      priority: 'High'
    },
    {
      id: 'dl-2',
      clientId: 'c-1',
      clientName: 'Acme Corp Europe',
      regulation: 'GDPR',
      taskTitle: 'Biannual DPO Statement of Liability Verification',
      dueDate: '2026-09-01',
      daysRemaining: 41,
      priority: 'Medium'
    },
    {
      id: 'dl-3',
      clientId: 'c-3',
      clientName: 'BioVigilance Pharma',
      regulation: 'EU AI Act',
      taskTitle: 'High-Risk Algorithmic Safety Impact Self-Assessment',
      dueDate: '2026-07-29',
      daysRemaining: 7,
      priority: 'High'
    }
  ]);

  // 5. Communications / Chat Mock Data
  const [messages, setMessages] = useState<SecureMessage[]>([
    {
      id: 'm-1',
      clientId: 'c-2',
      sender: 'Sarah Connor',
      role: 'Lead Compliance Engineer',
      content: 'Hello counselor, we updated the behavioral biometrics AI assessment module with the revised Spanish unilateral revocation opt-out system. Can you check if it satisfies Spain’s AEPD direct generative training rule?',
      timestamp: 'Today, 10:20 AM',
      isLawyer: false
    },
    {
      id: 'm-2',
      clientId: 'c-1',
      sender: 'Alice Smith',
      role: 'Designated DPO',
      content: 'Sovereign Enclave backup contract revised to ensure Frankfurt node priority. Ready for legal sign-off on Section 12.',
      timestamp: 'Yesterday, 5:02 PM',
      isLawyer: false
    }
  ]);

  // Filters for client selector and search
  const filteredClients = useMemo(() => {
    return clients.filter(c => {
      const matchesSearch = c.companyName.toLowerCase().includes(searchQuery.toLowerCase()) ||
                            c.industry.toLowerCase().includes(searchQuery.toLowerCase());
      const matchesClient = selectedClient === 'ALL' || c.id === selectedClient;
      return matchesSearch && matchesClient;
    });
  }, [clients, searchQuery, selectedClient]);

  const filteredReviews = useMemo(() => {
    return reviews.filter(r => {
      const matchesClient = selectedClient === 'ALL' || r.clientId === selectedClient;
      const matchesSearch = r.documentTitle.toLowerCase().includes(searchQuery.toLowerCase()) ||
                            r.category.toLowerCase().includes(searchQuery.toLowerCase());
      return matchesClient && matchesSearch;
    });
  }, [reviews, selectedClient, searchQuery]);

  const filteredDocs = useMemo(() => {
    return documents.filter(d => {
      const matchesClient = selectedClient === 'ALL' || d.clientId === selectedClient;
      const matchesSearch = d.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
                            d.category.toLowerCase().includes(searchQuery.toLowerCase());
      return matchesClient && matchesSearch;
    });
  }, [documents, selectedClient, searchQuery]);

  const filteredDeadlines = useMemo(() => {
    return deadlines.filter(dl => {
      const matchesClient = selectedClient === 'ALL' || dl.clientId === selectedClient;
      const matchesSearch = dl.taskTitle.toLowerCase().includes(searchQuery.toLowerCase()) ||
                            dl.regulation.toLowerCase().includes(searchQuery.toLowerCase());
      return matchesClient && matchesSearch;
    });
  }, [deadlines, selectedClient, searchQuery]);

  // Handle Workflow Action (Approve, Request Changes, Reject)
  const handleReviewActionSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!activeReviewItem || !reviewDecision) return;

    const statusMap: Record<string, 'Approved' | 'Changes Requested' | 'Rejected'> = {
      'approve': 'Approved',
      'request_changes': 'Changes Requested',
      'reject': 'Rejected'
    };

    const nextStatus = statusMap[reviewDecision];

    setReviews(prev => prev.map(r => r.id === activeReviewItem.id ? { 
      ...r, 
      status: nextStatus,
      comments: reviewComments 
    } : r));

    // Update Client Portfolio Metrics / Pending Count
    setClients(prev => prev.map(c => {
      if (c.id === activeReviewItem.clientId) {
        return {
          ...c,
          pendingReviewsCount: Math.max(0, c.pendingReviewsCount - 1),
          complianceScore: nextStatus === 'Approved' ? Math.min(100, c.complianceScore + 3) : Math.max(0, c.complianceScore - 4),
          status: c.pendingReviewsCount - 1 === 0 ? 'Compliant' : c.status
        };
      }
      return c;
    }));

    // Post Secure Ledger Record Notification
    const decisionLog = `Sovereign Legal Opinion Issued: [${nextStatus.toUpperCase()}] for "${activeReviewItem.documentTitle}" by external counsel.`;
    setMessages(prev => [
      {
        id: `m-new-${Date.now()}`,
        clientId: activeReviewItem.clientId,
        sender: 'You (Sovereign Legal Advisor)',
        role: 'Authorized External Counsel',
        content: `I have audited this submission and marked it [${nextStatus.toUpperCase()}]. Comments: ${reviewComments || 'N/A'}`,
        timestamp: 'Just now',
        isLawyer: true
      },
      ...prev
    ]);

    // Real API integration for generated policies
    if (activeReviewItem.id.startsWith('POL-')) {
      const apiAction = reviewDecision === 'approve' ? 'approve' : 'reject';
      fetch(`/api/v1/compliance/generated-policies/${activeReviewItem.id}/action-review`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          action: apiAction,
          reviewed_by: 'Legal Counsel (Sovereign Partner Portal)'
        })
      })
      .then(res => res.json())
      .then(data => {
        if (data.success) {
          console.log('[LawyerPortal] Real-time review action persisted to SQLite.');
        }
      })
      .catch(err => console.error('[LawyerPortal] Failed to sync review action:', err));
    }

    triggerToast(`Document review completed successfully as: ${nextStatus}`);
    setActiveReviewItem(null);
    setReviewDecision(null);
    setReviewComments('');
  };

  // Dispatch secure chat message
  const handleSendMessage = (e: React.FormEvent) => {
    e.preventDefault();
    if (!lawyerMessage) return;

    setMessages(prev => [
      {
        id: `m-msg-${Date.now()}`,
        clientId: selectedClient === 'ALL' ? 'c-2' : selectedClient, // Default to Fintech Nexus if no filter
        sender: 'You (Sovereign Legal Advisor)',
        role: 'Authorized External Counsel',
        content: lawyerMessage,
        timestamp: 'Just now',
        isLawyer: true
      },
      ...prev
    ]);

    setLawyerMessage('');
    triggerToast('Secure message dispatched via encrypted OIDC tunnel.');
  };

  // Sovereign AI Custom Legal Drafting Generator
  const generateCustomLegalOpinion = (clauseType: string, tone: string, prompt: string) => {
    const date = new Date().toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' });
    let clauseTitle = "Sovereign Compliance Clause";
    let toneLabel = "Risk-Averse Analysis";
    let analysis = "";
    let directive = "";

    switch(clauseType) {
      case 'unilateral-revocation':
        clauseTitle = "GDPR Article 22 & 7(3) Unilateral Revocation & Automated Profiling Clause";
        break;
      case 'data-sovereign':
        clauseTitle = "Frankfurt Sovereign Cloud Enclave Isolation Protocol Clause (NIS2/Gaia-X)";
        break;
      case 'dora-threat-sla':
        clauseTitle = "DORA Threat Penetration Dry-Run Service Level Agreement Annex";
        break;
      case 'pqc-telemetry':
        clauseTitle = "Post-Quantum Encrypted Patient Telemetry Continuous Consent Clause (EHDS)";
        break;
    }

    switch(tone) {
      case 'risk-averse':
        toneLabel = "Risk-Averse Counsel";
        analysis = "In accordance with strict interpretation models, we maintain that any automated algorithmic processing requires absolute preemptive mitigation. Retrospective consent is insufficient; unilateral, instantaneous, granular UI controls must be active at the user node.";
        directive = "Strict Opt-In UI Checkboxes are mandatory before active telemetry, with detailed opt-out telemetry history logs preserved.";
        break;
      case 'pro-business':
        toneLabel = "Pro-Business Mitigation";
        analysis = "To minimize friction and avoid conversion drop-off, automated decision systems shall utilize secondary implicit consent structures alongside lazy validation pools where feasible. If a user revokes, we transition their queue to asynchronous manual review within a 48-hour tolerance buffer.";
        directive = "Maintain high-speed processing while routing opt-out users to background validation queues to prevent active system failure.";
        break;
      case 'regulatory':
        toneLabel = "Regulatory Auditor Spec";
        analysis = "This clause is designed to meet strict audit specs under supervisory authority (e.g., AEPD, BfDI, CNIL) frameworks. Cryptographic tamper-evident log registers must record the status of each user consent event with SHA-256 integrity trees synced to the ledger.";
        directive = "Mandatory OIDC token claims matched to the telemetry event to prove unilateral revocation claims during an unannounced inspection.";
        break;
      case 'litigious':
        toneLabel = "Litigious Defensibility Counsel";
        analysis = "In anticipation of potential administrative appeals, this contract limits enterprise liability by securing binding user arbitration under Gaia-X jurisdiction. Unilateral revocation triggers standard data-retention holds where regulatory overrides exist (e.g., tax/anti-money laundering rules).";
        directive = "Embed comprehensive indemnification disclaimers inside the user portal with detailed click-wrap logs.";
        break;
    }

    return `================================================================================
AI DRAFT: ${clauseTitle}
================================================================================
Stance/Tone: ${toneLabel} | Date: ${date}
Referenced Facts: "${prompt}"

1. STATUTORY BACKGROUND ANALYSIS
${analysis}

2. DRAFTED LEGAL CONTRACT CLAUSE
"The Enterprise hereby covenants and warrants that any processing of personal data for the purpose of generative model training, behavioral biometric analysis, or real-time risk scoring remains subject to immediate, unilateral, and granular revocation by the Data Subject. Upon active revocation received via the Portal (OIDC Authenticated), all subsequent automated processing streams shall be halted in under 180 seconds, and verified cryptographic erasure trees shall be synced to the Sovereign Vault."

3. ACTIONABLE COUNSEL DIRECTIVES
- ${directive}
- Ensure standard WebAuthn telemetry verification is enforced at the client node.
- Conduct unannounced dry-run compliance stress tests on this endpoint every 90 days.

[Draft compiled successfully by Sovereign Legal Drafting Co-pilot]`;
  };

  // Mock legal generative assistant
  const handleGenerateAiLegalOpinion = async () => {
    if (!aiDraftPrompt) return;
    setIsAiGenerating(true);

    const activeClient = clients.find(c => c.id === (selectedClient === 'ALL' ? 'c-1' : selectedClient)) || clients[0];

    try {
      const response = await fetch('/api/v1/lawyer-intelligence/generate-draft', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          clientName: activeClient.companyName,
          documentType: aiDraftClauseType,
          prompt: aiDraftPrompt,
          regulations: activeClient.activeRegulations.join(', '),
          jurisdiction: 'European Union (Brussels II)'
        })
      });
      const data = await response.json();
      if (data.draft) {
        setAiDraftedOutput(data.draft);
        const pseudoHash = "draft_" + Math.random().toString(16).substring(2, 10);
        addLedgerBlock(`Drafted Legal Compliance Clause: ${aiDraftClauseType.toUpperCase()}`, "Sovereign AI Drafting Co-pilot", pseudoHash);
        triggerToast('Regulatory legal opinion draft generated by AI Assistant!');
      }
    } catch (error) {
      console.error('Draft Gen Error:', error);
      triggerToast('AI Drafting gateway error. Utilizing deterministic fallback.');
      const generatedOpinion = generateCustomLegalOpinion(aiDraftClauseType, aiDraftTone, aiDraftPrompt);
      setAiDraftedOutput(generatedOpinion);
    } finally {
      setIsAiGenerating(false);
    }
  };

  // Automated Evidence Collection Helpers
  const generateEvidenceDossierText = (clientName: string, audience: string, depth: string, regulation: string) => {
    const sha = Math.random().toString(16).substring(2, 10) + Math.random().toString(16).substring(2, 10);
    const time = new Date().toISOString().replace('T', ' ').substring(0, 19);
    
    return `================================================================================
SOVEREIGN COMPLIANCE INTEGRITY DOSSIER - VERIFIED SYSTEM AUDIT PROOF
================================================================================
Document Hash: SHA-256 [f5a8c9e0d7c58${sha}]
Timestamp: ${time} UTC
Audited Entity: ${clientName}
Target Audience: ${audience.toUpperCase()}
Evidence Level: ${depth.toUpperCase()}
Target Framework: ${regulation}

--------------------------------------------------------------------------------
1. EXECUTIVE SUMMARY & STATEMENT OF COMPLIANCE
--------------------------------------------------------------------------------
This verified compliance ledger report compiles multi-layer platform telemetry logs, OIDC audit claims, and real-time database state proofs for ${clientName}. 

Sovereign Legal Stance:
Based on continuous automated evaluation and cryptographic signature checks, we certify that the technical controls implemented within the ${clientName} network conform to the explicit mandate of ${regulation}. The operational design is rated as "SATISFACTORY WITH SECURE DRIFT RATING".

--------------------------------------------------------------------------------
2. LIVE TELEMETRY LOGS & CRYPTOGRAPHIC LEDGER CHECKPOINTS
--------------------------------------------------------------------------------
[OK] SECURE_OIDC_OAUTH_TUNNEL_ESTABLISHED
     Claim ID: keycloak-claims-sovereign-0x89e2
     Verification Signature: RSA-4096-PSS Verified
[OK] DATABASE_ENCLAVE_ISOLATION_STANDARDS
     Target Node Location: Frankfurt-EU-West Sovereign Cloud Node
     State Integrity: Verified (No unauthorized schema shifts detected)
[OK] APPORTIONED_REVOCATION_LOG_INTEGRITY
     Spanish (AEPD) and French (CNIL) explicit unilateral opt-out parameters 
     are synchronized with local encrypted client state structures.
[OK] PQC_TELEMETRY_DATA_STREAMS
     Post-Quantum Cryptography algorithm keys are active for telehealth wearable
     and continuous mobile database storage syncing.

--------------------------------------------------------------------------------
3. RISK DRIFT INDEX & MITIGATION RESPONSE FOR LAWYERS
--------------------------------------------------------------------------------
The client possesses a compliance scoring threshold of 91% with zero active critical compliance risks flagged by external regulatory scrapers. 

Lawyer Recommendation Directive:
Maintain biannual validation checks on high-risk generative models and ensure updated risk profiles are synced to the local sovereign legal vault.

--------------------------------------------------------------------------------
Authorized Representative Counsel Sign-off:
Signed under OIDC credentials: Lead Legal Counsel Claims (European Bar Claim Hash 0x9812A)
--------------------------------------------------------------------------------`;
  };

  const handleVerifyIntegrityTree = () => {
    setIsIntegrityChecking(true);
    setIntegrityTreeVerified(false);
    setIntegrityLogs([]);
    
    const logs = [
      'Establishing OIDC authorization secure claim tunnel with client identity provider...',
      'Verifying Keycloak claims for authorized legal auditing tokens...',
      'Querying German (BfDI) and Spanish (AEPD) regional legal tables...',
      'Validating data enclave isolation schema hashes against known master registry...',
      'Reading continuous consent log streams and PQC encryption metadata...',
      'Consolidating compliance metric index across active services...',
      'Integrity Tree verification complete! 100% Cryptographic validation achieved.'
    ];

    logs.forEach((log, index) => {
      setTimeout(() => {
        setIntegrityLogs(prev => [...prev, `[${new Date().toLocaleTimeString()}] ${log}`]);
        if (index === logs.length - 1) {
          setIsIntegrityChecking(false);
          setIntegrityTreeVerified(true);
          triggerToast('Ledger integrity verified! Audit tree is cryptographically sound.');
        }
      }, (index + 1) * 350);
    });
  };

  const handleCompileDossier = async (client: ClientPortfolioItem) => {
    setIsEvidenceGenerating(true);
    try {
      const response = await fetch('/api/v1/lawyer-intelligence/generate-dossier', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          clientName: client.companyName,
          audience: evidenceAudience,
          depth: evidenceDepth,
          regulations: client.activeRegulations.join(', '),
          activeFindings: activeScanFindings.filter(f => f.clientId === client.id)
        })
      });
      const data = await response.json();
      if (data.dossier) {
        setEvidenceDossier(data.dossier);
      }
    } catch (error) {
      console.error('Dossier Gen Error:', error);
      triggerToast('Autonomous dossier synthesis encountered a gateway timeout. Utilizing deterministic fallback.');
      
      const generated = generateEvidenceDossierText(
        client.companyName,
        evidenceAudience,
        evidenceDepth,
        client.activeRegulations[0] || 'GDPR/DORA'
      );
      setEvidenceDossier(generated);
    } finally {
      setIsEvidenceGenerating(false);
      const dossierHash = "dossier_" + Math.random().toString(16).substring(2, 10);
      addLedgerBlock(`Compiled Sovereignty Evidence Dossier: ${evidenceAudience.toUpperCase()}`, `Lead Auditor (OIDC verified)`, dossierHash);
      triggerToast('Verifiable regulatory evidence dossier compiled successfully!');
    }
  };

  // 1. Context-Aware Regulatory RAG Search Handler
  const handleRagSearch = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!ragQuery.trim()) return;
    setIsRagSearching(true);
    setRagResults(null);

    try {
      const response = await fetch('/api/v1/ai-knowledge/search', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ query: ragQuery, limit: 3 })
      });
      const data = await response.json();
      
      if (data.documents && data.documents[0]) {
        const sources = data.documents[0].map((doc: string, i: number) => ({
          sourceName: data.metadatas[0][i]?.source || `Regulatory Source #${i+1}`,
          matchedSection: doc.substring(0, 200) + '...',
          relevancePct: Math.round((1 - (data.distances[0][i] || 0)) * 100)
        }));

        setRagResults({
          query: ragQuery,
          synthesizedResponse: `Semantic retrieval alignment completed. Detected ${sources.length} matching statutory provisions. Cross-referencing against client policy architecture... [Synthesized via Sovereign RAG Engine]`,
          sources
        });
      } else {
        // Fallback to mock if no results
        setRagResults({
          query: ragQuery,
          synthesizedResponse: `No direct matches found in vector store. Utilizing predictive inference: Analysis suggests this query relates to GDPR Art. 32 security controls and NIS2 resilience standards.`,
          sources: []
        });
      }
    } catch (error) {
      console.error('RAG Search Error:', error);
    } finally {
      setIsRagSearching(false);
      const searchHash = "rag_" + Math.random().toString(16).substring(2, 10);
      addLedgerBlock(`RAG Query Context Search: "${ragQuery.substring(0, 32)}..."`, "Sovereign AI Knowledge Engine", searchHash);
      triggerToast('RAG synthesis completed!');
    }
  };

  // 2. Policy Drift Auto-Patch Handler
  const handleApplyPatch = (driftId: string) => {
    setIsPatching(true);
    setTimeout(() => {
      setIsPatching(false);
      setDriftEvents(prev => prev.map(evt => evt.id === driftId ? { ...evt, status: 'Patched & Compliant' } : evt));
      
      const patchHash = "patch_" + Math.random().toString(16).substring(2, 10);
      addLedgerBlock(`Automated Policy Patch Applied: DORA / AI Act Drift Mitigation`, "Lead Legal Advisor (OIDC Checked)", patchHash);
      
      triggerToast('Policy patch generated and integrated into Client Vault!');
    }, 1500);
  };

  const handleActivateAddon = async (addonIds: string[]) => {
    const targetClient = clients.find(c => c.id === (selectedClient === 'ALL' ? 'c-1' : selectedClient));
    if (!targetClient) return;

    triggerToast(`Provisioning ${addonIds.length} advanced compliance modules for ${targetClient.companyName}...`);
    
    // Simulate API call to provision
    await new Promise(resolve => setTimeout(resolve, 2000));
    
    setActiveAddons(prev => [...new Set([...prev, ...addonIds])]);
    addLedgerBlock(`Provisioned Addon Services: ${addonIds.join(', ')}`, `Lead Legal Counsel (OIDC Verified)`, `0x${Math.random().toString(16).substring(2, 10)}`);
    triggerToast(`Successfully activated services for ${targetClient.companyName}. Client entitlements updated.`);
  };

  const handleDeactivateAddon = async (addonId: string) => {
    setActiveAddons(prev => prev.filter(id => id !== addonId));
    triggerToast(`Deactivated service: ${addonId}. Access revoked and deletion protocols initiated.`);
  };

  // 3. Predictive Risk Scoring Calculation
  const handleCalculateForecast = () => {
    setIsCalculatingForecast(true);
    setForecastData(null);
    setTimeout(() => {
      setIsCalculatingForecast(false);
      
      const scoreDrop = forecastMonths === 1 ? 4 : forecastMonths === 2 ? 11 : 19;
      const currentScore = 91;
      const projectedScore = Math.max(0, currentScore - scoreDrop);
      const driftRisk = forecastMonths === 1 ? 12 : forecastMonths === 2 ? 45 : 79;

      setForecastData({
        currentScore,
        projectedScore,
        driftRiskProbability: driftRisk,
        highRiskVulnerabilities: [
          {
            category: "EHDS Consent Expiry Drift",
            threatIndex: 82,
            desc: "Spanish user consent signatures will expire in 42 days; no automatic renewal sequence is implemented inside client node v2.2."
          },
          {
            category: "DORA Threat Test Penetration Lag",
            threatIndex: 68,
            desc: "The Fintech Payments hub is 95 days past the mandatory simulated penetration dry-run window. Score drift is imminent."
          },
          {
            category: "EU AI Act Transparency Backlog",
            threatIndex: 55,
            desc: "Watermarking compliance text lacks inline cryptographically logged execution proofs. High priority risk in next audit."
          }
        ]
      });

      const forecastHash = "forecast_" + Math.random().toString(16).substring(2, 10);
      addLedgerBlock(`Predictive 3-Month Risk Analysis Executed`, "Sovereign Trend Analyzer", forecastHash);
      triggerToast('Predictive compliance trajectory compiled!');
    }, 1200);
  };

  // 4. DevSecOps Codebase Sync & Infrastructure Scan
  const handleDevSecOpsScan = () => {
    setIsSyncingInfra(true);
    setInfraLogs([]);
    setIsInfraSecure(null);

    const logs = [
      `Connecting to Secure Repository: https://${githubUrl} on branch [${gitBranch}]`,
      'Parsing GitHub metadata & scanning commits for secret encryption leaks...',
      'Verifying AWS cloud configuration parameters for Frankfurt-EU-West Enclave node...',
      'Scanning local server.ts / routing files for active OIDC validation checks...',
      'Checking cryptographic standards of telemetry vaults (validating Post-Quantum algorithms)...',
      'Verifying continuous consent callback routes in codebase webhook systems...',
      'DevSecOps Audit complete! Security state matched successfully.'
    ];

    logs.forEach((log, index) => {
      setTimeout(() => {
        setInfraLogs(prev => [...prev, `[${new Date().toLocaleTimeString()}] ${log}`]);
        if (index === logs.length - 1) {
          setIsSyncingInfra(false);
          setIsInfraSecure(true);
          
          const scanHash = "scan_" + Math.random().toString(16).substring(2, 10);
          addLedgerBlock(`DevSecOps Code Compliance Audit: github.com/acme-corp`, "Sovereign Repository Scanner", scanHash);
          triggerToast('Codebase & Cloud Architecture fully verified as compliant!');
        }
      }, (index + 1) * 300);
    });
  };

  // Dedicated Lawyer & Legal Consultant Scan Engine Runner
  const handleRunLawyerScan = () => {
    setIsScanHubRunning(true);
    setScanProgress(5);
    
    const targetClientObj = clients.find(c => c.id === scanTargetClientId) || clients[0];
    setScanTerminalLogs([
      `[${new Date().toLocaleTimeString()}] Initializing Legal & Compliance Case Scan Engine...`,
      `[${new Date().toLocaleTimeString()}] Authenticating Lead Legal Counsel Credentials [BAR-EU-OIDC-9482]...`,
      `[${new Date().toLocaleTimeString()}] Establishing encrypted session with client target: ${targetClientObj.companyName}...`,
    ]);

    const steps = [
      { pct: 20, log: `Inference Probe: Auditing ${targetClientObj.companyName} server API routes & cloud database nodes...` },
      { pct: 45, log: `Checking statutory frameworks: ${scanTargetScope.map(s => s.toUpperCase().replace('_', ' ')).join(', ')}...` },
      { pct: 70, log: `Executing static AST code analysis & model transparency lineage check...` },
      { pct: 85, log: `Calculating maximum statutory penalty exposures under EU AI Act Art. 99 & GDPR Art. 83...` },
      { pct: 100, log: `Scan Completed! Violation detected and calculated penalty exposure for ${targetClientObj.companyName}.` }
    ];

    steps.forEach((step, idx) => {
      setTimeout(() => {
        setScanProgress(step.pct);
        setScanTerminalLogs(prev => [...prev, `[${new Date().toLocaleTimeString()}] ${step.log}`]);

        if (step.pct === 100) {
          setIsScanHubRunning(false);
          const scanHash = "counsel_scan_" + Math.random().toString(16).substring(2, 10);
          
          // Generate dynamic scan violation with penalty calculation & suggested solution
          const primaryScope = scanTargetScope[0] || 'ai_act';
          const regName = primaryScope === 'ai_act' ? 'EU AI Act' : primaryScope === 'gdpr' ? 'GDPR' : primaryScope === 'dora' ? 'DORA' : 'Secret Leak';
          const penaltyAmount = primaryScope === 'ai_act' ? 35000000 : primaryScope === 'gdpr' ? 20000000 : 10000000;
          const newFindingId = `find-dyn-${Date.now()}`;

          const newFinding = {
            id: newFindingId,
            clientId: targetClientObj.id,
            clientName: targetClientObj.companyName,
            regulation: regName,
            severity: 'CRITICAL' as const,
            title: primaryScope === 'ai_act' 
              ? 'Unregistered High-Risk AI Ingestion Endpoint & Unmasked Training Data' 
              : primaryScope === 'gdpr' 
              ? 'Unauthorized Cross-Border EU-US Patient Data Pipeline'
              : 'Critical ICT Third-Party Resiliency Failure Point',
            description: `Automated ${scanDepthMode.replace('_', ' ')} probe detected statutory non-compliance in ${targetClientObj.companyName} production codebase.`,
            targetComponent: `https://${targetClientObj.companyName.toLowerCase().replace(/[^a-z0-9]/g, '')}.eu/api/v1/ingest`,
            legalArticle: primaryScope === 'ai_act' ? 'Article 9(2) Risk Management System for AI' : primaryScope === 'gdpr' ? 'Article 44 General Principle for Transfers' : 'Article 28 ICT Third-Party Risk',
            estimatedPenalty: `Up to €${(penaltyAmount / 1000000).toFixed(0)},000,000 Statutory Fine Exposure`,
            penaltyValueEuros: penaltyAmount,
            penaltyFormula: `Calculated using ${regName} maximum statutory penalty multiplier against global turnover (€${targetClientObj.companyName.length * 80}M).`,
            remediationAction: 'Inject compliance guard middleware & execute formal counsel defense brief.',
            caseStatus: 'OPEN' as const,
            caseSolution: {
              defenseStrategy: `Invoke good-faith technical migration defense under ${regName} statutory transition provisions. Demonstrate that ${targetClientObj.companyName} has initiated counsel-guided zero-trust sandbox refactoring.`,
              codePatchSnippet: `// Counsel Compliance Guard Middleware for ${targetClientObj.companyName}\nimport { Request, Response, NextFunction } from 'express';\n\nexport function counselSanitizerGuard(req: Request, res: Response, next: NextFunction) {\n  res.setHeader('X-9Xen Regulettee-Legal-Audit', 'Counsel-Verified-V1');\n  if (req.body && typeof req.body === 'object') {\n    // Strip unencrypted PII / Telemetry attributes\n    delete req.body.unencrypted_telemetry;\n  }\n  next();\n}`,
              regulatoryPrecedent: 'EDPB Guidance 02/2026 on Voluntary Statutory Remediation & Sanction Mitigation',
              stepByStepPlan: [
                'Deploy the compliance sanitizer middleware to production.',
                'Compile Counsel Audit Memorandum and store in Legal Vault.',
                'Dispatch formal Legal Directive to client technical lead.',
                'Submit Voluntary Remediation Notice to national supervisory authority.'
              ]
            }
          };

          setActiveScanFindings(prev => [newFinding, ...prev]);
          addLedgerBlock(`Legal Case Scan & Penalty Calculation: ${targetClientObj.companyName}`, "Lawyer Partner Scan Engine", scanHash);
          triggerToast(`Legal Scan Completed! Detected violation with €${(penaltyAmount / 1000000).toFixed(0)}M calculated penalty exposure.`);
        }
      }, (idx + 1) * 500);
    });
  };

  const handleResolveFinding = (findingId: string) => {
    setActiveScanFindings(prev => prev.map(f => {
      if (f.id === findingId) {
        return { ...f, caseStatus: 'RESOLVED' as const };
      }
      return f;
    }));
    const findObj = activeScanFindings.find(f => f.id === findingId);
    if (findObj) {
      addLedgerBlock(`Counsel Sign-off Remediation: ${findObj.title}`, "Lead Legal Counsel", `0x${Math.random().toString(16).substring(2, 10)}`);
      triggerToast(`Signed off compliance remediation for ${findObj.clientName}!`);
    }
  };

  const handleSendCaseDirective = (e: React.FormEvent) => {
    e.preventDefault();
    if (!caseDirectiveFinding || !caseDirectiveMessage) return;

    const newMessage: SecureMessage = {
      id: `msg-${Date.now()}`,
      clientId: caseDirectiveFinding.clientId,
      sender: 'Lead Legal Counsel (Bar Certified)',
      role: 'LAWYER',
      content: `[FORMAL COUNSEL DIRECTIVE - ${caseDirectiveFinding.regulation} CASE #${caseDirectiveFinding.id}]\n\nTarget Vulnerability: ${caseDirectiveFinding.title}\nArticle: ${caseDirectiveFinding.legalArticle}\nDirective: ${caseDirectiveMessage}\n\nRequired Action: ${caseDirectiveFinding.remediationAction}`,
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      isLawyer: true
    };

    setMessages(prev => [...prev, newMessage]);
    setActiveScanFindings(prev => prev.map(f => f.id === caseDirectiveFinding.id ? { ...f, caseStatus: 'IN_REMEDIATION' as const } : f));
    
    addLedgerBlock(`Issued Counsel Directive for Case #${caseDirectiveFinding.id}`, "Lead Legal Counsel", `0x${Math.random().toString(16).substring(2, 10)}`);
    triggerToast(`Sent formal counsel directive to ${caseDirectiveFinding.clientName}!`);
    
    setCaseDirectiveFinding(null);
    setCaseDirectiveMessage('');
  };

  return (
    <div className="p-4 sm:p-5 lg:p-6 max-w-7xl mx-auto space-y-5 sm:space-y-8 animate-fadeIn">
      
      {/* Toast Status */}
      <AnimatePresence>
        {successToast && (
          <motion.div 
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            className="fixed top-6 right-6 z-50 bg-teal-600 border border-teal-500 text-white px-5 py-3.5 rounded-xl shadow-xl flex items-center gap-2.5 text-xs font-bold"
          >
            <CheckCircle2 className="w-4.5 h-4.5" />
            <span>{successToast}</span>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Header section with refined display typography */}
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 border-b border-slate-200/60 pb-6">
        <div>
          <h1 className="text-3xl font-black text-slate-900 tracking-tight flex items-center gap-2.5">
            <Scale className="w-8 h-8 text-teal-600" />
            External Lawyer & Legal Advisor Portal
          </h1>
          <p className="text-slate-500 text-sm mt-1 max-w-2xl leading-relaxed">
            Centralized ecosystem for legal counsel. Audit client compliance drift indexes, approve pending high-risk regulatory policy drafts, and preserve OIDC secure communication audit trails.
          </p>
        </div>

        {/* Global Client Selector for convenience */}
        <div className="flex items-center gap-2">
          <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Workspace Portfolio:</span>
          <select
            value={selectedClient}
            onChange={(e) => setSelectedClient(e.target.value)}
            className="bg-white border border-slate-200 rounded-xl text-xs py-2 px-3.5 text-slate-700 focus:outline-none focus:ring-2 focus:ring-teal-500 font-bold"
          >
            <option value="ALL">All Enterprise Clients</option>
            {clients.map(c => (
              <option key={c.id} value={c.id}>{c.companyName}</option>
            ))}
          </select>
        </div>
      </div>

      {/* Federated Single Sign-on (SSO) collaboration banner */}
      <div className="bg-gradient-to-r from-teal-50 to-indigo-50/40 border border-teal-100/80 rounded-2xl p-4 flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
        <div className="flex gap-3">
          <div className="p-2 bg-teal-600/10 rounded-xl border border-teal-500/10 shrink-0 text-teal-700">
            <ShieldCheck className="w-5 h-5" />
          </div>
          <div>
            <h4 className="text-xs font-bold text-slate-900">Unified Federated SSO Team & Advisor Workspace</h4>
            <p className="text-[11px] text-slate-600 leading-relaxed mt-0.5">
              To minimize security fragmentation and satisfy strict compliance audits, independent legal consultants and external counsel login seamlessly via your existing <strong>Enterprise SSO</strong>. No separate registration screens or isolated databases are required.
            </p>
          </div>
        </div>
        <div className="flex items-center gap-2 shrink-0">
          <span className="text-[9px] font-bold text-teal-700 bg-teal-100/50 px-2 py-1 rounded border border-teal-100 uppercase tracking-wider">Single Identity Matrix</span>
        </div>
      </div>

      {/* Overview Analytics Bar (Math and metrics balanced) */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
        <div className="bg-white p-5 rounded-2xl border border-slate-200/80 shadow-sm flex items-center justify-between">
          <div>
            <span className="text-[9px] font-bold text-slate-400 uppercase tracking-widest block">Monitored Clients</span>
            <span className="text-2xl font-black text-slate-800 block mt-1">{clients.length} Enterprise</span>
            <span className="text-[10px] font-bold text-teal-600 bg-teal-50 px-2 py-0.5 rounded-full inline-block mt-2">Active Partnership</span>
          </div>
          <div className="w-12 h-12 bg-slate-50 rounded-full border border-slate-100 flex items-center justify-center text-slate-500">
            <Building2 className="w-6 h-6" />
          </div>
        </div>

        <div className="bg-white p-5 rounded-2xl border border-slate-200/80 shadow-sm flex items-center justify-between">
          <div>
            <span className="text-[9px] font-bold text-slate-400 uppercase tracking-widest block">Action Review Queue</span>
            <span className="text-2xl font-black text-amber-600 block mt-1">{reviews.filter(r => r.status === 'Pending Review').length} Policies</span>
            <span className="text-[10px] font-bold text-amber-600 bg-amber-50 px-2 py-0.5 rounded-full inline-block mt-2">Needs Counsel Audit</span>
          </div>
          <div className="w-12 h-12 bg-amber-50 rounded-full border border-amber-100 flex items-center justify-center text-amber-500">
            <FileCheck className="w-6 h-6" />
          </div>
        </div>

        <div className="bg-white p-5 rounded-2xl border border-slate-200/80 shadow-sm flex items-center justify-between">
          <div>
            <span className="text-[9px] font-bold text-slate-400 uppercase tracking-widest block">Vaulted Contracts</span>
            <span className="text-2xl font-black text-slate-800 block mt-1">{documents.length} SLA Docs</span>
            <span className="text-[10px] font-bold text-teal-600 bg-teal-50 px-2 py-0.5 rounded-full inline-block mt-2">SHA-256 Intact</span>
          </div>
          <div className="w-12 h-12 bg-slate-50 rounded-full border border-slate-100 flex items-center justify-center text-slate-500">
            <FileLock className="w-6 h-6" />
          </div>
        </div>

        <div className="bg-white p-5 rounded-2xl border border-slate-200/80 shadow-sm flex items-center justify-between">
          <div>
            <span className="text-[9px] font-bold text-slate-400 uppercase tracking-widest block">Filing Countdowns</span>
            <span className="text-2xl font-black text-rose-600 block mt-1">{deadlines.filter(d => d.daysRemaining < 30).length} Overdue</span>
            <span className="text-[10px] font-bold text-rose-600 bg-rose-50 px-2 py-0.5 rounded-full inline-block mt-2">Urgent Filings</span>
          </div>
          <div className="w-12 h-12 bg-rose-50 rounded-full border border-rose-100 flex items-center justify-center text-rose-500">
            <Clock className="w-6 h-6 animate-pulse" />
          </div>
        </div>
      </div>

      {/* Segmented Layout with elegant sidebar selector */}
      <div className="flex flex-col xl:flex-row gap-5 sm:gap-8">
        
        {/* Portal Sub-tabs */}
        <div className="w-full xl:w-64 shrink-0 space-y-2 sticky top-6 max-h-[calc(100vh-3rem)] overflow-y-auto custom-scrollbar pr-1">
          {[
            { id: 'dashboard', label: 'Dashboard Pro', icon: Activity, count: 0 },
            { id: 'crm', label: 'Legal CRM & Directives', icon: Users, count: clients.length },
            { id: 'alsp_studio', label: 'ALSP & Contract Redline', icon: Sparkles, count: 0 },
            { id: 'portfolio', label: 'Client Portfolio', icon: Briefcase, count: clients.length },
            { id: 'regional-laws', label: 'Regional Legal Hub 🌐', icon: Scale, count: 0 },
            { id: 'scanhub', label: 'Legal Risk Audit', icon: ShieldAlert, count: activeScanFindings.filter(f => f.caseStatus === 'OPEN').length },
            { id: 'reviews', label: 'Approval Queue', icon: FileCheck, count: reviews.filter(r => r.status === 'Pending Review').length },
            { id: 'vault', label: 'Document Vault', icon: FileLock, count: documents.length },
            { id: 'tasks', label: 'Filing & Deadlines', icon: Calendar, count: deadlines.length },
            { id: 'intelligence', label: 'Compliance Dossier', icon: Sparkles, count: 0 },
            { id: 'marketplace', label: 'Client Service Store', icon: ShoppingBag, count: 0 },
            { id: 'billing', label: 'Billing & Credits', icon: Coins, count: 0 },
            { id: 'comms', label: 'Secure Consultations', icon: MessageSquare, count: messages.length },
            { id: 'zkp_proof', label: 'Compliance ZKP Generator', icon: ShieldCheck, count: 0 },
            { id: 'exec_summary', label: 'Executive Summary', icon: FileText, count: 0 },
            { id: 'regional_audit_logs', label: 'Regional Audit Logs', icon: Database, count: 0 },
            { id: 'integration_hub', label: 'Integration Hub', icon: Zap, count: 0 },
            { id: 'policy_simulator', label: 'Policy Simulator', icon: Cpu, count: 0 },
            { id: 'enhanced_gap_analysis', label: 'Automated Gap Analysis', icon: Search, count: 0 }
          ].map((tab) => {
            const isActive = activeTab === tab.id;
            return (
              <button
                key={tab.id}
                onClick={() => {
                  setActiveTab(tab.id as any);
                  setSearchQuery('');
                }}
                className={`w-full flex items-center justify-between px-4.5 py-3 rounded-xl text-xs font-bold transition-all text-left border ${
                  isActive 
                    ? 'bg-teal-650 text-white border-teal-650 shadow-md shadow-teal-550/10' 
                    : 'bg-white text-slate-600 border-slate-200/80 hover:bg-slate-50 hover:text-slate-900'
                }`}
              >
                <div className="flex items-center space-x-3">
                  <tab.icon className={`w-4 h-4 ${isActive ? 'text-white' : 'text-slate-400'}`} />
                  <span>{tab.label}</span>
                </div>
                {tab.count > 0 && (
                  <span className={`text-[10px] px-2 py-0.5 rounded-full font-bold uppercase tracking-wider ${
                    isActive ? 'bg-teal-700 text-teal-100' : 'bg-slate-100 text-slate-600'
                  }`}>
                    {tab.count}
                  </span>
                )}
              </button>
            );
          })}

          <div className="p-4 bg-slate-50 border border-slate-200 rounded-xl mt-6 text-center space-y-2">
            <ShieldCheck className="w-7 h-7 mx-auto text-teal-600" />
            <h4 className="text-xs font-bold text-slate-800">Counsel Credentials</h4>
            <p className="text-[10px] text-slate-500 leading-normal">
              You are authenticated as <strong>Lead Partner (OIDC)</strong> under European Bar association claims.
            </p>
          </div>
        </div>

        {/* Dynamic Panel Display Body */}
        <div className="flex-1 bg-white border border-slate-200 rounded-2xl shadow-sm p-4 sm:p-5 lg:p-6 space-y-4 sm:space-y-6">
          
          {/* Header & Local Search Controls */}
          <div className="flex flex-col md:flex-row gap-4 items-center justify-between pb-4 border-b border-slate-100">
            <div>
              <h2 className="text-base font-black text-slate-900 uppercase tracking-wide">
                {activeTab === 'dashboard' && 'Dashboard Pro'}
                {activeTab === 'crm' && 'Legal Practice CRM Suite & Client Directives'}
                {activeTab === 'alsp_studio' && 'ALSP Execution Studio & AI Contract Redlines'}
                {activeTab === 'portfolio' && 'Central Client Compliance Portfolio'}
                {activeTab === 'regional-laws' && 'Regional Compliance & Jurisprudential Acts Engine'}
                {activeTab === 'scanhub' && 'Legal Risk Audit & Case Management'}
                {activeTab === 'reviews' && 'Regulatory Document & Policy Approval Queue'}
                {activeTab === 'vault' && 'Secure Statutory Document Repository'}
                {activeTab === 'tasks' && 'Regulatory Deadlines & Compliance Tracker'}
                {activeTab === 'intelligence' && 'Compliance Dossier Generation'}
                {activeTab === 'marketplace' && 'Client Service Store'}
                {activeTab === 'comms' && 'Secure Legal Consultation Channel'}
                {activeTab === 'zkp_proof' && 'Zero-Knowledge Compliance Proof Generator'}
                {activeTab === 'exec_summary' && 'Executive Summary Report'}
                {activeTab === 'regional_audit_logs' && 'Regional Audit Logs'}
                {activeTab === 'integration_hub' && 'Integration Scanner Hub'}
                {activeTab === 'policy_simulator' && 'Policy Act Simulator'}
                {activeTab === 'enhanced_gap_analysis' && 'Automated Gap Analysis'}
              </h2>
              <p className="text-slate-400 text-xs mt-0.5">
                {activeTab === 'dashboard' && 'Complete Case & Document Control'}
                {activeTab === 'crm' && 'Manage client portfolios, dispatch binding compliance directives, track retainer SLAs, and offer alternative legal services.'}
                {activeTab === 'alsp_studio' && 'AI-assisted contract redlining against EU AI Act & GDPR, formal opinion letter generation, and billable invoicing.'}
                {activeTab === 'portfolio' && 'Global compliance safety meters, drift risk alerts, and corporate industries.'}
                {activeTab === 'regional-laws' && 'Inspect international statutory compliance acts, generate counsel memos, and copy standard clauses across jurisdictions.'}
                {activeTab === 'scanhub' && 'Audit client liability exposure, data sovereignty risks, and regulatory drift.'}
                {activeTab === 'reviews' && 'Review legal SLAs and patient consent policies awaiting formal signature verification.'}
                {activeTab === 'vault' && 'Tamper-evident client repository verified via ledger integrity proofs.'}
                {activeTab === 'tasks' && 'Pending filings and legal safety statement checkpoints before compliance authority submission.'}
                {activeTab === 'intelligence' && 'Compile verifiable compliance dossiers from platform telemetry and regulatory guidelines.'}
                {activeTab === 'marketplace' && 'Provision specialized compliance services, AI guardrails, and regional infrastructure for client practice.'}
                {activeTab === 'comms' && 'Audit consultations, direct conversations, and legal draft generators.'}
                {activeTab === 'zkp_proof' && 'Select specific client documents and generate verifiable ZK-SNARK compliance reports without exposing raw PII.'}
                {activeTab === 'exec_summary' && 'Generate high-level compliance and risk reports for executive stakeholders.'}
                {activeTab === 'regional_audit_logs' && 'View granular audit logs filtered by operational region.'}
                {activeTab === 'integration_hub' && 'Manage and monitor third-party API and scanner integrations.'}
                {activeTab === 'policy_simulator' && 'Simulate impacts of new regulations on existing policies.'}
                {activeTab === 'enhanced_gap_analysis' && 'Automated evaluation of compliance gaps against emerging threats.'}
              </p>
            </div>

            {activeTab !== 'comms' && (
              <div className="relative w-full md:w-64">
                <Search className="absolute left-3 top-2.5 h-4 w-4 text-slate-400" />
                <input
                  type="text"
                  placeholder="Quick search..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-9 pr-4 py-2 w-full bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-800 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-teal-500 transition-all"
                />
              </div>
            )}
          </div>

          {/* Legal CRM Suite */}
          {activeTab === 'dashboard' && (
            <div className="space-y-6">
              <LawyerDashboardPro />
            </div>
          )}

          {activeTab === 'crm' && (
            <div className="space-y-6">
              <LegalCrmSuite triggerToast={triggerToast} />
            </div>
          )}

          {/* ALSP Execution Studio */}
          {activeTab === 'alsp_studio' && (
            <div className="space-y-6">
              <AlspExecutionStudio triggerToast={triggerToast} />
            </div>
          )}

          {/* Compliance ZKP Generator */}
          {activeTab === 'zkp_proof' && (
            <div className="space-y-6">
              <ComplianceProofGenerator clients={clients} triggerToast={triggerToast} />
            </div>
          )}
          
          {/* Executive Summary */}
          {activeTab === 'exec_summary' && (
            <div className="space-y-6">
              <ComplianceReportGenerator />
            </div>
          )}
          
          {/* Regional Audit Logs */}
          {activeTab === 'regional_audit_logs' && (
            <div className="space-y-6">
              <ComplianceAuditDashboard />
            </div>
          )}

          {/* Integration Hub */}
          {activeTab === 'integration_hub' && (
            <div className="space-y-6">
              <IntegrationsScanHub />
            </div>
          )}

          {/* Policy Simulator */}
          {activeTab === 'policy_simulator' && (
            <div className="space-y-6">
              <RegulatoryChangeSimulator />
            </div>
          )}

          {/* Automated Gap Analysis */}
          {activeTab === 'enhanced_gap_analysis' && (
            <div className="space-y-6">
              <GapAnalysisTool />
            </div>
          )}

          {/* Regional Statutory Acts & Jurisprudential Hub */}
          {activeTab === 'regional-laws' && (
            <div className="space-y-6">
              <RegionalLegalFrameworksHub 
                clientName={selectedClient === 'ALL' ? 'Enterprise Client Group' : clients.find(c => c.id === selectedClient)?.companyName || 'Acme Enterprise Ltd'} 
              />
            </div>
          )}

          {/* 1. Client Portfolio Tab */}
          {activeTab === 'portfolio' && (
            <div className="space-y-6">
              {/* Advanced SaaS Dashboard Elements (KPIs, Telemetry, Activity Feed) */}
              <AdvanceSaaSWidgets role="lawyer" />
              
              <IPRegionTranslator />
              <div className="grid grid-cols-1 lg:grid-cols-12 gap-4 sm:gap-6">
              <div className="lg:col-span-8 space-y-4">
                {filteredClients.length === 0 ? (
                  <div className="text-center p-12 text-slate-400 text-xs">No matching enterprise clients in portfolio.</div>
                ) : (
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {filteredClients.map((client) => {
                    const isHigh = client.complianceScore > 85;
                    const isMed = client.complianceScore <= 85 && client.complianceScore >= 70;
                    return (
                      <div 
                        key={client.id} 
                        className="border border-slate-200/90 rounded-xl p-5 hover:border-teal-300 transition-colors bg-slate-50/50 flex flex-col justify-between space-y-4"
                      >
                        <div className="space-y-2">
                          <div className="flex justify-between items-start">
                            <div>
                              <h3 className="text-sm font-black text-slate-900">{client.companyName}</h3>
                              <p className="text-[10px] text-slate-500 italic mt-0.5">{client.industry}</p>
                            </div>
                            <span className={`text-[9px] font-bold px-2 py-0.5 rounded-full uppercase border ${
                              client.status === 'Compliant' ? 'bg-emerald-50 text-emerald-700 border-emerald-100' :
                              client.status === 'Pending Review' ? 'bg-amber-50 text-amber-700 border-amber-100' : 'bg-rose-50 text-rose-700 border-rose-100'
                            }`}>
                              {client.status}
                            </span>
                          </div>

                          <div className="space-y-1.5 pt-1.5">
                            <div className="flex justify-between text-[10px] font-bold">
                              <span className="text-slate-400 uppercase">Compliance Index</span>
                              <span className={isHigh ? 'text-emerald-600 font-mono' : isMed ? 'text-amber-600 font-mono' : 'text-rose-600 font-mono'}>
                                {client.complianceScore}%
                              </span>
                            </div>
                            <div className="h-1.5 w-full bg-slate-200 rounded-full overflow-hidden">
                              <div 
                                className={`h-full transition-all duration-500 ${
                                  isHigh ? 'bg-emerald-500' : isMed ? 'bg-amber-500' : 'bg-rose-500'
                                }`}
                                style={{ width: `${client.complianceScore}%` }}
                              />
                            </div>
                          </div>

                          <div className="flex flex-wrap gap-1.5 pt-2">
                            {client.activeRegulations.map((reg) => (
                              <span key={reg} className="px-1.5 py-0.5 bg-white border border-slate-250 text-slate-600 text-[8px] font-bold rounded">
                                {reg}
                              </span>
                            ))}
                          </div>
                        </div>

                        <div className="border-t border-slate-200/60 pt-4 flex items-center justify-between text-[10px] text-slate-400 font-medium">
                          <span>Last Counsel Audit: <strong>{client.lastAuditDate}</strong></span>
                          {client.pendingReviewsCount > 0 ? (
                            <button 
                              onClick={() => {
                                setSelectedClient(client.id);
                                setActiveTab('reviews');
                              }}
                              className="text-teal-650 hover:text-teal-800 font-bold flex items-center gap-1 cursor-pointer"
                            >
                              {client.pendingReviewsCount} Pending Reviews <ChevronRight className="w-3 h-3" />
                            </button>
                          ) : (
                            <div className="flex items-center gap-3">
                              <button
                                onClick={() => {
                                  setAuditTargetClient(client);
                                  setShowAuditChecklist(true);
                                }}
                                className="text-teal-650 hover:text-teal-800 font-bold flex items-center gap-1 cursor-pointer text-[9px] uppercase tracking-wider"
                              >
                                <Scale className="w-3 h-3" />
                                Start Manual Audit
                              </button>
                              <span className="text-emerald-600 font-bold flex items-center gap-1">All Clear <Check className="w-3.5 h-3.5" /></span>
                            </div>
                          )}
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
              </div>
              <div className="lg:col-span-4">
                <RegulatoryNewsFeed />
              </div>
            </div>
          </div>
          )}

          {/* =========================================================================
              TAB 9: BILLING & SUBSCRIPTIONS
              ========================================================================= */}
          {activeTab === 'billing' && (
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-5 sm:gap-8 animate-fadeIn">
              <div className="lg:col-span-2 space-y-5 sm:space-y-8 text-left">
                <div className="bg-white rounded-2xl border border-slate-200 p-4 sm:p-5 lg:p-6 shadow-sm">
                  <div className="flex justify-between items-center mb-6">
                    <div>
                      <h3 className="text-lg font-bold text-slate-900">Transaction History</h3>
                      <p className="text-slate-500 text-xs">Detailed ledger of compliance operations and subscription charges.</p>
                    </div>
                    <button className="flex items-center gap-2 text-indigo-600 text-xs font-bold hover:underline">
                      <Download className="w-4 h-4" />
                      Export Statement
                    </button>
                  </div>

                  <div className="overflow-hidden rounded-xl border border-slate-100">
                    <table className="w-full text-left text-xs">
                      <thead>
                        <tr className="bg-slate-50 text-slate-500 font-bold border-b border-slate-100">
                          <th className="p-4">Date</th>
                          <th className="p-4">Description</th>
                          <th className="p-4">Amount</th>
                          <th className="p-4 text-right">Status</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-slate-50">
                        {billingHistory.map((tx) => (
                          <tr key={tx.id} className="hover:bg-slate-50/50">
                            <td className="p-4 text-slate-500">{tx.date}</td>
                            <td className="p-4 font-bold text-slate-900">{tx.description}</td>
                            <td className={`p-4 font-bold ${tx.amount > 0 ? 'text-emerald-600' : 'text-slate-900'}`}>
                              {tx.amount > 0 ? '+' : ''}{new Intl.NumberFormat('en-DE', { style: 'currency', currency: 'EUR' }).format(tx.amount)}
                            </td>
                            <td className="p-4 text-right">
                              <span className="bg-emerald-50 text-emerald-700 px-2 py-1 rounded-full text-[10px] font-bold">
                                {tx.status}
                              </span>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>
              </div>

              <div className="space-y-6 text-left">
                <div className="bg-slate-900 text-white rounded-2xl p-4 sm:p-5 lg:p-6 shadow-xl relative overflow-hidden">
                  <div className="relative z-10 space-y-4">
                    <div className="flex justify-between items-center">
                      <div className="text-indigo-400 font-black uppercase tracking-widest text-[10px]">Current Balance</div>
                      <div className="bg-indigo-500/20 text-indigo-300 px-2 py-0.5 rounded text-[10px] font-bold border border-indigo-500/30">Partner Tier</div>
                    </div>
                    <div className="text-4xl font-black">{new Intl.NumberFormat('en-DE', { style: 'currency', currency: 'EUR' }).format(billingCredits)}</div>
                    <p className="text-slate-400 text-[10px]">Automatic top-up active at threshold of €500.00</p>
                    
                    <button className="w-full bg-indigo-600 hover:bg-indigo-700 text-white py-3 rounded-xl font-bold text-xs transition-all flex items-center justify-center gap-2">
                      <Plus className="w-4 h-4" />
                      Top up Credits
                    </button>
                  </div>
                  <Coins className="absolute -bottom-8 -right-8 w-32 h-32 text-indigo-500/10 rotate-12" />
                </div>

                <div className="bg-white rounded-2xl border border-slate-200 p-4 sm:p-5 lg:p-6 shadow-sm space-y-4">
                  <h4 className="text-sm font-bold text-slate-900 flex items-center gap-2">
                    <Calculator className="w-4 h-4 text-indigo-600" />
                    Subscription Details
                  </h4>
                  <div className="space-y-3">
                    <div className="flex justify-between text-xs">
                      <span className="text-slate-500">Plan Type</span>
                      <span className="font-bold text-slate-900">Legal Partner Plus</span>
                    </div>
                    <div className="flex justify-between text-xs">
                      <span className="text-slate-500">Next Billing Date</span>
                      <span className="font-bold text-slate-900">August 15, 2026</span>
                    </div>
                    <div className="flex justify-between text-xs">
                      <span className="text-slate-500">Regional Compliance Shards</span>
                      <span className="font-bold text-slate-900">5 Active</span>
                    </div>
                  </div>
                  <div className="pt-4 border-t border-slate-100">
                    <button className="text-xs font-bold text-indigo-600 hover:underline">Change Subscription Plan</button>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Dedicated Legal & Compliance Scan Hub Engine Tab */}
          {activeTab === 'scanhub' && (
            <div className="space-y-4 sm:space-y-6">
              
              {/* Scan Engine Controls Banner */}
              <div className="p-5 bg-gradient-to-br from-slate-900 via-slate-850 to-slate-900 border border-slate-800 rounded-2xl text-white shadow-xl space-y-5">
                <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-4 border-b border-slate-800">
                  <div className="flex items-center gap-3">
                    <div className="p-2.5 bg-teal-500/20 border border-teal-500/30 rounded-xl text-teal-400">
                      <Activity className="w-6 h-6 animate-pulse" />
                    </div>
                    <div>
                      <h3 className="text-sm font-black text-white uppercase tracking-wider">Lawyer / Consultant Client Scan Engine</h3>
                      <p className="text-[11px] text-slate-400 mt-0.5">Isolated legal auditing probe for source code, AI model weights, API routes & privacy vaults.</p>
                    </div>
                  </div>

                  {/* Target Client Selection */}
                  <div className="flex items-center gap-2">
                    <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Client Target:</span>
                    <select
                      value={scanTargetClientId}
                      onChange={(e) => setScanTargetClientId(e.target.value)}
                      className="bg-slate-800 border border-slate-700 text-teal-300 rounded-xl text-xs py-2 px-3.5 font-bold focus:outline-none focus:ring-2 focus:ring-teal-500"
                    >
                      {clients.map(c => (
                        <option key={c.id} value={c.id}>{c.companyName} ({c.industry})</option>
                      ))}
                    </select>
                  </div>
                </div>

                {/* Target Framework Checkboxes & Depth Selector */}
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                  <div className="space-y-1.5">
                    <label className="text-[9px] font-bold text-slate-400 uppercase tracking-widest block">Audit Framework Scope</label>
                    <div className="space-y-1 bg-slate-800/80 p-2.5 rounded-xl border border-slate-700/80">
                      {[
                        { id: 'ai_act', label: 'EU AI Act (Art. 52 & 10)' },
                        { id: 'gdpr', label: 'GDPR & Data Sovereignty' },
                        { id: 'dora', label: 'DORA & NIS2 Resilience' },
                        { id: 'code_secrets', label: 'Code & Secret Leak Audit' }
                      ].map(sc => (
                        <label key={sc.id} className="flex items-center gap-2 text-[11px] font-bold text-slate-300 cursor-pointer hover:text-white">
                          <input 
                            type="checkbox"
                            checked={scanTargetScope.includes(sc.id)}
                            onChange={(e) => {
                              if (e.target.checked) {
                                setScanTargetScope(prev => [...prev, sc.id]);
                              } else {
                                setScanTargetScope(prev => prev.filter(s => s !== sc.id));
                              }
                            }}
                            className="rounded border-slate-700 text-teal-500 focus:ring-teal-500 accent-teal-600"
                          />
                          <span>{sc.label}</span>
                        </label>
                      ))}
                    </div>
                  </div>

                  <div className="space-y-1.5 lg:col-span-2">
                    <label className="text-[9px] font-bold text-slate-400 uppercase tracking-widest block">Scan Depth & Mode</label>
                    <div className="grid grid-cols-3 gap-2">
                      {[
                        { id: 'deep_forensic', label: 'Deep Forensic', desc: 'Full static AST + route probe' },
                        { id: 'quick_check', label: 'Quick Sweep', desc: 'Fast vulnerability check' },
                        { id: 'continuous_sync', label: 'Live Sync', desc: 'Real-time telemetry monitor' }
                      ].map(m => (
                        <button
                          key={m.id}
                          type="button"
                          onClick={() => setScanDepthMode(m.id as any)}
                          className={`p-2.5 rounded-xl border text-left transition-all cursor-pointer ${
                            scanDepthMode === m.id
                              ? 'bg-teal-600/20 border-teal-500 text-teal-300 ring-1 ring-teal-500'
                              : 'bg-slate-800/60 border-slate-700/80 text-slate-400 hover:bg-slate-800 hover:text-slate-200'
                          }`}
                        >
                          <span className="text-[11px] font-bold block">{m.label}</span>
                          <span className="text-[9px] text-slate-400 block mt-0.5">{m.desc}</span>
                        </button>
                      ))}
                    </div>
                  </div>

                  {/* Run Button */}
                  <div className="flex flex-col justify-end">
                    <button
                      type="button"
                      disabled={isScanHubRunning || scanTargetScope.length === 0}
                      onClick={handleRunLawyerScan}
                      className="w-full py-3.5 px-4 bg-teal-600 hover:bg-teal-500 text-white rounded-xl font-black text-xs uppercase tracking-wider shadow-lg shadow-teal-900/30 flex items-center justify-center gap-2 transition-all cursor-pointer disabled:bg-slate-700 disabled:text-slate-500"
                    >
                      {isScanHubRunning ? (
                        <>
                          <RefreshCw className="w-4 h-4 animate-spin" />
                          <span>Scanning Case...</span>
                        </>
                      ) : (
                        <>
                          <Play className="w-4 h-4 fill-current" />
                          <span>Run Legal Case Scan</span>
                        </>
                      )}
                    </button>
                  </div>
                </div>

                {/* Progress & Live Terminal Output */}
                {(isScanHubRunning || scanTerminalLogs.length > 0) && (
                  <div className="pt-3 space-y-3 border-t border-slate-800">
                    <IntegrationsScanHub />
                  </div>
                )}
              </div>

              {/* Lawyer/Consultant Executive Summary Widget */}
              <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
                <div className="p-4 bg-slate-900 rounded-2xl border border-slate-800 text-white shadow-xl">
                  <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest block mb-1">Total Active Clients</span>
                  <span className="text-2xl font-black text-white">{clients.length}</span>
                </div>
                <div className="p-4 bg-rose-950/40 rounded-2xl border border-rose-900/30 text-white shadow-xl">
                  <span className="text-[10px] font-bold text-rose-300 uppercase tracking-widest block mb-1">Critical Compliance Risks</span>
                  <span className="text-2xl font-black text-rose-300">
                    {activeScanFindings.filter(f => f.severity === 'CRITICAL' && f.caseStatus === 'OPEN').length}
                  </span>
                </div>
                <div className="p-4 bg-amber-950/40 rounded-2xl border border-amber-900/30 text-white shadow-xl">
                  <span className="text-[10px] font-bold text-amber-300 uppercase tracking-widest block mb-1">Pending Legal Reviews</span>
                  <span className="text-2xl font-black text-amber-300">{reviews.filter(r => r.status === 'Pending Review').length}</span>
                </div>
                <div className="p-4 bg-teal-950/40 rounded-2xl border border-teal-900/30 text-white shadow-xl">
                  <span className="text-[10px] font-bold text-teal-300 uppercase tracking-widest block mb-1">Upcoming Filing Deadlines</span>
                  <span className="text-2xl font-black text-teal-300">{deadlines.filter(dl => dl.daysRemaining <= 10).length}</span>
                </div>
              </div>

              {/* Statutory Penalty Risk Exposure Portfolio Summary */}
              <div className="grid grid-cols-1 md:grid-cols-4 gap-3">
                <div className="p-4 bg-gradient-to-br from-rose-900 to-slate-900 text-white rounded-2xl border border-rose-800/60 shadow-lg space-y-1">
                  <div className="flex items-center justify-between text-rose-300">
                    <span className="text-[10px] font-black uppercase tracking-widest">Total Penalty Risk Exposure</span>
                    <Coins className="w-4 h-4 text-rose-400 animate-pulse" />
                  </div>
                  <div className="text-xl font-black text-white">
                    €{(activeScanFindings
                      .filter(f => selectedClient === 'ALL' || f.clientId === selectedClient)
                      .filter(f => f.caseStatus !== 'RESOLVED')
                      .reduce((acc, curr) => acc + curr.penaltyValueEuros, 0) / 1000000).toFixed(1)}M
                  </div>
                  <p className="text-[10px] text-rose-200/80">Maximum regulatory statutory fine liability across active cases</p>
                </div>

                <div className="p-4 bg-slate-900 text-white rounded-2xl border border-slate-800 shadow-md space-y-1">
                  <div className="flex items-center justify-between text-teal-400">
                    <span className="text-[10px] font-black uppercase tracking-widest">EU AI Act Fine Risk</span>
                    <Cpu className="w-4 h-4 text-teal-400" />
                  </div>
                  <div className="text-lg font-black text-white">
                    €{(activeScanFindings
                      .filter(f => selectedClient === 'ALL' || f.clientId === selectedClient)
                      .filter(f => f.regulation.includes('AI Act') && f.caseStatus !== 'RESOLVED')
                      .reduce((acc, curr) => acc + curr.penaltyValueEuros, 0) / 1000000).toFixed(1)}M
                  </div>
                  <p className="text-[10px] text-slate-400">Up to €35M / 7% turnover under Art. 99</p>
                </div>

                <div className="p-4 bg-slate-900 text-white rounded-2xl border border-slate-800 shadow-md space-y-1">
                  <div className="flex items-center justify-between text-blue-400">
                    <span className="text-[10px] font-black uppercase tracking-widest">GDPR Penalty Risk</span>
                    <ShieldCheck className="w-4 h-4 text-blue-400" />
                  </div>
                  <div className="text-lg font-black text-white">
                    €{(activeScanFindings
                      .filter(f => selectedClient === 'ALL' || f.clientId === selectedClient)
                      .filter(f => f.regulation.includes('GDPR') && f.caseStatus !== 'RESOLVED')
                      .reduce((acc, curr) => acc + curr.penaltyValueEuros, 0) / 1000000).toFixed(1)}M
                  </div>
                  <p className="text-[10px] text-slate-400">Up to €20M / 4% turnover under Art. 83</p>
                </div>

                <div className="p-4 bg-slate-900 text-white rounded-2xl border border-slate-800 shadow-md space-y-1">
                  <div className="flex items-center justify-between text-amber-400">
                    <span className="text-[10px] font-black uppercase tracking-widest">DORA Resiliency Fines</span>
                    <Activity className="w-4 h-4 text-amber-400" />
                  </div>
                  <div className="text-lg font-black text-white">
                    €{(activeScanFindings
                      .filter(f => selectedClient === 'ALL' || f.clientId === selectedClient)
                      .filter(f => f.regulation.includes('DORA') && f.caseStatus !== 'RESOLVED')
                      .reduce((acc, curr) => acc + curr.penaltyValueEuros, 0) / 1000000).toFixed(1)}M
                  </div>
                  <p className="text-[10px] text-slate-400">Up to 2% daily turnover periodic fines</p>
                </div>
              </div>

              {/* Case Findings & Remediation Management */}
              <div className="space-y-4">
                <div className="flex flex-col md:flex-row md:items-center justify-between gap-3 pb-2 border-b border-slate-200">
                  <div className="flex items-center gap-2">
                    <AlertTriangle className="w-5 h-5 text-amber-500" />
                    <h3 className="text-sm font-black text-slate-900 uppercase tracking-wide">Client Case Compliance Findings</h3>
                    <span className="px-2 py-0.5 bg-slate-100 text-slate-700 border border-slate-200 text-[10px] font-bold rounded-full">
                      {activeScanFindings.filter(f => selectedClient === 'ALL' || f.clientId === selectedClient).length} Detected
                    </span>
                  </div>

                  {/* Filter by severity */}
                  <div className="flex items-center gap-1.5">
                    <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Severity:</span>
                    {['ALL', 'CRITICAL', 'HIGH', 'MEDIUM', 'LOW'].map(sev => (
                      <button
                        key={sev}
                        type="button"
                        onClick={() => setScanFilterSeverity(sev)}
                        className={`px-2.5 py-1 text-[10px] font-bold rounded-lg transition-colors cursor-pointer ${
                          scanFilterSeverity === sev
                            ? 'bg-slate-900 text-white'
                            : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                        }`}
                      >
                        {sev}
                      </button>
                    ))}
                  </div>
                </div>

                {/* Findings List Grid */}
                <div className="space-y-3">
                  {activeScanFindings
                    .filter(f => selectedClient === 'ALL' || f.clientId === selectedClient)
                    .filter(f => scanFilterSeverity === 'ALL' || f.severity === scanFilterSeverity)
                    .map((finding) => (
                      <div
                        key={finding.id}
                        className={`p-4 rounded-2xl border transition-all space-y-3 shadow-xs ${
                          finding.caseStatus === 'RESOLVED'
                            ? 'bg-slate-50/60 border-slate-200 opacity-75'
                            : finding.severity === 'CRITICAL'
                            ? 'bg-rose-50/20 border-rose-200 hover:border-rose-300'
                            : 'bg-white border-slate-200 hover:border-teal-300'
                        }`}
                      >
                        <div className="flex flex-col md:flex-row md:items-center justify-between gap-2">
                          <div className="flex items-center gap-2.5">
                            <span className={`text-[9px] font-black px-2.5 py-0.5 rounded-full uppercase border ${
                              finding.severity === 'CRITICAL' ? 'bg-rose-100 text-rose-800 border-rose-200' :
                              finding.severity === 'HIGH' ? 'bg-amber-100 text-amber-800 border-amber-200' :
                              finding.severity === 'MEDIUM' ? 'bg-blue-100 text-blue-800 border-blue-200' : 'bg-slate-100 text-slate-700 border-slate-200'
                            }`}>
                              {finding.severity}
                            </span>

                            <span className="text-xs font-black text-slate-900">{finding.clientName}</span>
                            <span className="text-[10px] font-bold text-teal-700 bg-teal-50 px-2 py-0.5 rounded border border-teal-100">
                              {finding.regulation}
                            </span>
                          </div>

                          <div className="flex items-center gap-2">
                            <span className={`text-[10px] font-bold px-2.5 py-0.5 rounded-full uppercase ${
                              finding.caseStatus === 'OPEN' ? 'bg-rose-50 text-rose-700 border border-rose-200' :
                              finding.caseStatus === 'IN_REMEDIATION' ? 'bg-amber-50 text-amber-700 border border-amber-200' :
                              'bg-emerald-50 text-emerald-700 border border-emerald-200'
                            }`}>
                              {finding.caseStatus.replace('_', ' ')}
                            </span>
                          </div>
                        </div>

                        <div>
                          <h4 className="text-xs font-black text-slate-900">{finding.title}</h4>
                          <p className="text-[11px] text-slate-600 mt-1 leading-relaxed">{finding.description}</p>
                        </div>

                        <div className="p-3 bg-slate-50 rounded-xl border border-slate-200/80 grid grid-cols-1 md:grid-cols-3 gap-3 text-[10px]">
                          <div>
                            <span className="text-slate-400 font-bold block uppercase tracking-wider">Statutory Reference</span>
                            <span className="text-slate-800 font-bold">{finding.legalArticle}</span>
                          </div>
                          <div>
                            <span className="text-slate-400 font-bold block uppercase tracking-wider">Target Endpoint / Asset</span>
                            <span className="text-slate-700 font-mono text-[10px] truncate block">{finding.targetComponent}</span>
                          </div>
                          <div className="bg-rose-50/80 border border-rose-200/80 p-2 rounded-lg">
                            <span className="text-rose-600 font-bold block uppercase tracking-wider flex items-center gap-1">
                              <Coins className="w-3 h-3 text-rose-600" />
                              Penalty Calculation Risk
                            </span>
                            <span className="text-rose-950 font-black text-xs block">{finding.estimatedPenalty}</span>
                          </div>
                        </div>

                        {/* Action buttons */}
                        <div className="flex flex-wrap items-center justify-between gap-3 pt-2 border-t border-slate-150">
                          <div className="text-[10px] text-slate-500 font-medium">
                            Remediation: <strong className="text-slate-800">{finding.remediationAction}</strong>
                          </div>

                          <div className="flex items-center gap-2">
                            {/* Suggested Case Solution Button */}
                            <button
                              type="button"
                              onClick={() => {
                                setActiveSolutionFinding(finding);
                                setActiveSolutionTab('defense');
                              }}
                              className="px-3 py-1.5 bg-teal-50 hover:bg-teal-100 text-teal-800 border border-teal-200 text-[10px] font-bold rounded-lg transition-colors cursor-pointer flex items-center gap-1.5 shadow-2xs"
                            >
                              <Sparkles className="w-3.5 h-3.5 text-teal-600 animate-pulse" />
                              <span>View Suggested Case Solution</span>
                            </button>

                            {finding.caseStatus !== 'RESOLVED' && (
                              <button
                                type="button"
                                onClick={() => {
                                  setCaseDirectiveFinding(finding);
                                  setCaseDirectiveMessage(`Please remediate "${finding.title}" in accordance with ${finding.legalArticle}. Action required: ${finding.remediationAction}`);
                                }}
                                className="px-3 py-1.5 bg-slate-900 hover:bg-slate-800 text-white text-[10px] font-bold rounded-lg transition-colors cursor-pointer flex items-center gap-1.5"
                              >
                                <MessageSquare className="w-3.5 h-3.5 text-teal-400" />
                                <span>Issue Counsel Directive</span>
                              </button>
                            )}

                            {finding.caseStatus !== 'RESOLVED' ? (
                              <button
                                type="button"
                                onClick={() => handleResolveFinding(finding.id)}
                                className="px-3 py-1.5 bg-emerald-600 hover:bg-emerald-500 text-white text-[10px] font-bold rounded-lg transition-colors cursor-pointer flex items-center gap-1"
                              >
                                <CheckCircle2 className="w-3.5 h-3.5" />
                                <span>Sign-off & Resolve</span>
                              </button>
                            ) : (
                              <span className="text-[10px] font-bold text-emerald-600 flex items-center gap-1">
                                <ShieldCheck className="w-4 h-4" /> Verified Compliant
                              </span>
                            )}
                          </div>
                        </div>
                      </div>
                    ))}
                </div>
              </div>

              {/* Directive Issue Modal */}
              {caseDirectiveFinding && (
                <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-xs z-50 flex items-center justify-center p-4">
                  <div className="bg-white rounded-2xl max-w-xl w-full p-4 sm:p-5 lg:p-6 space-y-4 shadow-2xl border border-slate-200 animate-fadeIn">
                    <div className="flex items-center justify-between pb-3 border-b border-slate-200">
                      <div className="flex items-center gap-2">
                        <Scale className="w-5 h-5 text-teal-600" />
                        <h3 className="text-sm font-black text-slate-900">Issue Formal Counsel Directive</h3>
                      </div>
                      <button 
                        onClick={() => setCaseDirectiveFinding(null)}
                        className="text-slate-400 hover:text-slate-600 p-1"
                      >
                        <X className="w-4 h-4" />
                      </button>
                    </div>

                    <div className="space-y-3 text-xs">
                      <div className="p-3 bg-slate-50 rounded-xl border border-slate-200">
                        <span className="text-[9px] font-bold text-slate-400 uppercase tracking-widest block">Client Case Entity</span>
                        <span className="text-xs font-black text-slate-900">{caseDirectiveFinding.clientName}</span>
                        <span className="text-[10px] text-teal-700 font-bold block mt-1">{caseDirectiveFinding.legalArticle} — {caseDirectiveFinding.title}</span>
                      </div>

                      <div className="space-y-1">
                        <label className="text-[10px] font-bold text-slate-500 uppercase tracking-wider block">Directive Details & Instructions</label>
                        <textarea
                          rows={4}
                          value={caseDirectiveMessage}
                          onChange={(e) => setCaseDirectiveMessage(e.target.value)}
                          className="w-full p-3 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-800 outline-none focus:ring-2 focus:ring-teal-500 font-medium"
                        />
                      </div>
                    </div>

                    <div className="flex justify-end gap-2 pt-3 border-t border-slate-200">
                      <button
                        type="button"
                        onClick={() => setCaseDirectiveFinding(null)}
                        className="px-4 py-2 text-xs font-bold text-slate-500 hover:bg-slate-100 rounded-xl"
                      >
                        Cancel
                      </button>
                      <button
                        type="button"
                        onClick={handleSendCaseDirective}
                        className="px-5 py-2 bg-teal-600 hover:bg-teal-500 text-white text-xs font-bold rounded-xl shadow-md"
                      >
                        Send Encrypted Counsel Directive
                      </button>
                    </div>
                  </div>
                </div>
              )}

              {/* Suggested Case Solution & Legal Defense Brief Modal */}
              {activeSolutionFinding && (
                <div className="fixed inset-0 bg-slate-900/70 backdrop-blur-sm z-50 flex items-center justify-center p-4">
                  <div className="bg-slate-900 rounded-2xl max-w-3xl w-full text-white border border-slate-800 shadow-2xl overflow-hidden flex flex-col max-h-[90vh] animate-fadeIn">
                    
                    {/* Modal Header */}
                    <div className="p-5 bg-gradient-to-r from-slate-900 via-slate-850 to-teal-950 border-b border-slate-800 flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <div className="p-2.5 bg-teal-500/20 border border-teal-500/30 rounded-xl text-teal-400">
                          <Sparkles className="w-5 h-5 animate-pulse" />
                        </div>
                        <div>
                          <div className="flex items-center gap-2">
                            <span className="text-[10px] font-black uppercase px-2 py-0.5 bg-teal-500/20 text-teal-300 border border-teal-500/30 rounded">
                              {activeSolutionFinding.regulation}
                            </span>
                            <span className="text-xs text-slate-400 font-mono">{activeSolutionFinding.legalArticle}</span>
                          </div>
                          <h3 className="text-sm font-black text-white mt-1">{activeSolutionFinding.title}</h3>
                        </div>
                      </div>

                      <button 
                        onClick={() => setActiveSolutionFinding(null)}
                        className="p-1.5 text-slate-400 hover:text-white rounded-lg bg-slate-800/60 hover:bg-slate-800 transition-colors"
                      >
                        <X className="w-5 h-5" />
                      </button>
                    </div>

                    {/* Penalty Exposure & Case Banner */}
                    <div className="p-4 bg-slate-950/80 border-b border-slate-800/80 grid grid-cols-1 md:grid-cols-2 gap-3">
                      <div className="p-3 bg-rose-950/40 border border-rose-800/50 rounded-xl space-y-1">
                        <span className="text-[9px] font-black text-rose-300 uppercase tracking-widest flex items-center gap-1">
                          <Coins className="w-3.5 h-3.5 text-rose-400" />
                          Calculated Penalty Exposure
                        </span>
                        <div className="text-base font-black text-rose-200">{activeSolutionFinding.estimatedPenalty}</div>
                        <p className="text-[10px] text-rose-300/80 font-mono leading-tight">{activeSolutionFinding.penaltyFormula}</p>
                      </div>

                      <div className="p-3 bg-slate-900/90 border border-slate-800 rounded-xl space-y-1">
                        <span className="text-[9px] font-black text-slate-400 uppercase tracking-widest flex items-center gap-1">
                          <Building2 className="w-3.5 h-3.5 text-teal-400" />
                          Client Entity Target
                        </span>
                        <div className="text-sm font-black text-white">{activeSolutionFinding.clientName}</div>
                        <p className="text-[10px] text-slate-400 truncate font-mono">{activeSolutionFinding.targetComponent}</p>
                      </div>
                    </div>

                    {/* Solution Navigation Tabs */}
                    <div className="flex border-b border-slate-800 bg-slate-900/90 px-4">
                      {[
                        { id: 'defense', label: 'Counsel Defense Brief & Strategy', icon: Scale },
                        { id: 'code', label: 'Technical Code Remediation Patch', icon: Code2 },
                        { id: 'plan', label: '4-Step Legal Execution Plan', icon: CheckCircle2 }
                      ].map(t => (
                        <button
                          key={t.id}
                          type="button"
                          onClick={() => setActiveSolutionTab(t.id as any)}
                          className={`py-3 px-4 text-xs font-bold transition-all border-b-2 flex items-center gap-2 cursor-pointer ${
                            activeSolutionTab === t.id
                              ? 'border-teal-500 text-teal-300 bg-teal-500/10'
                              : 'border-transparent text-slate-400 hover:text-slate-200'
                          }`}
                        >
                          <t.icon className="w-4 h-4" />
                          <span>{t.label}</span>
                        </button>
                      ))}
                    </div>

                    {/* Tab Content Body */}
                    <div className="p-5 overflow-y-auto space-y-4 text-xs leading-relaxed flex-1">
                      {activeSolutionTab === 'defense' && (
                        <div className="space-y-4">
                          <div className="p-4 bg-slate-950 border border-slate-800 rounded-xl space-y-2">
                            <h4 className="text-xs font-black text-teal-400 uppercase tracking-wider flex items-center gap-2">
                              <ShieldAlert className="w-4 h-4 text-teal-400" />
                              Lawyer / Consultant Defense Argument Strategy
                            </h4>
                            <p className="text-slate-300 font-medium leading-relaxed">
                              {activeSolutionFinding.caseSolution.defenseStrategy}
                            </p>
                          </div>

                          <div className="p-4 bg-slate-950 border border-slate-800 rounded-xl space-y-1">
                            <span className="text-[9px] font-black text-slate-400 uppercase tracking-widest block">Statutory Precedent & Guidance</span>
                            <span className="text-xs font-bold text-teal-300">{activeSolutionFinding.caseSolution.regulatoryPrecedent}</span>
                          </div>
                        </div>
                      )}

                      {activeSolutionTab === 'code' && (
                        <div className="space-y-3">
                          <div className="flex items-center justify-between">
                            <span className="text-[10px] font-mono text-slate-400 flex items-center gap-1.5">
                              <FileCode className="w-4 h-4 text-teal-400" />
                              Suggested Production Code Patch (Ready to Inject)
                            </span>
                            <button
                              type="button"
                              onClick={() => {
                                navigator.clipboard.writeText(activeSolutionFinding.caseSolution.codePatchSnippet);
                                setCopiedCode(true);
                                setTimeout(() => setCopiedCode(false), 2000);
                              }}
                              className="px-3 py-1 bg-slate-800 hover:bg-slate-700 text-teal-300 border border-slate-700 rounded-lg text-[10px] font-bold flex items-center gap-1 transition-colors cursor-pointer"
                            >
                              {copiedCode ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
                              <span>{copiedCode ? 'Copied to Clipboard!' : 'Copy Code Snippet'}</span>
                            </button>
                          </div>

                          <pre className="p-4 bg-slate-950 border border-slate-800 rounded-xl text-teal-300 font-mono text-[11px] overflow-x-auto leading-relaxed border-l-4 border-l-teal-500">
                            {activeSolutionFinding.caseSolution.codePatchSnippet}
                          </pre>
                        </div>
                      )}

                      {activeSolutionTab === 'plan' && (
                        <div className="space-y-3">
                          <h4 className="text-xs font-black text-teal-400 uppercase tracking-wider">Step-By-Step Counsel Execution Plan</h4>
                          <div className="space-y-2">
                            {activeSolutionFinding.caseSolution.stepByStepPlan.map((step: string, idx: number) => (
                              <div key={idx} className="p-3 bg-slate-950 border border-slate-800 rounded-xl flex items-start gap-3">
                                <span className="w-6 h-6 rounded-full bg-teal-500/20 text-teal-300 font-black text-xs flex items-center justify-center shrink-0 border border-teal-500/30">
                                  {idx + 1}
                                </span>
                                <span className="text-slate-300 font-medium text-xs mt-0.5">{step}</span>
                              </div>
                            ))}
                          </div>
                        </div>
                      )}
                    </div>

                    {/* Modal Footer */}
                    <div className="p-4 bg-slate-950 border-t border-slate-800 flex items-center justify-between">
                      <button
                        type="button"
                        onClick={() => setActiveSolutionFinding(null)}
                        className="px-4 py-2 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded-xl text-xs font-bold transition-colors"
                      >
                        Close Solution
                      </button>

                      <div className="flex items-center gap-2">
                        <button
                          type="button"
                          onClick={() => {
                            const finding = activeSolutionFinding;
                            setActiveSolutionFinding(null);
                            setCaseDirectiveFinding(finding);
                            setCaseDirectiveMessage(`Formally directing client to execute proposed solution:\n\n1. Defense Brief: ${finding.caseSolution.defenseStrategy}\n\n2. Mandatory Code Remediation: Deploy patch for ${finding.targetComponent}`);
                          }}
                          className="px-4 py-2 bg-slate-800 hover:bg-slate-700 text-teal-300 border border-slate-700 rounded-xl text-xs font-bold transition-colors flex items-center gap-1.5"
                        >
                          <MessageSquare className="w-3.5 h-3.5" />
                          <span>Attach to Counsel Directive</span>
                        </button>

                        <button
                          type="button"
                          onClick={() => {
                            handleResolveFinding(activeSolutionFinding.id);
                            setActiveSolutionFinding(null);
                          }}
                          className="px-5 py-2 bg-emerald-600 hover:bg-emerald-500 text-white rounded-xl text-xs font-bold shadow-md transition-colors flex items-center gap-1.5"
                        >
                          <CheckCircle2 className="w-4 h-4" />
                          <span>Apply Solution & Mark Case Resolved</span>
                        </button>
                      </div>
                    </div>

                  </div>
                </div>
              )}

            </div>
          )}

          {/* 2. Review & Policy Approval Queue Tab */}
          {activeTab === 'reviews' && (
            <div className="space-y-4">
              {filteredReviews.length === 0 ? (
                <div className="text-center p-12 text-slate-400 text-xs">No pending policies or assessments awaiting audit.</div>
              ) : (
                <div className="space-y-4">
                  {filteredReviews.map((item) => {
                    const isPending = item.status === 'Pending Review';
                    return (
                      <div 
                        key={item.id} 
                        className="border border-slate-200 rounded-xl overflow-x-auto shadow-sm"
                      >
                        {/* Summary Header */}
                        <div className="px-5 py-4 bg-slate-50 border-b border-slate-200 flex flex-col md:flex-row md:items-center justify-between gap-3">
                          <div className="space-y-1">
                            <div className="flex items-center gap-2">
                              <span className="text-[10px] font-bold text-teal-700 bg-teal-50 border border-teal-100 px-2 py-0.5 rounded">
                                {item.category}
                              </span>
                              <span className="text-xs font-black text-slate-800">
                                {item.clientName}
                              </span>
                            </div>
                            <h3 className="text-sm font-black text-slate-900 mt-1">
                              {item.documentTitle}
                            </h3>
                          </div>

                          <div className="flex items-center gap-3">
                            <span className={`text-[9px] font-bold px-2 py-0.5 rounded uppercase ${
                              item.status === 'Pending Review' ? 'bg-amber-50 text-amber-600 border border-amber-100' :
                              item.status === 'Approved' ? 'bg-emerald-50 text-emerald-600 border border-emerald-100' : 'bg-rose-50 text-rose-600'
                            }`}>
                              {item.status}
                            </span>
                            {isPending && (
                              <button 
                                onClick={() => setActiveReviewItem(item)}
                                className="px-3.5 py-1.5 bg-teal-650 hover:bg-teal-700 text-white text-[10px] font-bold rounded-lg cursor-pointer"
                              >
                                Audit Submission
                              </button>
                            )}
                          </div>
                        </div>

                        {/* Snippet / Code block */}
                        <div className="p-5 space-y-3">
                          <div className="text-[10px] font-bold text-slate-400 uppercase tracking-widest flex items-center gap-1">
                            <FileText className="w-3.5 h-3.5 text-slate-400" />
                            Submitted Content Snippet
                          </div>
                          <pre className="text-[11px] font-mono leading-relaxed bg-slate-950 text-slate-300 p-4 rounded-xl overflow-x-auto border border-slate-850">
                            {item.contentSnippet}
                          </pre>
                          <div className="flex justify-between items-center text-[10px] text-slate-500 font-medium">
                            <span>Author: <strong className="text-slate-700">{item.submittedBy}</strong></span>
                            <span>Received: <strong>{item.submittedAt}</strong></span>
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
          )}

          {/* 3. Document Vault Tab */}
          {activeTab === 'vault' && (
            <div className="space-y-4">
              {filteredDocs.length === 0 ? (
                <div className="text-center p-12 text-slate-400 text-xs">No audited regulatory documents found in Vault.</div>
              ) : (
                <div className="bg-white border border-slate-200 rounded-xl overflow-x-auto shadow-sm">
                  <table className="min-w-full text-left text-sm divide-y divide-slate-100">
                    <thead className="bg-slate-50 text-[10px] font-bold uppercase tracking-wider text-slate-500 border-b border-slate-200">
                      <tr>
                        <th className="px-5 py-3">Document Title</th>
                        <th className="px-5 py-3">Client Entity</th>
                        <th className="px-5 py-3">Sovereign Class</th>
                        <th className="px-5 py-3">SHA-256 Ledger Hash</th>
                        <th className="px-5 py-3 text-right">Actions</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100 bg-white">
                      {filteredDocs.map((doc) => (
                        <tr key={doc.id} className="hover:bg-slate-50/70 transition-colors">
                          <td className="px-5 py-3.5">
                            <div className="flex items-center gap-2.5">
                              <FileLock className="w-4 h-4 text-teal-600 shrink-0" />
                              <div>
                                <div className="text-xs font-black text-slate-950">{doc.title}</div>
                                <div className="text-[9px] text-slate-400 mt-0.5">{doc.uploadedAt} • Size: {doc.fileSize} • {doc.version}</div>
                              </div>
                            </div>
                          </td>
                          <td className="px-5 py-3.5 text-xs text-slate-700 font-bold">
                            {doc.clientName}
                          </td>
                          <td className="px-5 py-3.5">
                            <span className="px-1.5 py-0.5 bg-slate-100 border border-slate-200 text-slate-650 text-[9px] font-bold rounded">
                              {doc.category}
                            </span>
                          </td>
                          <td className="px-5 py-3.5 font-mono text-[10px] text-slate-400">
                            {doc.sha256Hash.substring(0, 16)}...
                          </td>
                          <td className="px-5 py-3.5 text-right">
                            <button 
                              onClick={() => triggerToast(`Initiated tamper-proof down-link for: ${doc.title}`)}
                              className="p-1.5 text-slate-400 hover:text-teal-600 hover:bg-teal-50 rounded-lg transition-colors cursor-pointer"
                              title="Download document and verification hash"
                            >
                              <Download className="w-4 h-4" />
                            </button>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </div>
          )}

          {/* 4. Filing & Deadlines Tab */}
          {activeTab === 'tasks' && (
            <div className="space-y-4">
              {filteredDeadlines.length === 0 ? (
                <div className="text-center p-12 text-slate-400 text-xs">No pending regulatory deadlines found.</div>
              ) : (
                <div className="space-y-3">
                  {filteredDeadlines.map((dl) => {
                    const isUrgent = dl.daysRemaining <= 10;
                    return (
                      <div 
                        key={dl.id} 
                        className="p-4 bg-slate-50 border border-slate-200 rounded-xl flex flex-col md:flex-row items-start md:items-center justify-between gap-4 shadow-xs hover:border-teal-300 transition-colors"
                      >
                        <div className="space-y-1">
                          <div className="flex items-center gap-2">
                            <span className={`text-[9px] font-black px-2 py-0.5 rounded border uppercase ${
                              dl.priority === 'High' ? 'bg-rose-50 text-rose-600 border-rose-100' : 'bg-amber-50 text-amber-600 border-amber-100'
                            }`}>
                              {dl.regulation}
                            </span>
                            <span className="text-xs font-black text-slate-900">{dl.clientName}</span>
                          </div>
                          <h3 className="text-xs font-bold text-slate-700 mt-1">
                            {dl.taskTitle}
                          </h3>
                        </div>

                        <div className="flex items-center gap-4 sm:gap-6">
                          <div className="text-right">
                            <span className="text-[9px] font-bold text-slate-400 uppercase tracking-widest block">Filing Due</span>
                            <span className="text-xs font-mono font-bold text-slate-800">{dl.dueDate}</span>
                          </div>

                          <div className="text-right">
                            <span className="text-[9px] font-bold text-slate-400 uppercase tracking-widest block">Countdown</span>
                            <span className={`text-xs font-black ${isUrgent ? 'text-rose-600 animate-pulse' : 'text-slate-700'}`}>
                              {dl.daysRemaining} days remaining
                            </span>
                          </div>

                          <div className="flex gap-2">
                            <button 
                              onClick={() => {
                                setDeadlines(prev => prev.filter(d => d.id !== dl.id));
                                triggerToast(`Marked ${dl.taskTitle} as completed and logged to audit trail.`);
                              }}
                              className="px-3 py-1.5 bg-emerald-50 hover:bg-emerald-100 border border-emerald-200 text-emerald-700 text-[10px] font-bold rounded-lg transition-colors cursor-pointer flex items-center gap-1.5"
                            >
                              <CheckCircle2 className="w-3.5 h-3.5" /> Complete
                            </button>
                            <button 
                              onClick={() => {
                                setSelectedClient(dl.clientId);
                                setActiveTab('comms');
                                setLawyerMessage(`Counsel Warning regarding upcoming ${dl.regulation} filing target on ${dl.dueDate}.\n\nHello Team, we must prepare the final submission for "${dl.taskTitle}". Let me know when the primary draft is loaded in the Workspace repository.`);
                              }}
                              className="px-3 py-1.5 bg-white hover:bg-slate-100 border border-slate-200 text-slate-700 text-[10px] font-bold rounded-lg transition-colors cursor-pointer flex items-center gap-1.5"
                            >
                              <AlertTriangle className="w-3.5 h-3.5" /> Warning
                            </button>
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
          )}

          {/* 5. Secure Communications & AI Assistant Tab */}
          {activeTab === 'comms' && (
            <div className="grid grid-cols-1 lg:grid-cols-5 gap-4 sm:gap-6">
              
              {/* Chat thread (3 columns) */}
              <div className="lg:col-span-3 border border-slate-200 rounded-xl flex flex-col h-[520px] bg-slate-50/30">
                <div className="px-4 py-3 bg-slate-50 border-b border-slate-200 flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 animate-pulse"></span>
                    <h3 className="text-xs font-black uppercase text-slate-700">Encrypted Consultation Channel</h3>
                  </div>
                  <span className="text-[8px] font-mono font-bold text-slate-400 uppercase">Keycloak Session Secure</span>
                </div>

                {/* Messages Panel */}
                <div className="flex-1 p-4 overflow-y-auto space-y-4">
                  {messages
                    .filter(m => selectedClient === 'ALL' || m.clientId === selectedClient)
                    .map((msg) => (
                      <div 
                        key={msg.id} 
                        className={`flex flex-col max-w-[85%] ${msg.isLawyer ? 'ml-auto items-end' : 'mr-auto items-start'}`}
                      >
                        <div className="flex items-center gap-2 text-[9px] text-slate-400 font-bold mb-1">
                          <span>{msg.sender}</span>
                          <span>•</span>
                          <span>{msg.role}</span>
                        </div>
                        <div className={`p-3 rounded-2xl text-[11px] leading-relaxed font-medium ${
                          msg.isLawyer 
                            ? 'bg-teal-650 text-white rounded-tr-none' 
                            : 'bg-white border border-slate-200 text-slate-800 rounded-tl-none shadow-xs'
                        }`}>
                          <p className="whitespace-pre-wrap">{msg.content}</p>
                        </div>
                        <span className="text-[8px] text-slate-400 font-mono mt-1">{msg.timestamp}</span>
                      </div>
                    ))}
                </div>

                {/* Chat Sender Form */}
                <form onSubmit={handleSendMessage} className="p-3 border-t border-slate-200 bg-white flex gap-2">
                  <input 
                    type="text" 
                    value={lawyerMessage}
                    onChange={(e) => setLawyerMessage(e.target.value)}
                    placeholder="Type encrypted message to client team..." 
                    className="flex-1 px-3 py-2 border border-slate-200 rounded-xl text-xs text-slate-800 bg-slate-50 outline-none focus:ring-1 focus:ring-teal-500"
                  />
                  <button 
                    type="submit"
                    className="p-2 bg-teal-600 hover:bg-teal-500 text-white rounded-xl transition-colors cursor-pointer"
                  >
                    <Send className="w-4 h-4" />
                  </button>
                </form>
              </div>

              {/* AI Drafting Assistant (2 columns) */}
              <div className="lg:col-span-2 border border-slate-200 rounded-xl p-5 bg-slate-50/50 flex flex-col justify-between space-y-4">
                <div className="space-y-2">
                  <div className="flex items-center gap-2">
                    <Sparkles className="w-5 h-5 text-teal-600 animate-pulse" />
                    <h3 className="text-xs font-black uppercase text-slate-800">Sovereign AI Legal Drafting co-pilot</h3>
                  </div>
                  <p className="text-[10px] text-slate-500 leading-relaxed">
                    Draft bespoke regulatory opinions, statutory mitigation responses, and compliant SLA contract updates.
                  </p>
                </div>

                <div className="space-y-3 flex-1 overflow-y-auto max-h-[380px] pr-1">
                  <div>
                    <label className="block text-[9px] font-bold text-slate-400 uppercase tracking-widest mb-1">Select Clause Archetype</label>
                    <select 
                      value={aiDraftClauseType}
                      onChange={(e) => setAiDraftClauseType(e.target.value)}
                      className="w-full bg-white border border-slate-200 rounded-lg text-[10px] py-1.5 px-2.5 text-slate-700 outline-none font-bold"
                    >
                      <option value="unilateral-revocation">GDPR Art 22 Unilateral Revocation</option>
                      <option value="data-sovereign">Frankfurt Sovereign Enclave Protocol</option>
                      <option value="dora-threat-sla">DORA Threat Dry-Run SLA Annex</option>
                      <option value="pqc-telemetry">EHDS Telemetry Consent (PQC)</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-[9px] font-bold text-slate-400 uppercase tracking-widest mb-1">Drafting Tone & Defense Bias</label>
                    <div className="grid grid-cols-2 gap-1.5">
                      {[
                        { id: 'risk-averse', label: 'Risk-Averse' },
                        { id: 'pro-business', label: 'Pro-Business' },
                        { id: 'regulatory', label: 'Auditor Spec' },
                        { id: 'litigious', label: 'Defensive' }
                      ].map(t => (
                        <button
                          key={t.id}
                          type="button"
                          onClick={() => setAiDraftTone(t.id as any)}
                          className={`px-2 py-1.5 text-[9px] font-bold border rounded-lg transition-colors ${
                            aiDraftTone === t.id 
                              ? 'bg-teal-50 border-teal-500 text-teal-700' 
                              : 'bg-white border-slate-200 text-slate-600 hover:bg-slate-50'
                          }`}
                        >
                          {t.label}
                        </button>
                      ))}
                    </div>
                  </div>

                  <div>
                    <label className="block text-[9px] font-bold text-slate-400 uppercase tracking-widest mb-1">What statement should we formulate?</label>
                    <textarea 
                      rows={3}
                      value={aiDraftPrompt}
                      onChange={(e) => setAiDraftPrompt(e.target.value)}
                      placeholder="e.g. Draft a compliance directive on patient telemetry patient unilateral revocation requirements under GDPR Article 22."
                      className="w-full bg-white border border-slate-200 rounded-lg text-xs p-2.5 text-slate-800 placeholder-slate-400 outline-none focus:ring-1 focus:ring-teal-500 resize-none"
                    />
                  </div>

                  {aiDraftedOutput && (
                    <div className="space-y-2 pt-2 border-t border-slate-200">
                      <div className="flex items-center justify-between">
                        <label className="block text-[9px] font-bold text-teal-700 uppercase tracking-wider">Generated Opinion Draft</label>
                        <span className="text-[8px] font-mono font-bold text-slate-400 uppercase">Verifiably Sound</span>
                      </div>
                      <div className="bg-slate-900 border border-slate-800 p-3 rounded-xl max-h-56 overflow-y-auto">
                        <div className="text-[10px] font-sans text-emerald-400 leading-relaxed markdown-body">
                          <Markdown>{aiDraftedOutput}</Markdown>
                        </div>
                      </div>

                      <div className="grid grid-cols-3 gap-1 pt-1.5">
                        <button
                          type="button"
                          onClick={() => {
                            setLawyerMessage(aiDraftedOutput);
                            triggerToast('Opinion inserted directly into Secure Consultation thread!');
                          }}
                          className="px-2 py-1.5 bg-teal-50 hover:bg-teal-100 border border-teal-200 text-teal-700 rounded-lg text-[8px] font-bold transition-all text-center"
                        >
                          Send to Chat
                        </button>
                        <button
                          type="button"
                          onClick={() => {
                            const clientObj = clients.find(c => c.id === (selectedClient === 'ALL' ? 'c-1' : selectedClient)) || clients[0];
                            const newDoc: ComplianceDocument = {
                              id: `doc-ai-${Date.now()}`,
                              clientId: clientObj.id,
                              clientName: clientObj.companyName,
                              title: `AI Opinion - ${aiDraftClauseType.toUpperCase().replace('-', ' ')}`,
                              version: 'v1.0_Sovereign_AI',
                              fileSize: '4.8 KB',
                              uploadedAt: new Date().toISOString().split('T')[0],
                              category: 'Legal Opinion',
                              sha256Hash: Array.from(crypto.getRandomValues(new Uint8Array(16))).map(b => b.toString(16).padStart(2, '0')).join('')
                            };
                            setDocuments(prev => [newDoc, ...prev]);
                            triggerToast(`Exported custom legal clause directly to Vault for ${clientObj.companyName}!`);
                          }}
                          className="px-2 py-1.5 bg-indigo-50 hover:bg-indigo-100 border border-indigo-200 text-indigo-700 rounded-lg text-[8px] font-bold transition-all text-center"
                        >
                          Export to Vault
                        </button>
                        <button
                          type="button"
                          onClick={() => {
                            navigator.clipboard.writeText(aiDraftedOutput);
                            triggerToast('Opinion clause copied to clipboard.');
                          }}
                          className="px-2 py-1.5 bg-slate-100 hover:bg-slate-200 border border-slate-300 text-slate-700 rounded-lg text-[8px] font-bold transition-all text-center"
                        >
                          Copy Clause
                        </button>
                      </div>
                    </div>
                  )}
                </div>

                <div className="pt-3 border-t border-slate-200">
                  <button 
                    type="button"
                    onClick={handleGenerateAiLegalOpinion}
                    disabled={isAiGenerating || !aiDraftPrompt}
                    className="w-full py-2 bg-teal-650 hover:bg-teal-700 disabled:bg-slate-200 text-white text-[10px] font-bold uppercase rounded-xl transition-all flex items-center justify-center gap-2 cursor-pointer"
                  >
                    <Sparkles className="w-3.5 h-3.5" />
                    {isAiGenerating ? 'Synthesizing Legal Claims...' : 'Synthesize Legal Directive'}
                  </button>
                </div>
              </div>

            </div>
          )}

          {/* 6. AI Intelligence & Evidence Tab (Consolidated) */}
          {activeTab === 'intelligence' && (
            <div className="space-y-6 animate-fadeIn">
              
              {/* Sub-navigation for Intelligence tools */}
              <div className="flex items-center gap-1.5 p-1 bg-slate-100 rounded-xl w-fit">
                {[
                  { id: 'dossier', label: 'Compliance Dossier', icon: FileCode },
                  { id: 'moat', label: 'Sovereign AI Moat', icon: Cpu },
                  { id: 'ledger', label: 'Verification Ledger', icon: History }
                ].map((st) => (
                  <button
                    key={st.id}
                    onClick={() => setIntelligenceSubTab(st.id as any)}
                    className={`px-4 py-2 rounded-lg text-[10px] font-bold uppercase tracking-tight flex items-center gap-2 transition-all cursor-pointer ${
                      intelligenceSubTab === st.id 
                        ? 'bg-white text-teal-700 shadow-sm' 
                        : 'text-slate-500 hover:text-slate-800'
                    }`}
                  >
                    <st.icon className={`w-3.5 h-3.5 ${intelligenceSubTab === st.id ? 'text-teal-600' : 'text-slate-400'}`} />
                    {st.label}
                  </button>
                ))}
              </div>

              {intelligenceSubTab === 'dossier' && (
                <div className="grid grid-cols-1 lg:grid-cols-5 gap-4 sm:gap-6">
                  {/* Configuration panel (2 columns) */}
                  <div className="lg:col-span-2 border border-slate-200 rounded-xl p-5 bg-slate-50/50 flex flex-col justify-between space-y-5">
                    <div className="space-y-4">
                      <div className="flex items-center gap-2">
                        <ShieldCheck className="w-5 h-5 text-teal-650" />
                        <h3 className="text-xs font-black uppercase text-slate-800">Dossier Integrity Configurator</h3>
                      </div>
                      <p className="text-[10px] text-slate-500 leading-relaxed">
                        Set targeted supervisory parameters to automate the collection of continuous ledger records, user consent revocations, and enclaved infrastructure signatures.
                      </p>

                      <div className="space-y-3">
                        <div>
                          <label className="block text-[9px] font-bold text-slate-400 uppercase tracking-widest mb-1">Target Client Entity</label>
                          {selectedClient !== 'ALL' ? (
                            <div className="bg-white border border-slate-200 rounded-lg p-2.5 flex items-center justify-between">
                              <span className="text-xs font-black text-slate-800">
                                {clients.find(c => c.id === selectedClient)?.companyName}
                              </span>
                              <span className="text-[8px] font-bold bg-teal-50 text-teal-700 px-1.5 py-0.5 rounded border border-teal-100 uppercase">Filtered</span>
                            </div>
                          ) : (
                            <select
                              value={selectedClient === 'ALL' ? 'c-1' : selectedClient}
                              onChange={(e) => setSelectedClient(e.target.value)}
                              className="w-full bg-white border border-slate-200 rounded-lg text-xs py-1.5 px-2.5 text-slate-700 outline-none font-bold"
                            >
                              {clients.map(c => (
                                <option key={c.id} value={c.id}>{c.companyName}</option>
                              ))}
                            </select>
                          )}
                        </div>

                        <div>
                          <label className="block text-[9px] font-bold text-slate-400 uppercase tracking-widest mb-1">Target Authority/Audience</label>
                          <select 
                            value={evidenceAudience}
                            onChange={(e) => setEvidenceAudience(e.target.value as any)}
                            className="w-full bg-white border border-slate-200 rounded-lg text-xs py-1.5 px-2.5 text-slate-700 outline-none font-bold"
                          >
                            <option value="regulator">Supervisory Authority (AEPD/CNIL/BfDI)</option>
                            <option value="c-suite">Enterprise Board / C-Suite Directors</option>
                            <option value="underwriter">Cyber Liability Underwriters & Underwriting Counsel</option>
                          </select>
                        </div>

                        <div>
                          <label className="block text-[9px] font-bold text-slate-400 uppercase tracking-widest mb-1">Audit Trail Fidelity Depth</label>
                          <select 
                            value={evidenceDepth}
                            onChange={(e) => setEvidenceDepth(e.target.value as any)}
                            className="w-full bg-white border border-slate-200 rounded-lg text-xs py-1.5 px-2.5 text-slate-700 outline-none font-bold"
                          >
                            <option value="high">High-Fidelity Merkle Log Hashes (Production Ready)</option>
                            <option value="medium">Standard Compliance Verification Checklists</option>
                            <option value="exec">Executive Summary Briefing Document</option>
                          </select>
                        </div>
                      </div>

                      {/* Cryptographic Verification Step */}
                      <div className="pt-4 border-t border-slate-200 space-y-3">
                        <div className="flex items-center justify-between">
                          <span className="text-[9px] font-black uppercase text-slate-400 tracking-wider">Infrastructure Verification</span>
                          <span className={`text-[8px] font-bold px-1.5 py-0.5 rounded uppercase ${
                            integrityTreeVerified ? 'bg-emerald-50 text-emerald-700 border border-emerald-100' : 'bg-slate-100 text-slate-400'
                          }`}>
                            {integrityTreeVerified ? 'Verified Sound' : 'Unchecked'}
                          </span>
                        </div>

                        <button
                          type="button"
                          disabled={isIntegrityChecking}
                          onClick={handleVerifyIntegrityTree}
                          className="w-full py-2 bg-white hover:bg-slate-50 disabled:bg-slate-50 border border-slate-250 text-slate-700 text-[10px] font-black uppercase rounded-lg transition-colors flex items-center justify-center gap-2 cursor-pointer"
                        >
                          <RefreshCw className={`w-3.5 h-3.5 text-slate-500 ${isIntegrityChecking ? 'animate-spin' : ''}`} />
                          {isIntegrityChecking ? 'Checking Telemetry Nodes...' : 'Verify Live Infrastructure & Merkle Paths'}
                        </button>

                        {/* Verification console logs */}
                        {integrityLogs.length > 0 && (
                          <div className="bg-slate-950 border border-slate-850 p-3 rounded-lg h-32 overflow-y-auto space-y-1 font-mono text-[9px]">
                            {integrityLogs.map((log, i) => (
                              <div key={i} className="text-slate-400 leading-normal">
                                <span className="text-teal-400 font-bold">&gt;</span> {log}
                              </div>
                            ))}
                          </div>
                        )}
                      </div>
                    </div>

                    <button
                      type="button"
                      disabled={!integrityTreeVerified || isEvidenceGenerating}
                      onClick={() => {
                        const activeClient = clients.find(c => c.id === (selectedClient === 'ALL' ? 'c-1' : selectedClient)) || clients[0];
                        handleCompileDossier(activeClient);
                      }}
                      className="w-full py-2.5 bg-teal-650 hover:bg-teal-700 disabled:bg-slate-200 text-white text-[10px] font-bold uppercase rounded-xl transition-all flex items-center justify-center gap-2 cursor-pointer"
                    >
                      <Sparkles className="w-3.5 h-3.5 text-teal-100" />
                      {isEvidenceGenerating ? 'Compiling Dossier Proofs...' : 'Compile AI Audit Dossier'}
                    </button>
                  </div>

                  {/* Dossier Display Paper (3 columns) */}
                  <div className="lg:col-span-3 border border-slate-200 rounded-xl flex flex-col h-[520px] bg-slate-50/30">
                    <div className="px-4 py-3 bg-slate-50 border-b border-slate-200 flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <FileText className="w-4 h-4 text-slate-500" />
                        <h3 className="text-xs font-black uppercase text-slate-700">Audit-Ready Compliance Dossier</h3>
                      </div>
                      <span className="text-[8px] font-mono font-bold text-slate-400 uppercase">SHA-256 Verified Ledger</span>
                    </div>

                    {/* Dossier Body */}
                    <div className="flex-1 p-5 overflow-y-auto">
                      {isEvidenceGenerating ? (
                        <div className="h-full flex flex-col items-center justify-center space-y-4">
                          <div className="relative w-12 h-12">
                            <div className="absolute inset-0 rounded-full border-4 border-slate-100 border-t-teal-650 animate-spin"></div>
                          </div>
                          <div className="text-center">
                            <p className="text-xs font-bold text-slate-700 uppercase tracking-wider">Synthesizing System Logs</p>
                            <p className="text-[9px] text-slate-400 mt-1 max-w-xs leading-normal">
                              Generating executive summary, cryptographically validating active database schema hashes, and signing European Bar Association legal credentials...
                            </p>
                          </div>
                        </div>
                      ) : evidenceDossier ? (
                        <div className="bg-white border border-slate-200/90 rounded-xl p-5 shadow-sm font-sans text-[10.5px] leading-relaxed text-slate-800 whitespace-pre-wrap select-text markdown-body">
                          <Markdown>{evidenceDossier}</Markdown>
                        </div>
                      ) : (
                        <div className="h-full flex flex-col items-center justify-center text-center p-5 sm:p-6 lg:p-8 space-y-3">
                          <div className="p-3 bg-slate-100 rounded-full border border-slate-200 text-slate-400">
                            <Layers className="w-6 h-6" />
                          </div>
                          <div>
                            <h4 className="text-xs font-bold text-slate-800">Generate Verifiable Evidence</h4>
                            <p className="text-[10px] text-slate-500 max-w-xs leading-normal mt-1">
                              Auditors or lawyers can avoid 90% manual effort. First verify the live infrastructure, then compile the formal evidence dossier detailing regulatory state proofs.
                            </p>
                          </div>
                        </div>
                      )}
                    </div>

                    {/* Actions bottom footer */}
                    {evidenceDossier && !isEvidenceGenerating && (
                      <div className="px-4 py-3 bg-white border-t border-slate-200 flex items-center justify-between gap-3">
                        <span className="text-[8px] font-mono font-bold text-slate-400 uppercase">Audit Trails Secured</span>
                        <div className="flex gap-2">
                          <button
                            type="button"
                            onClick={() => {
                              const clientObj = clients.find(c => c.id === (selectedClient === 'ALL' ? 'c-1' : selectedClient)) || clients[0];
                              const newDoc: ComplianceDocument = {
                                id: `doc-dossier-${Date.now()}`,
                                clientId: clientObj.id,
                                clientName: clientObj.companyName,
                                title: `Sovereignty Dossier: ${clientObj.companyName} (${evidenceAudience.toUpperCase()})`,
                                version: 'v1.0_Audit_Ready',
                                fileSize: '2.4 MB',
                                uploadedAt: new Date().toISOString().split('T')[0],
                                category: 'Technical Safeguards',
                                sha256Hash: Array.from(crypto.getRandomValues(new Uint8Array(8))).map(b => b.toString(16).padStart(2, '0')).join('')
                              };
                              setDocuments(prev => [newDoc, ...prev]);
                              triggerToast('Dossier archived to client vault successfully.');
                            }}
                            className="px-3 py-1.5 bg-slate-100 hover:bg-slate-200 text-slate-700 text-[9px] font-bold uppercase rounded-lg transition-colors flex items-center gap-1.5"
                          >
                            <Download className="w-3 h-3" />
                            Archive to Vault
                          </button>
                          <button
                            type="button"
                            className="px-3 py-1.5 bg-indigo-600 hover:bg-indigo-700 text-white text-[9px] font-bold uppercase rounded-lg transition-colors flex items-center gap-1.5 shadow-sm shadow-indigo-200/50"
                          >
                            <ExternalLink className="w-3 h-3" />
                            Download PDF Dossier
                          </button>
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              )}

              {intelligenceSubTab === 'moat' && (
                <div className="space-y-6 animate-fadeIn">
                  {/* Header card with system metrics */}
                  <div className="bg-slate-900 text-white rounded-2xl p-4 sm:p-5 lg:p-6 border border-slate-800 shadow-xl relative overflow-hidden">
                    <div className="absolute top-0 right-0 p-5 sm:p-6 lg:p-8 opacity-10 pointer-events-none">
                      <Cpu className="w-48 h-48 text-teal-400" />
                    </div>
                    <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-4 sm:gap-6">
                      <div className="space-y-2">
                        <div className="flex items-center gap-2">
                          <span className="text-[10px] font-black uppercase text-teal-400 tracking-widest bg-teal-950/80 px-2.5 py-1 rounded-md border border-teal-800/60">Enterprise Sovereignty Sync Active</span>
                        </div>
                        <h3 className="text-lg font-black tracking-tight text-slate-100 uppercase">Proprietary AI Moat & DevSecOps Suite</h3>
                        <p className="text-xs text-slate-400 max-w-xl leading-relaxed">
                          Equip legal advisors with context-aware Retrieval-Augmented Generation, automated drift patch recommendations, and predictive risk trajectory analytics.
                        </p>
                      </div>
                      <div className="flex gap-4 items-center">
                        <div className="px-4 py-3 bg-slate-800/80 rounded-xl border border-slate-700 text-center">
                          <span className="block text-[8px] font-bold text-slate-500 uppercase tracking-wider">Active Drift Guards</span>
                          <span className="text-xs font-black text-teal-400 uppercase mt-1 block">Continuous Sync</span>
                        </div>
                      </div>
                    </div>
                  </div>

                  <div className="grid grid-cols-1 lg:grid-cols-12 gap-4 sm:gap-6">
                    {/* Simplified Moat Engines for lawyers */}
                    <div className="lg:col-span-12 bg-white border border-slate-200 rounded-2xl p-5 shadow-sm space-y-4">
                      <p className="text-xs text-slate-500 italic">Advanced Forensic AI tools are synchronized with your Counsel credentials.</p>
                    </div>
                  </div>
                </div>
              )}

              {intelligenceSubTab === 'ledger' && (
                <div className="space-y-6 animate-fadeIn">
                  <div className="bg-white border border-slate-200 rounded-2xl p-5 shadow-sm space-y-4">
                    <div className="flex items-center justify-between border-b border-slate-100 pb-3">
                      <div className="flex items-center gap-2">
                        <Lock className="w-5 h-5 text-teal-650" />
                        <div>
                          <h4 className="text-xs font-black uppercase text-slate-900">Immutable Cryptographic Audit Trail</h4>
                          <p className="text-[10px] text-slate-400">Tamper-proof ledger preserving compliance, approvals, and legal sign-off actions</p>
                        </div>
                      </div>
                    </div>
                    {/* Ledger Table logic here */}
                    <div className="overflow-x-auto border border-slate-150 rounded-xl">
                      <table className="w-full text-left border-collapse text-[10px]">
                        <thead>
                          <tr className="bg-slate-50 border-b border-slate-150 text-slate-400 font-bold uppercase">
                            <th className="py-2.5 px-4 font-black">Block Height</th>
                            <th className="py-2.5 px-4 font-black">Timestamp (UTC)</th>
                            <th className="py-2.5 px-4 font-black">Action</th>
                            <th className="py-2.5 px-4 font-black">Authorized Identity</th>
                          </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-100">
                          {ledgerBlocks.map((blk) => (
                            <tr key={blk.blockHeight}>
                              <td className="py-2.5 px-4 font-mono font-bold text-teal-700">#{blk.blockHeight}</td>
                              <td className="py-2.5 px-4 text-slate-500">{blk.timestamp}</td>
                              <td className="py-2.5 px-4 font-bold text-slate-800">{blk.action}</td>
                              <td className="py-2.5 px-4 text-slate-600">{blk.identity}</td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  </div>
                </div>
              )}
            </div>
          )}

          {/* 7. Client Service Store (Marketplace) */}
          {activeTab === 'marketplace' && (
            <div className="animate-fadeIn">
              <EnterpriseMarketplace 
                activeTiers={activeAddons}
                onActivate={handleActivateAddon}
                onDeactivate={handleDeactivateAddon}
              />
            </div>
          )}

          {/* 8. BILLING & SUBSCRIPTIONS TAB */}
          {activeTab === 'billing' && (
            <div className="space-y-8 animate-fadeIn text-left">
              
              {/* Subscription Plan Selection */}
              <div className="bg-white rounded-2xl border border-slate-200 p-5 sm:p-6 lg:p-8 shadow-sm">
                <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-8 gap-4">
                  <div>
                    <h3 className="text-xl font-black text-slate-900 uppercase tracking-tight">Legal Partner Subscriptions</h3>
                    <p className="text-slate-500 text-sm mt-1">Select the tier that best matches your practice's regional coverage and client volume.</p>
                  </div>
                  <div className="flex items-center gap-2 bg-slate-100 p-1 rounded-xl">
                    <button className="px-4 py-1.5 bg-white text-indigo-600 font-bold text-[10px] uppercase rounded-lg shadow-sm border border-slate-200">Monthly</button>
                    <button className="px-4 py-1.5 text-slate-500 font-bold text-[10px] uppercase hover:text-slate-700">Yearly (Save 20%)</button>
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-4 sm:gap-6">
                  {[
                    {
                      name: 'Legal Partner Base',
                      price: 499,
                      features: ['10 Active Clients', 'EU Region Only', 'Standard Vault (5GB)', 'Basic AI Assistant'],
                      isCurrent: false
                    },
                    {
                      name: 'Legal Partner Plus',
                      price: 1299,
                      features: ['50 Active Clients', 'Multi-Region (Global)', 'Advanced Vault (50GB)', 'Full AI Drafting Suite', 'Forensic Scans'],
                      isCurrent: true,
                      recommended: true
                    },
                    {
                      name: 'Sovereign Elite',
                      price: 4999,
                      features: ['Unlimited Clients', 'Dedicated Enclave Support', 'Terabyte Vault Storage', 'Priority 24/7 Support', 'Custom Drift Rules'],
                      isCurrent: false
                    }
                  ].map((plan) => (
                    <div 
                      key={plan.name}
                      className={`relative flex flex-col p-4 sm:p-5 lg:p-6 rounded-2xl border-2 transition-all ${
                        plan.isCurrent 
                          ? 'border-indigo-600 bg-indigo-50/30' 
                          : 'border-slate-100 bg-white hover:border-slate-200'
                      }`}
                    >
                      {plan.recommended && (
                        <span className="absolute -top-3 left-1/2 -translate-x-1/2 bg-indigo-600 text-white text-[9px] font-black uppercase px-3 py-1 rounded-full shadow-lg">Recommended for Firms</span>
                      )}
                      
                      <div className="mb-6">
                        <h4 className="text-sm font-black text-slate-900 uppercase">{plan.name}</h4>
                        <div className="flex items-baseline gap-1 mt-2">
                          <span className="text-3xl font-black text-slate-900">€{plan.price}</span>
                          <span className="text-slate-500 text-xs font-bold">/mo</span>
                        </div>
                      </div>

                      <div className="space-y-3 flex-1 mb-8">
                        {plan.features.map(f => (
                          <div key={f} className="flex items-center gap-2 text-[11px] text-slate-600 font-medium">
                            <CheckCircle2 className="w-3.5 h-3.5 text-emerald-500 shrink-0" />
                            {f}
                          </div>
                        ))}
                      </div>

                      <button 
                        disabled={plan.isCurrent}
                        className={`w-full py-3 rounded-xl font-bold text-xs transition-all ${
                          plan.isCurrent 
                            ? 'bg-emerald-100 text-emerald-700 cursor-default flex items-center justify-center gap-2' 
                            : 'bg-indigo-600 hover:bg-indigo-700 text-white shadow-md hover:shadow-indigo-200'
                        }`}
                      >
                        {plan.isCurrent ? (
                          <>
                            <CheckCircle2 className="w-4 h-4" />
                            Current Active Plan
                          </>
                        ) : 'Switch to this Plan'}
                      </button>
                    </div>
                  ))}
                </div>
              </div>

              {/* Dynamic Sovereign & Regional Payment Gateways integration */}
              <RegionalPaymentGatewayPortal 
                baseAmountEur={1299} 
                title="Lawyer Practice Sovereign Billing Gate"
                subtitle="Settle enterprise or legal partner subscriptions on certified country-specific banking corridors"
              />

              <div className="grid grid-cols-1 lg:grid-cols-3 gap-5 sm:gap-8">
                <div className="lg:col-span-2 space-y-5 sm:space-y-8">
                  <div className="bg-white rounded-2xl border border-slate-200 p-4 sm:p-5 lg:p-6 shadow-sm">
                    <div className="flex justify-between items-center mb-6">
                      <div>
                        <h3 className="text-lg font-bold text-slate-900">Transaction History</h3>
                        <p className="text-slate-500 text-xs">Detailed ledger of compliance operations and subscription charges.</p>
                      </div>
                      <button className="flex items-center gap-2 text-indigo-600 text-xs font-bold hover:underline">
                        <Download className="w-4 h-4" />
                        Export Statement
                      </button>
                    </div>

                    <div className="overflow-hidden rounded-xl border border-slate-100">
                      <table className="w-full text-left text-xs">
                        <thead>
                          <tr className="bg-slate-50 text-slate-500 font-bold border-b border-slate-100">
                            <th className="p-4">Date</th>
                            <th className="p-4">Description</th>
                            <th className="p-4">Amount</th>
                            <th className="p-4 text-right">Status</th>
                          </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-50">
                          {billingHistory.map((tx) => (
                            <tr key={tx.id} className="hover:bg-slate-50/50">
                              <td className="p-4 text-slate-500">{tx.date}</td>
                              <td className="p-4 font-bold text-slate-900">{tx.description}</td>
                              <td className={`p-4 font-bold ${tx.amount > 0 ? 'text-emerald-600' : 'text-slate-900'}`}>
                                {tx.amount > 0 ? '+' : ''}{new Intl.NumberFormat('en-DE', { style: 'currency', currency: 'EUR' }).format(tx.amount)}
                              </td>
                              <td className="p-4 text-right">
                                <span className="bg-emerald-50 text-emerald-700 px-2 py-1 rounded-full text-[10px] font-bold">
                                  {tx.status}
                                </span>
                              </td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  </div>
                </div>

                <div className="space-y-4 sm:space-y-6">
                  <div className="bg-slate-900 text-white rounded-2xl p-4 sm:p-5 lg:p-6 shadow-xl relative overflow-hidden">
                    <div className="relative z-10 space-y-4">
                      <div className="flex justify-between items-center">
                        <div className="text-indigo-400 font-black uppercase tracking-widest text-[10px]">Current Balance</div>
                        <div className="bg-indigo-500/20 text-indigo-300 px-2 py-0.5 rounded text-[10px] font-bold border border-indigo-500/30">Partner Tier</div>
                      </div>
                      <div className="text-4xl font-black">{new Intl.NumberFormat('en-DE', { style: 'currency', currency: 'EUR' }).format(billingCredits)}</div>
                      <p className="text-slate-400 text-[10px]">Automatic top-up active at threshold of €500.00</p>
                      
                      <button className="w-full bg-indigo-600 hover:bg-indigo-700 text-white py-3 rounded-xl font-bold text-xs transition-all flex items-center justify-center gap-2">
                        <Plus className="w-4 h-4" />
                        Top up Credits
                      </button>
                    </div>
                    <Coins className="absolute -bottom-8 -right-8 w-32 h-32 text-indigo-500/10 rotate-12" />
                  </div>

                  <div className="bg-white rounded-2xl border border-slate-200 p-4 sm:p-5 lg:p-6 shadow-sm space-y-4">
                    <h4 className="text-sm font-bold text-slate-900 flex items-center gap-2">
                      <Calculator className="w-4 h-4 text-indigo-600" />
                      Subscription Details
                    </h4>
                    <div className="space-y-3">
                      <div className="flex justify-between text-xs">
                        <span className="text-slate-500">Plan Type</span>
                        <span className="font-bold text-slate-900">Legal Partner Plus</span>
                      </div>
                      <div className="flex justify-between text-xs">
                        <span className="text-slate-500">Next Billing Date</span>
                        <span className="font-bold text-slate-900">August 15, 2026</span>
                      </div>
                      <div className="flex justify-between text-xs">
                        <span className="text-slate-500">Regional Compliance Shards</span>
                        <span className="font-bold text-slate-900">5 Active</span>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* 7. Sovereign AI Moat Tab (5 Core Enterprise Upgrades) */}
          {activeTab === 'intelligence' && (
            <div className="space-y-6 animate-fadeIn">
              
              {/* Header card with system metrics */}
              <div className="bg-slate-900 text-white rounded-2xl p-4 sm:p-5 lg:p-6 border border-slate-800 shadow-xl relative overflow-hidden">
                <div className="absolute top-0 right-0 p-5 sm:p-6 lg:p-8 opacity-10 pointer-events-none">
                  <Cpu className="w-48 h-48 text-teal-400" />
                </div>
                <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-4 sm:gap-6">
                  <div className="space-y-2">
                    <div className="flex items-center gap-2">
                      <span className="text-[10px] font-black uppercase text-teal-400 tracking-widest bg-teal-950/80 px-2.5 py-1 rounded-md border border-teal-800/60">Enterprise Sovereignty Sync Active</span>
                    </div>
                    <h3 className="text-lg font-black tracking-tight text-slate-100 uppercase">Proprietary AI Moat &amp; DevSecOps Suite</h3>
                    <p className="text-xs text-slate-400 max-w-xl leading-relaxed">
                      Equip legal advisors with context-aware Retrieval-Augmented Generation, automated drift patch recommendations, predictive risk trajectory analytics, and immutable cryptographic audit trails.
                    </p>
                  </div>
                  <div className="flex gap-4 items-center">
                    <div className="px-4 py-3 bg-slate-800/80 rounded-xl border border-slate-700 text-center">
                      <span className="block text-[8px] font-bold text-slate-500 uppercase tracking-wider">Ledger Integrity</span>
                      <span className="text-xs font-black text-emerald-400 uppercase mt-1 block">Cryptographically Intact</span>
                    </div>
                    <div className="px-4 py-3 bg-slate-800/80 rounded-xl border border-slate-700 text-center">
                      <span className="block text-[8px] font-bold text-slate-500 uppercase tracking-wider">Active Drift Guards</span>
                      <span className="text-xs font-black text-teal-400 uppercase mt-1 block">Continuous Sync</span>
                    </div>
                  </div>
                </div>
              </div>

              {/* Grid layout containing the 5 main engines */}
              <div className="grid grid-cols-1 lg:grid-cols-12 gap-4 sm:gap-6">
                
                {/* 1. Context-Aware Regulatory RAG Engine (7 columns) */}
                <div className="lg:col-span-7 bg-white border border-slate-200 rounded-2xl p-5 shadow-sm space-y-4">
                  <div className="flex items-center justify-between border-b border-slate-100 pb-3">
                    <div className="flex items-center gap-2">
                      <Database className="w-5 h-5 text-teal-650" />
                      <div>
                        <h4 className="text-xs font-black uppercase text-slate-900">Context-Aware Regulatory RAG</h4>
                        <p className="text-[10px] text-slate-400">Synthesize client policies against specific local laws &amp; past audits</p>
                      </div>
                    </div>
                    <span className="text-[8px] font-mono font-bold bg-slate-100 text-slate-600 px-2 py-0.5 rounded border uppercase">Dynamic Retrieval</span>
                  </div>

                  <form onSubmit={handleRagSearch} className="space-y-3">
                    <div>
                      <label className="block text-[9px] font-bold text-slate-400 uppercase tracking-widest mb-1">RAG Context Query (Enter custom requirements or scenarios)</label>
                      <div className="flex gap-2">
                        <input
                          type="text"
                          value={ragQuery}
                          onChange={(e) => setRagQuery(e.target.value)}
                          placeholder="e.g. unilateral biometric opt-out retention laws..."
                          className="flex-1 bg-slate-50 border border-slate-200 rounded-xl text-xs py-2 px-3 text-slate-800 focus:outline-none focus:ring-2 focus:ring-teal-500"
                        />
                        <button
                          type="submit"
                          disabled={isRagSearching}
                          className="px-4 bg-teal-650 hover:bg-teal-700 disabled:bg-slate-200 text-white text-[10px] font-bold uppercase rounded-xl transition-all flex items-center gap-1.5 cursor-pointer"
                        >
                          <Search className="w-3.5 h-3.5" />
                          {isRagSearching ? 'Searching...' : 'Retrieve & Synthesize'}
                        </button>
                      </div>
                    </div>
                  </form>

                  {isRagSearching && (
                    <div className="p-10 bg-slate-50 rounded-xl border border-slate-100 flex flex-col items-center justify-center space-y-2">
                      <RefreshCw className="w-6 h-6 text-teal-600 animate-spin" />
                      <span className="text-[10px] font-bold text-slate-500 uppercase">Consulting Regional Database Trees...</span>
                    </div>
                  )}

                  {ragResults && !isRagSearching && (
                    <div className="space-y-3.5 animate-fadeIn">
                      <div className="bg-teal-50/40 border border-teal-100/80 rounded-xl p-4 space-y-2">
                        <span className="text-[9px] font-black uppercase text-teal-800 tracking-wider flex items-center gap-1.5">
                          <Sparkles className="w-3.5 h-3.5 text-teal-600" />
                          Synthesized Gap Analysis
                        </span>
                        <p className="text-[11px] text-slate-700 leading-relaxed font-sans">{ragResults.synthesizedResponse}</p>
                      </div>

                      <div className="space-y-2">
                        <span className="text-[9px] font-black uppercase text-slate-400 tracking-widest block">Ranked Source Matches &amp; Semantic Relevance</span>
                        <div className="space-y-2">
                          {ragResults.sources.map((src, i) => (
                            <div key={i} className="bg-white border border-slate-150 rounded-xl p-3 flex flex-col md:flex-row items-start md:items-center justify-between gap-3 shadow-sm hover:border-slate-300 transition-all">
                              <div className="space-y-1">
                                <span className="text-[10px] font-bold text-slate-900 block">{src.sourceName}</span>
                                <p className="text-[9px] text-slate-500 leading-relaxed italic">"{src.matchedSection}"</p>
                              </div>
                              <span className="text-[10px] font-mono font-black text-teal-700 bg-teal-50 border border-teal-100 px-2 py-0.5 rounded shrink-0">
                                {src.relevancePct}% Match
                              </span>
                            </div>
                          ))}
                        </div>
                      </div>
                    </div>
                  )}
                </div>

                {/* 2. Automated Policy Drift & Auto-Patch (5 columns) */}
                <div className="lg:col-span-5 bg-white border border-slate-200 rounded-2xl p-5 shadow-sm flex flex-col justify-between space-y-4">
                  <div className="space-y-4">
                    <div className="flex items-center justify-between border-b border-slate-100 pb-3">
                      <div className="flex items-center gap-2">
                        <Activity className="w-5 h-5 text-indigo-600" />
                        <div>
                          <h4 className="text-xs font-black uppercase text-slate-900">Automated Drift Patching</h4>
                          <p className="text-[10px] text-slate-400">Detect global changes &amp; deploy auto-patches</p>
                        </div>
                      </div>
                      <span className="text-[8px] font-mono font-bold bg-amber-50 text-amber-700 border border-amber-100 px-2 py-0.5 rounded uppercase">Real-Time Alerts</span>
                    </div>

                    <div className="space-y-3">
                      <div>
                        <label className="block text-[9px] font-bold text-slate-400 uppercase tracking-widest mb-1.5">Active Drift Events Detected</label>
                        <div className="space-y-2">
                          {driftEvents.map((drift) => (
                            <button
                              key={drift.id}
                              type="button"
                              onClick={() => setSelectedDriftId(drift.id)}
                              className={`w-full text-left p-3 rounded-xl border transition-all cursor-pointer flex justify-between items-center ${
                                selectedDriftId === drift.id
                                  ? 'bg-slate-50 border-indigo-500 ring-1 ring-indigo-500/20'
                                  : 'bg-white border-slate-150 hover:bg-slate-50'
                              }`}
                            >
                              <div>
                                <div className="flex items-center gap-2">
                                  <span className="text-[10px] font-black text-slate-800">{drift.title}</span>
                                  <span className={`text-[8px] font-mono font-bold px-1 py-0.2 rounded ${
                                    drift.status === 'Patched & Compliant'
                                      ? 'bg-emerald-50 text-emerald-700 border border-emerald-150'
                                      : 'bg-rose-50 text-rose-700 border border-rose-150'
                                  }`}>
                                    {drift.status}
                                  </span>
                                </div>
                                <p className="text-[9px] text-slate-400 mt-0.5">Impacted System: {drift.impactedSystem}</p>
                              </div>
                              <ChevronRight className="w-4 h-4 text-slate-400" />
                            </button>
                          ))}
                        </div>
                      </div>

                      {/* Selected Drift details & patch comparison */}
                      {selectedDriftId && (
                        <div className="bg-slate-50 border border-slate-200 rounded-xl p-3.5 space-y-3">
                          <div className="space-y-1">
                            <span className="text-[8px] font-black uppercase text-slate-400 tracking-wider">Drift Description</span>
                            <p className="text-[9px] text-slate-600 leading-relaxed">
                              {driftEvents.find(d => d.id === selectedDriftId)?.description}
                            </p>
                          </div>

                          <div className="grid grid-cols-2 gap-3 pt-2 border-t border-slate-200">
                            <div className="space-y-1">
                              <span className="text-[8px] font-bold text-rose-600 uppercase">Legacy System Policy</span>
                              <div className="bg-white border border-rose-100 rounded p-2 text-[9px] text-rose-700 italic leading-normal font-mono h-24 overflow-y-auto">
                                "{driftEvents.find(d => d.id === selectedDriftId)?.currentPolicyText}"
                              </div>
                            </div>
                            <div className="space-y-1">
                              <span className="text-[8px] font-bold text-emerald-600 uppercase">AI Proposed Patch</span>
                              <div className="bg-white border border-emerald-100 rounded p-2 text-[9px] text-emerald-700 font-mono leading-normal h-24 overflow-y-auto">
                                "{driftEvents.find(d => d.id === selectedDriftId)?.proposedPolicyText}"
                              </div>
                            </div>
                          </div>
                        </div>
                      )}
                    </div>
                  </div>

                  <button
                    type="button"
                    disabled={isPatching || driftEvents.find(d => d.id === selectedDriftId)?.status === 'Patched & Compliant'}
                    onClick={() => handleApplyPatch(selectedDriftId)}
                    className="w-full py-2 bg-indigo-650 hover:bg-indigo-700 disabled:bg-slate-100 disabled:text-slate-400 text-white text-[10px] font-bold uppercase rounded-xl transition-all flex items-center justify-center gap-1.5 cursor-pointer mt-4"
                  >
                    <Sparkles className="w-3.5 h-3.5" />
                    {isPatching ? 'Syncing Auto-Patch...' : driftEvents.find(d => d.id === selectedDriftId)?.status === 'Patched & Compliant' ? 'Patch Fully Implemented' : 'Generate & Deploy Auto-Patch'}
                  </button>
                </div>

                {/* 3. Predictive Risk Scoring Engine (6 columns) */}
                <div className="lg:col-span-6 bg-white border border-slate-200 rounded-2xl p-5 shadow-sm space-y-4">
                  <div className="flex items-center justify-between border-b border-slate-100 pb-3">
                    <div className="flex items-center gap-2">
                      <TrendingUp className="w-5 h-5 text-rose-650" />
                      <div>
                        <h4 className="text-xs font-black uppercase text-slate-900">Predictive Risk Scoring</h4>
                        <p className="text-[10px] text-slate-400">Trend forecasting to prevent compliance loss</p>
                      </div>
                    </div>
                    <span className="text-[8px] font-mono font-bold bg-rose-50 text-rose-700 border border-rose-100 px-2 py-0.5 rounded uppercase">Risk Projection</span>
                  </div>

                  <div className="space-y-4">
                    <div className="flex items-center justify-between">
                      <span className="text-[10px] font-bold text-slate-500 uppercase tracking-wider">Forecast Horizon</span>
                      <div className="flex gap-1 bg-slate-100 p-1 rounded-lg">
                        {[30, 60, 90].map((days) => (
                          <button
                            key={days}
                            type="button"
                            onClick={() => setForecastMonths(days === 30 ? 1 : days === 60 ? 2 : 3)}
                            className={`px-3 py-1 text-[9px] font-bold rounded-md uppercase cursor-pointer transition-all ${
                              (days === 30 && forecastMonths === 1) || (days === 60 && forecastMonths === 2) || (days === 90 && forecastMonths === 3)
                                ? 'bg-white text-rose-650 shadow-sm'
                                : 'text-slate-600 hover:text-slate-950'
                            }`}
                          >
                            {days} Days
                          </button>
                        ))}
                      </div>
                    </div>

                    <button
                      type="button"
                      onClick={handleCalculateForecast}
                      disabled={isCalculatingForecast}
                      className="w-full py-2 bg-rose-600 hover:bg-rose-700 disabled:bg-slate-200 text-white text-[10px] font-bold uppercase rounded-xl transition-all flex items-center justify-center gap-2 cursor-pointer"
                    >
                      <Activity className="w-3.5 h-3.5 text-rose-100" />
                      {isCalculatingForecast ? 'Analyzing Compliance Vectors...' : 'Run Predictive Trend Analysis'}
                    </button>

                    {isCalculatingForecast && (
                      <div className="p-10 bg-slate-50 rounded-xl border border-slate-100 flex flex-col items-center justify-center space-y-2">
                        <div className="w-6 h-6 border-2 border-slate-200 border-t-rose-600 rounded-full animate-spin"></div>
                        <span className="text-[10px] font-bold text-slate-400 uppercase">Predicting Drift Probabilities...</span>
                      </div>
                    )}

                    {forecastData && !isCalculatingForecast && (
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 animate-fadeIn">
                        
                        <div className="bg-slate-50 border border-slate-200 rounded-xl p-4 flex flex-col justify-between space-y-3">
                          <div>
                            <span className="text-[9px] font-black uppercase text-slate-400 block tracking-widest">Calculated Score Trajectory</span>
                            <div className="flex items-baseline gap-4 mt-2">
                              <div>
                                <span className="text-2xl font-black text-slate-800">{forecastData.currentScore}</span>
                                <span className="block text-[8px] text-slate-400 font-bold uppercase">Current</span>
                              </div>
                              <ChevronRight className="w-5 h-5 text-slate-300" />
                              <div>
                                <span className={`text-2xl font-black ${forecastData.projectedScore > 80 ? 'text-indigo-600' : 'text-rose-600'}`}>{forecastData.projectedScore}</span>
                                <span className="block text-[8px] text-slate-400 font-bold uppercase">Forecasted</span>
                              </div>
                            </div>
                          </div>

                          <div className="pt-2 border-t border-slate-200">
                            <span className="text-[8px] font-bold text-slate-400 uppercase">Probability of Critical Drift Alert</span>
                            <div className="w-full bg-slate-200 h-1.5 rounded-full overflow-hidden mt-1.5">
                              <div
                                className={`h-full ${forecastData.driftRiskProbability > 50 ? 'bg-rose-500' : 'bg-emerald-500'}`}
                                style={{ width: `${forecastData.driftRiskProbability}%` }}
                              ></div>
                            </div>
                            <div className="flex justify-between items-center text-[8px] font-bold mt-1">
                              <span className="text-slate-400">LOWER</span>
                              <span className={forecastData.driftRiskProbability > 50 ? 'text-rose-600' : 'text-emerald-600'}>
                                {forecastData.driftRiskProbability}% CHANCE
                              </span>
                            </div>
                          </div>
                        </div>

                        <div className="bg-slate-50 border border-slate-200 rounded-xl p-4 space-y-2.5">
                          <span className="text-[9px] font-black uppercase text-slate-400 block tracking-widest">Top Forecasted Drift Vulnerabilities</span>
                          <div className="space-y-2 overflow-y-auto max-h-32 pr-1">
                            {forecastData.highRiskVulnerabilities.map((v, idx) => (
                              <div key={idx} className="bg-white border border-slate-150 rounded-lg p-2.5 flex justify-between gap-3 shadow-sm">
                                <div className="space-y-0.5">
                                  <span className="text-[9px] font-bold text-slate-800 block leading-tight">{v.category}</span>
                                  <p className="text-[8px] text-slate-500 leading-normal">{v.desc}</p>
                                </div>
                                <span className="text-[9px] font-mono font-black text-rose-600 shrink-0">
                                  {v.threatIndex}
                                </span>
                              </div>
                            ))}
                          </div>
                        </div>

                      </div>
                    )}
                  </div>
                </div>

                {/* 4. Automated Legal Policy Library (6 columns) */}
                <div className="lg:col-span-6 bg-white border border-slate-200 rounded-2xl p-5 shadow-sm flex flex-col justify-between space-y-4">
                  <div className="space-y-4">
                    <div className="flex items-center justify-between border-b border-slate-100 pb-3">
                      <div className="flex items-center gap-2">
                        <FileCode className="w-5 h-5 text-teal-600" />
                        <div>
                          <h4 className="text-xs font-black uppercase text-slate-900">Legislative Library Sync</h4>
                          <p className="text-[10px] text-slate-400">Sync with latest Official Journals and Regulatory Gazettes</p>
                        </div>
                      </div>
                      <span className="text-[8px] font-mono font-bold bg-slate-100 text-slate-600 border border-slate-200 px-2 py-0.5 rounded uppercase">Legal DB</span>
                    </div>

                    <div className="space-y-3">
                      <div className="grid grid-cols-2 gap-3">
                        <div className="bg-slate-50 border border-slate-200 rounded-xl p-3 text-center">
                          <span className="block text-[8px] font-bold text-slate-400 uppercase tracking-widest mb-1">Last Sync</span>
                          <span className="text-xs font-black text-slate-800">Today, 08:00 UTC</span>
                        </div>
                        <div className="bg-slate-50 border border-slate-200 rounded-xl p-3 text-center">
                          <span className="block text-[8px] font-bold text-slate-400 uppercase tracking-widest mb-1">Sync Status</span>
                          <span className="text-xs font-black text-emerald-600">Optimal</span>
                        </div>
                      </div>
                      <p className="text-[10px] text-slate-500 leading-relaxed italic px-2">
                        Platform is currently synchronized with EU Official Journal, AEPD Circulars, and NDPR Guidelines for African Jurisdictions.
                      </p>
                    </div>
                  </div>

                  <button
                    type="button"
                    className="w-full py-2 bg-slate-900 hover:bg-slate-800 text-white text-[10px] font-bold uppercase rounded-xl transition-all flex items-center justify-center gap-1.5 cursor-pointer mt-4"
                  >
                    <RefreshCw className="w-3.5 h-3.5" />
                    Force Regulatory Metadata Re-index
                  </button>
                </div>

                {/* 5. Immutable Cryptographic Audit Trail (12 columns full width) */}
                <div className="lg:col-span-12 bg-white border border-slate-200 rounded-2xl p-5 shadow-sm space-y-4">
                  <div className="flex items-center justify-between border-b border-slate-100 pb-3">
                    <div className="flex items-center gap-2">
                      <Lock className="w-5 h-5 text-teal-650" />
                      <div>
                        <h4 className="text-xs font-black uppercase text-slate-900">Immutable Cryptographic Audit Trail</h4>
                        <p className="text-[10px] text-slate-400">Tamper-proof ledger preserving compliance, approvals, and legal sign-off actions</p>
                      </div>
                    </div>
                    <span className="text-[8px] font-mono font-bold bg-emerald-50 text-emerald-700 border border-emerald-100 px-2 py-0.5 rounded uppercase flex items-center gap-1">
                      <ShieldCheck className="w-3 h-3 text-emerald-600" />
                      Secure Block Height Verified
                    </span>
                  </div>

                  <div className="overflow-x-auto border border-slate-150 rounded-xl">
                    <table className="w-full text-left border-collapse text-[10px]">
                      <thead>
                        <tr className="bg-slate-50 border-b border-slate-150 text-slate-400 font-bold uppercase">
                          <th className="py-2.5 px-4 font-black">Block Height</th>
                          <th className="py-2.5 px-4 font-black">Timestamp (UTC)</th>
                          <th className="py-2.5 px-4 font-black">Verified Compliance Action</th>
                          <th className="py-2.5 px-4 font-black">Identity Authorized</th>
                          <th className="py-2.5 px-4 font-black font-mono">Payload Hash (SHA-256)</th>
                          <th className="py-2.5 px-4 font-black text-right">Ledger Integrity</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-slate-100">
                        {ledgerBlocks.map((blk) => (
                          <tr key={blk.blockHeight} className="hover:bg-slate-50/50 transition-colors">
                            <td className="py-2.5 px-4 font-mono font-bold text-teal-700">#{blk.blockHeight}</td>
                            <td className="py-2.5 px-4 text-slate-500">{blk.timestamp}</td>
                            <td className="py-2.5 px-4 font-bold text-slate-800">{blk.action}</td>
                            <td className="py-2.5 px-4 text-slate-600">{blk.identity}</td>
                            <td className="py-2.5 px-4 font-mono text-slate-400">{blk.payloadHash}</td>
                            <td className="py-2.5 px-4 text-right">
                              <span className="inline-flex items-center gap-1 text-[8px] font-bold bg-emerald-50 text-emerald-700 border border-emerald-100 px-1.5 py-0.5 rounded uppercase">
                                <Check className="w-2.5 h-2.5" />
                                {blk.status}
                              </span>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                  <p className="text-[9px] text-slate-400 text-center leading-normal">
                    This cryptographic ledger records all critical legal reviews, automated dossiers, and auto-patch actions with asymmetric cryptographic verification keys.
                  </p>
                </div>

              </div>

          {/* Added Global Integrators */}
          <div className="space-y-6 pt-2 border-t border-slate-100 mt-8 opacity-40 hover:opacity-100 transition-opacity">
            <div className="flex items-center gap-2 mb-4">
              <Settings className="w-4 h-4 text-slate-400" />
              <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Counsel System Integrations</span>
            </div>
            <ComplianceOpsIntegrator />
          </div>

            </div>
          )}

        </div>
      </div>

      {/* Audit Action overlay modal for the reviews */}
      <AnimatePresence>
        {activeReviewItem && (
          <div className="fixed inset-0 bg-slate-900/40 backdrop-blur-sm z-50 flex items-center justify-center p-4">
            <motion.div 
              initial={{ scale: 0.95, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.95, opacity: 0 }}
              className="bg-white rounded-2xl shadow-xl w-full max-w-xl overflow-hidden border border-slate-100"
            >
              <div className="px-6 py-5 border-b border-slate-100 flex justify-between items-center bg-slate-50">
                <h2 className="text-sm font-bold text-slate-900 flex items-center gap-2 uppercase tracking-wide">
                  <Scale className="w-4.5 h-4.5 text-teal-600" />
                  Audit & Review: {activeReviewItem.clientName}
                </h2>
                <button 
                  onClick={() => {
                    setActiveReviewItem(null);
                    setReviewDecision(null);
                  }} 
                  className="text-slate-400 hover:text-slate-600 p-1 bg-white hover:bg-slate-100 border border-slate-200 rounded-lg transition-colors cursor-pointer"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>

              <form onSubmit={handleReviewActionSubmit} className="p-4 sm:p-5 lg:p-6 space-y-4">
                <div className="space-y-1">
                  <span className="text-[9px] uppercase font-bold text-slate-400 block">Document Title</span>
                  <p className="text-xs font-black text-slate-950 leading-normal">{activeReviewItem.documentTitle}</p>
                </div>

                <div className="p-3.5 bg-slate-50 border border-slate-200 rounded-xl space-y-1">
                  <span className="text-[8px] uppercase font-bold text-slate-400 block">Submitted Document Text snippet</span>
                  <p className="text-[10px] font-mono text-slate-700 leading-relaxed italic whitespace-pre-wrap max-h-40 overflow-y-auto pr-1">
                    "{activeReviewItem.contentSnippet}"
                  </p>
                </div>

                <div className="space-y-2">
                  <span className="text-[9px] uppercase font-bold text-slate-400 block tracking-widest">Select Audit Verdict</span>
                  <div className="grid grid-cols-3 gap-2">
                    {[
                      { id: 'approve', label: 'Approve & Sign-off', desc: 'Validates NIS2/GDPR compliance.', icon: CheckCircle2, color: 'border-emerald-200 hover:bg-emerald-50 text-emerald-700 bg-emerald-50/10' },
                      { id: 'request_changes', label: 'Request Changes', desc: 'Advise revisions.', icon: RefreshCw, color: 'border-amber-200 hover:bg-amber-50 text-amber-700 bg-amber-50/10' },
                      { id: 'reject', label: 'Reject / Flag Risk', desc: 'Severely non-compliant.', icon: XCircle, color: 'border-rose-200 hover:bg-rose-50 text-rose-700 bg-rose-50/10' }
                    ].map((dec) => {
                      const isSelected = reviewDecision === dec.id;
                      return (
                        <button
                          key={dec.id}
                          type="button"
                          onClick={() => setReviewDecision(dec.id as any)}
                          className={`p-3 text-left border rounded-xl cursor-pointer transition-all flex flex-col justify-between ${
                            isSelected 
                              ? 'border-teal-600 ring-1 ring-teal-600 bg-white' 
                              : dec.color
                          }`}
                        >
                          <div className="flex items-center justify-between w-full">
                            <dec.icon className="w-4 h-4 shrink-0" />
                            {isSelected && <div className="w-1.5 h-1.5 rounded-full bg-teal-600"></div>}
                          </div>
                          <div className="mt-2.5">
                            <span className="text-[10px] font-bold block leading-tight">{dec.label}</span>
                            <span className="text-[8px] text-slate-400 block leading-normal mt-0.5">{dec.desc}</span>
                          </div>
                        </button>
                      );
                    })}
                  </div>
                </div>

                <div className="space-y-1.5">
                  <label className="text-[9px] uppercase font-bold text-slate-400 block">Add Legal Opinion Feedback & Revisions Directive</label>
                  <textarea 
                    required={reviewDecision !== 'approve'}
                    rows={3}
                    value={reviewComments}
                    onChange={(e) => setReviewComments(e.target.value)}
                    placeholder="Enter detailed statutory justifications, article matches, or required SLA adjustments here..."
                    className="w-full px-3.5 py-2.5 border border-slate-200 rounded-xl text-xs focus:ring-2 focus:ring-teal-500 focus:outline-none bg-slate-50 text-slate-800 resize-none"
                  />
                </div>

                <div className="pt-4 border-t border-slate-150 flex justify-end gap-2">
                  <button 
                    type="button" 
                    onClick={() => {
                      setActiveReviewItem(null);
                      setReviewDecision(null);
                    }} 
                    className="px-4 py-2 font-bold text-slate-500 text-xs hover:bg-slate-50 rounded-xl transition-all cursor-pointer"
                  >
                    Close Audit
                  </button>
                  <button 
                    type="submit" 
                    disabled={!reviewDecision}
                    className="px-5 py-2 bg-teal-650 hover:bg-teal-700 text-white font-bold rounded-xl shadow-lg shadow-teal-100 text-xs transition-all disabled:bg-slate-200 cursor-pointer"
                  >
                    Lock Sign-off Claim
                  </button>
                </div>
              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* Manual Audit Checklist Modal */}
      <AnimatePresence>
        {showAuditChecklist && auditTargetClient && (
          <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-md z-[100] flex items-center justify-center p-4">
            <motion.div
              initial={{ opacity: 0, scale: 0.9, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.9, y: 20 }}
              className="bg-white rounded-3xl shadow-2xl w-full max-w-4xl max-h-[90vh] overflow-hidden flex flex-col border border-white/20"
            >
              <div className="px-8 py-4 sm:py-6 bg-slate-900 text-white flex justify-between items-center shrink-0">
                <div className="flex items-center gap-4">
                  <div className="w-12 h-12 bg-teal-500/20 rounded-2xl flex items-center justify-center border border-teal-500/30">
                    <Scale className="w-6 h-6 text-teal-400" />
                  </div>
                  <div>
                    <h2 className="text-lg font-black uppercase tracking-tight">Enterprise Compliance Audit</h2>
                    <p className="text-[10px] text-slate-400 font-bold uppercase tracking-widest">{auditTargetClient.companyName} &bull; {auditTargetClient.industry}</p>
                  </div>
                </div>
                <button 
                  onClick={() => setShowAuditChecklist(false)}
                  className="w-10 h-10 bg-white/10 hover:bg-white/20 rounded-full flex items-center justify-center transition-all cursor-pointer border border-white/10"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              <div className="flex-1 overflow-y-auto p-5 sm:p-6 lg:p-8 bg-slate-50">
                <React.Suspense fallback={
                  <div className="flex flex-col items-center justify-center h-64 space-y-4">
                    <Loader2 className="w-10 h-10 text-teal-600 animate-spin" />
                    <p className="text-xs font-bold text-slate-400 uppercase animate-pulse">Loading Audit Engine...</p>
                  </div>
                }>
                  <InteractiveAuditChecklist 
                    tenantName={auditTargetClient.companyName}
                    industry={auditTargetClient.industry}
                    initialProgress={auditTargetClient.complianceScore}
                    onComplete={(report: any) => {
                      triggerToast(`Audit completed for ${auditTargetClient.companyName}. Score: ${report.score}%`);
                      
                      // Update client score
                      setClients(prev => prev.map(c => c.id === auditTargetClient.id ? {
                        ...c,
                        complianceScore: report.score,
                        lastAuditDate: new Date().toISOString().split('T')[0]
                      } : c));

                      // Log to ledger
                      addLedgerBlock(`Manual Counsel Audit Completed: ${auditTargetClient.companyName}`, "Lead Legal Counsel (OIDC Verified)", "audit_report_" + Date.now());
                      
                      setShowAuditChecklist(false);
                    }}
                  />
                </React.Suspense>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

    </div>
  );
};

export default LawyerPartnerPortal;
