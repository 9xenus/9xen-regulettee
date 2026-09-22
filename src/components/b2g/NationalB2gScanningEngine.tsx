import React, { useState, useEffect, useMemo } from 'react';
import {
  Globe,
  Building2,
  ShieldAlert,
  Search,
  RefreshCw,
  Zap,
  Mail,
  AlertTriangle,
  CheckCircle2,
  Sliders,
  Filter,
  Plus,
  Trash2,
  FileText,
  Gavel,
  DollarSign,
  Send,
  Lock,
  ChevronRight,
  Eye,
  Server,
  Database,
  Bot,
  Layers,
  ArrowUpRight,
  Sparkles,
  Download,
  X,
  Check,
  Activity,
  AlertOctagon,
  User,
  Settings,
  SlidersHorizontal,
  Compass
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { useNotification } from '../../context/NotificationContext';

export interface CountryJurisdiction {
  code: string;
  name: string;
  flag: string;
  region: 'EU' | 'AMER' | 'APAC' | 'GLOBAL';
  primaryActs: string[];
  maxFineTurnoverPct: number;
  fixedFineMaxEur: number;
  currency: string;
}

export interface CompanyEntity {
  id: string;
  name: string;
  registrationNumber: string;
  primaryCountry: string;
  crossBorderCountries: string[];
  industry: 'FINTECH' | 'HEALTHCARE' | 'CRITICAL_INFRASTRUCTURE' | 'AI_TECH' | 'ECOMMERCE' | 'GOVTECH' | 'LOGISTICS';
  status: 'MONITORED_LIST' | 'SANCTION_WATCHLIST' | 'ALLOW_LIST' | 'SUSPENDED_PORTAL';
  ceoName: string;
  ceoEmail: string;
  dpoEmail: string;
  globalAnnualTurnoverEur: number;
  scannedAssetCount: number;
  criticalViolations: number;
  mediumViolations: number;
  lowViolations: number;
  lastScannedAt: string;
}

export interface DigitalAsset {
  id: string;
  companyId: string;
  assetName: string;
  assetType: 'WEB_DOMAIN' | 'REST_API' | 'LLM_GATEWAY' | 'CLOUD_VAULT' | 'DATABASE_NODE' | 'CROSS_BORDER_PIPELINE';
  targetUrl: string;
  countryLocation: string;
  severity: 'HIGHEST_CRITICAL' | 'MEDIUM' | 'LOW_PETULANT' | 'SAFE';
  petulanceRiskScore: number; // 0 - 100
  violationFound?: string;
  nationalActBreached?: string;
  estimatedFineEur?: number;
  lastChecked: string;
  status: 'ACTIVE_INSPECTION' | 'VIOLATION_CONFIRMED' | 'REMEDIATED' | 'UNDER_REVIEW';
}

export interface DeepScanIndustryConfig {
  industry: string;
  deepScanModules: string[];
  autoEnforcementTriggerPct: number;
  crossBorderDataCheck: boolean;
  aiGovernanceCheck: boolean;
  scanFrequency: 'REALTIME_CONTINUOUS' | 'DAILY' | 'WEEKLY';
}

const COUNTRY_JURISDICTIONS: CountryJurisdiction[] = [
  { code: 'DE', name: 'Germany', flag: '🇩🇪', region: 'EU', primaryActs: ['GDPR', 'BDSG', 'IT-Sicherheitsgesetz 2.0', 'NIS2'], maxFineTurnoverPct: 4, fixedFineMaxEur: 20000000, currency: 'EUR' },
  { code: 'FR', name: 'France', flag: '🇫🇷', region: 'EU', primaryActs: ['GDPR', 'CNIL Digital Act', 'EU_AI_ACT', 'DORA'], maxFineTurnoverPct: 4, fixedFineMaxEur: 20000000, currency: 'EUR' },
  { code: 'EU', name: 'European Union (EEA)', flag: '🇪🇺', region: 'EU', primaryActs: ['EU_GDPR', 'EU_AI_ACT', 'DORA', 'NIS2', 'MiCA'], maxFineTurnoverPct: 6, fixedFineMaxEur: 35000000, currency: 'EUR' },
  { code: 'US', name: 'United States', flag: '🇺🇸', region: 'AMER', primaryActs: ['CCPA/CPRA', 'HIPAA Security Rule', 'SEC Cyber Rule', 'FTC Sec 5'], maxFineTurnoverPct: 5, fixedFineMaxEur: 25000000, currency: 'USD' },
  { code: 'GB', name: 'United Kingdom', flag: '🇬🇧', region: 'EU', primaryActs: ['UK-GDPR', 'Data Protection Bill', 'NIS Regulations'], maxFineTurnoverPct: 4, fixedFineMaxEur: 17500000, currency: 'GBP' },
  { code: 'SG', name: 'Singapore', flag: '🇸🇬', region: 'APAC', primaryActs: ['PDPA', 'MAS TRM Guidelines', 'Cybersecurity Act'], maxFineTurnoverPct: 10, fixedFineMaxEur: 1000000, currency: 'SGD' },
  { code: 'JP', name: 'Japan', flag: '🇯🇵', region: 'APAC', primaryActs: ['APPI Act', 'FSA Cybersecurity Framework'], maxFineTurnoverPct: 3, fixedFineMaxEur: 5000000, currency: 'JPY' },
  { code: 'IN', name: 'India', flag: '🇮🇳', region: 'APAC', primaryActs: ['DPDP Act 2023', 'CERT-In Cyber Directives'], maxFineTurnoverPct: 3, fixedFineMaxEur: 28000000, currency: 'INR' },
  { code: 'BR', name: 'Brazil', flag: '🇧🇷', region: 'AMER', primaryActs: ['LGPD', 'BACEN Resolution 85'], maxFineTurnoverPct: 2, fixedFineMaxEur: 10000000, currency: 'BRL' },
];

const DEFAULT_COMPANIES: CompanyEntity[] = [
  {
    id: 'comp-101',
    name: 'Acme Global Financial Ltd',
    registrationNumber: 'DE-8839210-B',
    primaryCountry: 'DE',
    crossBorderCountries: ['FR', 'US', 'GB'],
    industry: 'FINTECH',
    status: 'MONITORED_LIST',
    ceoName: 'Karl Heinz Hoffmann',
    ceoEmail: 'karl.hoffmann@acmeglobalfin.eu',
    dpoEmail: 'dpo@acmeglobalfin.eu',
    globalAnnualTurnoverEur: 450000000,
    scannedAssetCount: 142,
    criticalViolations: 3,
    mediumViolations: 7,
    lowViolations: 12,
    lastScannedAt: 'Just now'
  },
  {
    id: 'comp-102',
    name: 'Stark MedTech Innovations',
    registrationNumber: 'FR-9948211-C',
    primaryCountry: 'FR',
    crossBorderCountries: ['DE', 'SG'],
    industry: 'HEALTHCARE',
    status: 'MONITORED_LIST',
    ceoName: 'Claire Dubois',
    ceoEmail: 'claire.dubois@starkmedtech.fr',
    dpoEmail: 'privacy@starkmedtech.fr',
    globalAnnualTurnoverEur: 180000000,
    scannedAssetCount: 89,
    criticalViolations: 1,
    mediumViolations: 4,
    lowViolations: 5,
    lastScannedAt: '12 mins ago'
  },
  {
    id: 'comp-103',
    name: 'Apex AI Neural Systems Inc',
    registrationNumber: 'US-DEL-77382',
    primaryCountry: 'US',
    crossBorderCountries: ['EU', 'GB', 'JP'],
    industry: 'AI_TECH',
    status: 'SANCTION_WATCHLIST',
    ceoName: 'Marcus Vance',
    ceoEmail: 'm.vance@apexneural.ai',
    dpoEmail: 'legal-dpo@apexneural.ai',
    globalAnnualTurnoverEur: 620000000,
    scannedAssetCount: 310,
    criticalViolations: 6,
    mediumViolations: 18,
    lowViolations: 34,
    lastScannedAt: '1 hour ago'
  },
  {
    id: 'comp-104',
    name: 'Europay CTC Logistics SE',
    registrationNumber: 'EU-SE-009122',
    primaryCountry: 'EU',
    crossBorderCountries: ['DE', 'FR', 'BR'],
    industry: 'LOGISTICS',
    status: 'ALLOW_LIST',
    ceoName: 'Elena Rostova',
    ceoEmail: 'e.rostova@europaylogistics.com',
    dpoEmail: 'dpo@europaylogistics.com',
    globalAnnualTurnoverEur: 95000000,
    scannedAssetCount: 64,
    criticalViolations: 0,
    mediumViolations: 2,
    lowViolations: 6,
    lastScannedAt: '3 hours ago'
  }
];

const DEFAULT_ASSETS: DigitalAsset[] = [
  {
    id: 'ast-1001',
    companyId: 'comp-101',
    assetName: 'Main Customer Banking Portal',
    assetType: 'WEB_DOMAIN',
    targetUrl: 'https://ebanking.acmeglobalfin.eu',
    countryLocation: 'DE',
    severity: 'HIGHEST_CRITICAL',
    petulanceRiskScore: 94,
    violationFound: 'Unencrypted cross-border PII cookies transmitted without explicit consent modal under BDSG / GDPR Art. 6',
    nationalActBreached: 'Germany BDSG & GDPR Art. 6 / 32',
    estimatedFineEur: 18000000,
    lastChecked: '2 mins ago',
    status: 'VIOLATION_CONFIRMED'
  },
  {
    id: 'ast-1002',
    companyId: 'comp-101',
    assetName: 'SWIFT Payment REST API Ingress',
    assetType: 'REST_API',
    targetUrl: 'https://api.acmeglobalfin.eu/v2/swift-settlement',
    countryLocation: 'EU',
    severity: 'HIGHEST_CRITICAL',
    petulanceRiskScore: 98,
    violationFound: 'DORA Resilience Deficit: Missing automated 4-hour recovery failover test log in ICT infrastructure',
    nationalActBreached: 'EU DORA Regulation (EU 2022/2554) Art. 11',
    estimatedFineEur: 12500000,
    lastChecked: '5 mins ago',
    status: 'VIOLATION_CONFIRMED'
  },
  {
    id: 'ast-1003',
    companyId: 'comp-101',
    assetName: 'Customer Wealth Advisor LLM Gateway',
    assetType: 'LLM_GATEWAY',
    targetUrl: 'https://ai-advisor.acmeglobalfin.eu/v1/predict',
    countryLocation: 'FR',
    severity: 'MEDIUM',
    petulanceRiskScore: 68,
    violationFound: 'EU AI Act High-Risk Model missing real-time biometric consent notice & audit log retention',
    nationalActBreached: 'EU AI Act Article 14 (Human Oversight)',
    estimatedFineEur: 4500000,
    lastChecked: '10 mins ago',
    status: 'UNDER_REVIEW'
  },
  {
    id: 'ast-1004',
    companyId: 'comp-102',
    assetName: 'EHR Patient Data Storage Bucket',
    assetType: 'CLOUD_VAULT',
    targetUrl: 's3://stark-medtech-de-patient-vault',
    countryLocation: 'FR',
    severity: 'HIGHEST_CRITICAL',
    petulanceRiskScore: 91,
    violationFound: 'CNIL Violation: Public read ACL enabled on patient biometrics backup enclave',
    nationalActBreached: 'France CNIL / GDPR Art. 9 (Special Category Data)',
    estimatedFineEur: 7200000,
    lastChecked: '15 mins ago',
    status: 'VIOLATION_CONFIRMED'
  },
  {
    id: 'ast-1005',
    companyId: 'comp-103',
    assetName: 'Global Foundation Model Vector Warehouse',
    assetType: 'DATABASE_NODE',
    targetUrl: 'pinecone-us-east.apexneural.ai:6379',
    countryLocation: 'US',
    severity: 'HIGHEST_CRITICAL',
    petulanceRiskScore: 99,
    violationFound: 'Cross-Border EU-to-US unverified personal data egress without valid Standard Contractual Clauses (SCCs)',
    nationalActBreached: 'US CCPA & EU Schrems II Data Egress Rule',
    estimatedFineEur: 24800000,
    lastChecked: '20 mins ago',
    status: 'VIOLATION_CONFIRMED'
  },
  {
    id: 'ast-1006',
    companyId: 'comp-104',
    assetName: 'CTC E-Invoicing Realtime Relayer',
    assetType: 'CROSS_BORDER_PIPELINE',
    targetUrl: 'https://invoicing.europaylogistics.com/einvoice-v3',
    countryLocation: 'EU',
    severity: 'LOW_PETULANT',
    petulanceRiskScore: 22,
    violationFound: 'Minor XML schema tag formatting mismatch in tax reporting payload header',
    nationalActBreached: 'EU CTC Directive 2024/E-Invoice',
    estimatedFineEur: 50000,
    lastChecked: '1 hour ago',
    status: 'REMEDIATED'
  }
];

export interface NationalB2gScanningEngineProps {
  availableTenants?: any[];
  onStartScan?: () => void;
  isScanning?: boolean;
  progress?: number;
  logs?: string[];
  target?: string;
  filters?: {
    industry: string;
    country: string;
    law: string;
    tenant: string;
    website: string;
  };
  onFilterChange?: (key: string, val: string) => void;
}

export const NationalB2gScanningEngine: React.FC<NationalB2gScanningEngineProps> = ({
  availableTenants = [],
  onStartScan,
  isScanning: externalIsScanning,
  progress: externalProgress,
  logs: externalLogs,
  target: externalTarget,
  filters: externalFilters,
  onFilterChange
}) => {
  const { showToast } = useNotification();

  // State Management
  const [selectedCountryCode, setSelectedCountryCode] = useState<string>(externalFilters?.country || 'DE');
  const [activeTab, setActiveTab] = useState<'AUTO_SCANNER' | 'COMPANY_REGISTRY' | 'VIOLATION_ENFORCEMENT' | 'DEEP_SCAN_CONFIG'>('AUTO_SCANNER');
  
  const [companies, setCompanies] = useState<CompanyEntity[]>(() => {
    try {
      const saved = localStorage.getItem('b2g_national_companies');
      if (saved) return JSON.parse(saved);
    } catch (e) {
      console.error('Error loading b2g_national_companies:', e);
    }
    return DEFAULT_COMPANIES;
  });

  const [assets, setAssets] = useState<DigitalAsset[]>(() => {
    try {
      const saved = localStorage.getItem('b2g_national_assets');
      if (saved) return JSON.parse(saved);
    } catch (e) {
      console.error('Error loading b2g_national_assets:', e);
    }
    return DEFAULT_ASSETS;
  });

  // Filter & Search
  const [selectedCompanyId, setSelectedCompanyId] = useState<string>('ALL');
  const [severityFilter, setSeverityFilter] = useState<'ALL' | 'HIGHEST_CRITICAL' | 'MEDIUM' | 'LOW_PETULANT'>('ALL');
  const [searchQuery, setSearchQuery] = useState('');
  const [isScanningAll, setIsScanningAll] = useState(false);
  const [scanProgress, setScanProgress] = useState(0);

  // Email / Notice Modal State
  const [emailNoticeModal, setEmailNoticeModal] = useState<{
    open: boolean;
    company?: CompanyEntity;
    asset?: DigitalAsset;
    noticeType: 'WARNING_NOTICE' | 'PENALTY_FINE_ORDER' | 'AUDIT_SUBPOENA';
    fineAmountEur: number;
    recipientEmail: string;
    ceoName: string;
    lawViolated: string;
  }>({
    open: false,
    noticeType: 'WARNING_NOTICE',
    fineAmountEur: 0,
    recipientEmail: '',
    ceoName: '',
    lawViolated: ''
  });

  // Add Company Modal
  const [addCompanyModalOpen, setAddCompanyModalOpen] = useState(false);
  const [newCompanyName, setNewCompanyName] = useState('');
  const [newCompanyReg, setNewCompanyReg] = useState('');
  const [newCompanyIndustry, setNewCompanyIndustry] = useState<CompanyEntity['industry']>('FINTECH');
  const [newCompanyCountry, setNewCompanyCountry] = useState('DE');
  const [newCompanyCeo, setNewCompanyCeo] = useState('');
  const [newCompanyCeoEmail, setNewCompanyCeoEmail] = useState('');
  const [newCompanyTurnover, setNewCompanyTurnover] = useState(250000000);

  // Industry Deep Scan Config
  const [deepScanConfigs, setDeepScanConfigs] = useState<DeepScanIndustryConfig[]>([
    { industry: 'FINTECH', deepScanModules: ['DORA_ICT_FAILOVER', 'SWIFT_SEPA_RECONCILIATION', 'MICA_CRYPTO_AUDIT', 'BDSG_PII_LOGGING'], autoEnforcementTriggerPct: 85, crossBorderDataCheck: true, aiGovernanceCheck: true, scanFrequency: 'REALTIME_CONTINUOUS' },
    { industry: 'HEALTHCARE', deepScanModules: ['EHDS_ENCLAVE_SECURITY', 'HIPAA_ANONYMIZATION', 'PATIENT_CONSENT_VAULT'], autoEnforcementTriggerPct: 80, crossBorderDataCheck: true, aiGovernanceCheck: true, scanFrequency: 'REALTIME_CONTINUOUS' },
    { industry: 'AI_TECH', deepScanModules: ['EU_AI_ACT_RISK_TIERING', 'HALLUCINATION_PII_SCRUBBER', 'VECTOR_INDEX_POISONING_DETECTION'], autoEnforcementTriggerPct: 75, crossBorderDataCheck: true, aiGovernanceCheck: true, scanFrequency: 'REALTIME_CONTINUOUS' },
    { industry: 'CRITICAL_INFRASTRUCTURE', deepScanModules: ['NIS2_OT_ICS_HARDENING', 'SCADA_GRID_ISOLATION', 'ZERO_TRUST_ZERO_DAY'], autoEnforcementTriggerPct: 90, crossBorderDataCheck: false, aiGovernanceCheck: false, scanFrequency: 'REALTIME_CONTINUOUS' },
    { industry: 'ECOMMERCE', deepScanModules: ['CONSUMER_TRANSPARENCY', 'CTC_E_INVOICING', 'CROSS_BORDER_VAT'], autoEnforcementTriggerPct: 70, crossBorderDataCheck: true, aiGovernanceCheck: false, scanFrequency: 'DAILY' }
  ]);

  // Sync Storage
  useEffect(() => {
    localStorage.setItem('b2g_national_companies', JSON.stringify(companies));
  }, [companies]);

  useEffect(() => {
    localStorage.setItem('b2g_national_assets', JSON.stringify(assets));
  }, [assets]);

  const currentCountry = useMemo(() => {
    return COUNTRY_JURISDICTIONS.find(c => c.code === selectedCountryCode) || COUNTRY_JURISDICTIONS[0];
  }, [selectedCountryCode]);

  // Filtered Assets
  const filteredAssets = useMemo(() => {
    return assets.filter(a => {
      // Country match
      const matchesCountry = selectedCountryCode === 'EU' ? true : (a.countryLocation === selectedCountryCode || selectedCountryCode === 'GLOBAL');
      
      // Company match
      const matchesCompany = selectedCompanyId === 'ALL' || a.companyId === selectedCompanyId;

      // Severity match
      const matchesSeverity = severityFilter === 'ALL' || a.severity === severityFilter;

      // Search match
      const q = searchQuery.toLowerCase().trim();
      const matchesSearch = !q || (
        a.assetName.toLowerCase().includes(q) ||
        a.targetUrl.toLowerCase().includes(q) ||
        (a.violationFound && a.violationFound.toLowerCase().includes(q)) ||
        (a.nationalActBreached && a.nationalActBreached.toLowerCase().includes(q))
      );

      return matchesCountry && matchesCompany && matchesSeverity && matchesSearch;
    });
  }, [assets, selectedCountryCode, selectedCompanyId, severityFilter, searchQuery]);

  // Statistics
  const stats = useMemo(() => {
    const totalAssets = filteredAssets.length;
    const highestCritical = filteredAssets.filter(a => a.severity === 'HIGHEST_CRITICAL').length;
    const mediumCount = filteredAssets.filter(a => a.severity === 'MEDIUM').length;
    const lowCount = filteredAssets.filter(a => a.severity === 'LOW_PETULANT').length;
    const totalPotentialFinesEur = filteredAssets.reduce((acc, curr) => acc + (curr.estimatedFineEur || 0), 0);

    return {
      totalAssets,
      highestCritical,
      mediumCount,
      lowCount,
      totalPotentialFinesEur
    };
  }, [filteredAssets]);

  // Execute Unlimited Scan
  const handleTriggerUnlimitedScan = () => {
    setIsScanningAll(true);
    setScanProgress(0);

    const interval = setInterval(() => {
      setScanProgress(prev => {
        if (prev >= 100) {
          clearInterval(interval);
          setIsScanningAll(false);

          // Randomize / update scores and generate new asset discovery item
          const updatedAssets = assets.map(a => ({
            ...a,
            lastChecked: 'Just now',
            petulanceRiskScore: Math.min(100, Math.max(10, Math.floor(Math.random() * 40) + 60))
          }));

          // Inject newly discovered asset
          const newDiscoveredAsset: DigitalAsset = {
            id: `ast-${Date.now()}`,
            companyId: selectedCompanyId !== 'ALL' ? selectedCompanyId : 'comp-101',
            assetName: `Auto-Discovered API Endpoint #${Math.floor(Math.random() * 900) + 100}`,
            assetType: 'REST_API',
            targetUrl: `https://api-discovered-${Math.floor(Math.random() * 99)}.service.${selectedCountryCode.toLowerCase()}`,
            countryLocation: selectedCountryCode === 'EU' ? 'DE' : selectedCountryCode,
            severity: 'HIGHEST_CRITICAL',
            petulanceRiskScore: 97,
            violationFound: `National Act Breach: Unsanitized API endpoint exposing unencrypted records under ${currentCountry.primaryActs[0]}`,
            nationalActBreached: `${currentCountry.name} ${currentCountry.primaryActs[0]} Article 32`,
            estimatedFineEur: 8500000,
            lastChecked: 'Just now',
            status: 'VIOLATION_CONFIRMED'
          };

          setAssets([newDiscoveredAsset, ...updatedAssets]);

          showToast(
            `🎯 National Scan Complete for ${currentCountry.flag} ${currentCountry.name}! Discovered & audited ${assets.length + 1} assets across all registries.`,
            'success',
            'B2G Unlimited Scanner Engine'
          );

          return 100;
        }
        return prev + 20;
      });
    }, 250);
  };

  // Open Warning / Fine Email Dispatch Modal
  const handleOpenEmailNoticeModal = (asset: DigitalAsset) => {
    const company = companies.find(c => c.id === asset.companyId) || companies[0];
    setEmailNoticeModal({
      open: true,
      asset,
      company,
      noticeType: asset.severity === 'HIGHEST_CRITICAL' ? 'PENALTY_FINE_ORDER' : 'WARNING_NOTICE',
      fineAmountEur: asset.estimatedFineEur || 2500000,
      recipientEmail: company.ceoEmail,
      ceoName: company.ceoName,
      lawViolated: asset.nationalActBreached || `${currentCountry.name} Statutory Directives`
    });
  };

  // Dispatch Email Order
  const handleDispatchEmailOrder = () => {
    if (!emailNoticeModal.company) return;

    showToast(
      `📧 Formal B2G Regulatory Notice & Fine Email dispatched to CEO ${emailNoticeModal.ceoName} (${emailNoticeModal.recipientEmail}) with SHA-256 Seal!`,
      'success',
      'Automated Enforcement Relay'
    );

    // Update asset status
    if (emailNoticeModal.asset) {
      setAssets(prev => prev.map(a => a.id === emailNoticeModal.asset?.id ? { ...a, status: 'VIOLATION_CONFIRMED' } : a));
    }

    setEmailNoticeModal(prev => ({ ...prev, open: false }));
  };

  // Manage Company Status (List / Unlist / Sanction)
  const handleUpdateCompanyStatus = (companyId: string, newStatus: CompanyEntity['status']) => {
    setCompanies(prev => prev.map(c => c.id === companyId ? { ...c, status: newStatus } : c));
    const comp = companies.find(c => c.id === companyId);
    showToast(
      `Company "${comp?.name}" status updated to ${newStatus} in B2G National Registry.`,
      'info',
      'Registry Oversight'
    );
  };

  // Create New Company
  const handleCreateCompany = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newCompanyName || !newCompanyReg || !newCompanyCeoEmail) {
      showToast('Please complete all required fields.', 'error');
      return;
    }

    const created: CompanyEntity = {
      id: `comp-${Date.now()}`,
      name: newCompanyName,
      registrationNumber: newCompanyReg,
      primaryCountry: newCompanyCountry,
      crossBorderCountries: ['EU', 'US'],
      industry: newCompanyIndustry,
      status: 'MONITORED_LIST',
      ceoName: newCompanyCeo || 'Chief Executive Officer',
      ceoEmail: newCompanyCeoEmail,
      dpoEmail: `dpo@${newCompanyCeoEmail.split('@')[1] || 'domain.com'}`,
      globalAnnualTurnoverEur: newCompanyTurnover,
      scannedAssetCount: 12,
      criticalViolations: 0,
      mediumViolations: 1,
      lowViolations: 2,
      lastScannedAt: 'Just now'
    };

    setCompanies([created, ...companies]);
    setAddCompanyModalOpen(false);

    // Reset Form
    setNewCompanyName('');
    setNewCompanyReg('');
    setNewCompanyCeo('');
    setNewCompanyCeoEmail('');

    showToast(`🏢 Company "${created.name}" registered in B2G National Surveillance Directory.`, 'success');
  };

  return (
    <div className="space-y-6" id="national-b2g-scanning-engine">
      {/* Top Banner & Country Selection Bar */}
      <div className="p-5 bg-gradient-to-r from-slate-900 via-indigo-950 to-slate-900 dark:from-slate-950 dark:via-slate-900 dark:to-slate-950 rounded-2xl border border-slate-800 text-white shadow-xl relative overflow-hidden">
        <div className="absolute top-0 right-0 w-96 h-96 bg-indigo-500/10 rounded-full blur-3xl pointer-events-none" />

        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 relative z-10">
          <div>
            <div className="flex items-center gap-2 mb-1.5">
              <span className="px-2.5 py-0.5 rounded-full bg-emerald-500/20 text-emerald-400 border border-emerald-500/30 text-[10px] font-mono font-bold uppercase tracking-wider flex items-center gap-1">
                <Sparkles className="w-3 h-3 animate-spin" />
                National & Regional B2G Scanner Engine
              </span>
              <span className="px-2 py-0.5 rounded bg-indigo-500/20 text-indigo-300 text-[10px] font-mono">
                Unlimited Asset Audit
              </span>
            </div>
            <h2 className="text-xl sm:text-2xl font-black text-white flex items-center gap-2">
              <span>National Regulatory Inspection & Automated Enforcement</span>
            </h2>
            <p className="text-xs text-slate-300 mt-1 max-w-3xl">
              Automated continuous scanning of unlimited digital assets across web domains, API gateways, LLM endpoints, and cloud enclaves aligned with national statutory laws and cross-border mandates.
            </p>
          </div>

          {/* Country Jurisdiction Selector */}
          <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-2 bg-slate-800/80 p-2 rounded-xl border border-slate-700/80">
            <span className="text-xs font-bold text-slate-300 px-2 flex items-center gap-1 shrink-0">
              <Globe className="w-4 h-4 text-emerald-400" />
              Jurisdiction:
            </span>
            <select
              value={selectedCountryCode}
              onChange={(e) => setSelectedCountryCode(e.target.value)}
              className="px-3 py-1.5 bg-slate-900 border border-slate-600 rounded-lg text-xs font-bold text-white focus:outline-none focus:ring-2 focus:ring-emerald-500 cursor-pointer"
            >
              {COUNTRY_JURISDICTIONS.map((country) => (
                <option key={country.code} value={country.code}>
                  {country.flag} {country.name} ({country.primaryActs[0]})
                </option>
              ))}
            </select>
          </div>
        </div>

        {/* Selected Country Framework Summary Strip */}
        <div className="mt-4 pt-3 border-t border-slate-800 flex flex-wrap items-center justify-between gap-3 text-xs text-slate-300 font-mono">
          <div className="flex flex-wrap items-center gap-2">
            <span className="text-slate-400 font-sans">Active National Laws:</span>
            {currentCountry.primaryActs.map((act, i) => (
              <span key={i} className="px-2 py-0.5 bg-slate-800 text-emerald-400 border border-slate-700 rounded text-[11px] font-bold">
                {act}
              </span>
            ))}
          </div>

          <div className="flex items-center gap-4 text-[11px]">
            <span>Max Fine Formula: <strong className="text-amber-400">{currentCountry.maxFineTurnoverPct}% Turnover</strong> or <strong className="text-amber-400">€{(currentCountry.fixedFineMaxEur / 1000000).toFixed(0)}M</strong></span>
            <span>Currency: <strong className="text-white">{currentCountry.currency}</strong></span>
          </div>
        </div>
      </div>

      {/* Primary Module Navigation Tabs */}
      <div className="flex items-center gap-2 border-b border-slate-200 dark:border-slate-800 overflow-x-auto pb-1 scrollbar-none">
        {[
          { id: 'AUTO_SCANNER', label: 'National Asset Scanner (Unlimited)', icon: Zap, badge: filteredAssets.length },
          { id: 'COMPANY_REGISTRY', label: 'Company Surveillance Registry', icon: Building2, badge: companies.length },
          { id: 'VIOLATION_ENFORCEMENT', label: 'Statutory Penalties & CEO Relay', icon: Gavel, badge: stats.highestCritical },
          { id: 'DEEP_SCAN_CONFIG', label: 'Industry & Cross-Border Deep Config', icon: SlidersHorizontal }
        ].map((tab) => {
          const Icon = tab.icon;
          const isActive = activeTab === tab.id;
          return (
            <button
              key={tab.id}
              type="button"
              onClick={() => setActiveTab(tab.id as any)}
              className={`px-4 py-2.5 rounded-xl text-xs font-bold transition-all flex items-center gap-2 whitespace-nowrap cursor-pointer ${
                isActive
                  ? 'bg-slate-900 text-white dark:bg-emerald-500 dark:text-slate-950 shadow-md'
                  : 'bg-white dark:bg-slate-900 text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800 border border-slate-200 dark:border-slate-800'
              }`}
            >
              <Icon className="w-4 h-4" />
              <span>{tab.label}</span>
              {tab.badge !== undefined && (
                <span className={`px-1.5 py-0.2 rounded-full text-[10px] font-mono ${
                  isActive ? 'bg-white/20 text-white dark:bg-slate-900/30 dark:text-slate-950' : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300'
                }`}>
                  {tab.badge}
                </span>
              )}
            </button>
          );
        })}
      </div>

      {/* TAB 1: AUTO SCANNER (UNLIMITED ASSETS) */}
      {activeTab === 'AUTO_SCANNER' && (
        <div className="space-y-6">
          {/* Quick Metrics Bar */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            <div className="p-4 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl shadow-xs">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold text-slate-500 dark:text-slate-400">Total Scanned Assets</span>
                <div className="p-2 bg-indigo-500/10 text-indigo-600 dark:text-indigo-400 rounded-xl">
                  <Server className="w-4 h-4" />
                </div>
              </div>
              <p className="text-2xl font-black text-slate-900 dark:text-slate-100 mt-2">{stats.totalAssets}</p>
              <p className="text-[10px] text-slate-500 dark:text-slate-400 mt-1">Domains, APIs, Cloud Storage, LLMs</p>
            </div>

            <div className="p-4 bg-white dark:bg-slate-900 border border-rose-200 dark:border-rose-900/40 bg-rose-50/30 dark:bg-rose-950/20 rounded-2xl shadow-xs">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold text-rose-700 dark:text-rose-400">Highest / Critical Petulance</span>
                <div className="p-2 bg-rose-500/10 text-rose-600 dark:text-rose-400 rounded-xl">
                  <ShieldAlert className="w-4 h-4" />
                </div>
              </div>
              <p className="text-2xl font-black text-rose-600 dark:text-rose-400 mt-2">{stats.highestCritical}</p>
              <p className="text-[10px] text-rose-600/80 dark:text-rose-400/80 mt-1">Immediate Statutory Enforcement</p>
            </div>

            <div className="p-4 bg-white dark:bg-slate-900 border border-amber-200 dark:border-amber-900/40 bg-amber-50/30 dark:bg-amber-950/20 rounded-2xl shadow-xs">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold text-amber-700 dark:text-amber-400">Medium Severity Notice</span>
                <div className="p-2 bg-amber-500/10 text-amber-600 dark:text-amber-400 rounded-xl">
                  <AlertTriangle className="w-4 h-4" />
                </div>
              </div>
              <p className="text-2xl font-black text-amber-600 dark:text-amber-400 mt-2">{stats.mediumCount}</p>
              <p className="text-[10px] text-amber-600/80 dark:text-amber-400/80 mt-1">Warning Notice Auto-Dispatched</p>
            </div>

            <div className="p-4 bg-white dark:bg-slate-900 border border-emerald-200 dark:border-emerald-900/40 bg-emerald-50/30 dark:bg-emerald-950/20 rounded-2xl shadow-xs">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold text-emerald-700 dark:text-emerald-400">Calculated Penalty Exposure</span>
                <div className="p-2 bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 rounded-xl">
                  <DollarSign className="w-4 h-4" />
                </div>
              </div>
              <p className="text-2xl font-black text-emerald-600 dark:text-emerald-400 mt-2">
                €{(stats.totalPotentialFinesEur / 1000000).toFixed(1)}M
              </p>
              <p className="text-[10px] text-emerald-600/80 dark:text-emerald-400/80 mt-1">Based on Statutory Formulas</p>
            </div>
          </div>

          {/* Filter & Scan Action Toolbar */}
          <div className="p-4 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl shadow-xs flex flex-col md:flex-row items-stretch md:items-center justify-between gap-3">
            <div className="flex flex-wrap items-center gap-2 flex-1">
              {/* Search Bar */}
              <div className="relative flex-1 min-w-[200px]">
                <Search className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
                <input
                  type="text"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder="Search asset, endpoint URL, breach type..."
                  className="w-full pl-8 pr-3 py-1.5 bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl text-xs text-slate-800 dark:text-slate-100 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-emerald-500"
                />
              </div>

              {/* Company Filter Dropdown */}
              <select
                value={selectedCompanyId}
                onChange={(e) => setSelectedCompanyId(e.target.value)}
                className="px-3 py-1.5 bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl text-xs font-semibold text-slate-800 dark:text-slate-200 cursor-pointer focus:outline-none"
              >
                <option value="ALL">All Company Entities ({companies.length})</option>
                {companies.map(c => (
                  <option key={c.id} value={c.id}>{c.name} ({c.registrationNumber})</option>
                ))}
              </select>

              {/* Severity Filter Pills */}
              <div className="flex items-center gap-1 bg-slate-100 dark:bg-slate-950 p-1 rounded-xl border border-slate-200 dark:border-slate-800">
                {(['ALL', 'HIGHEST_CRITICAL', 'MEDIUM', 'LOW_PETULANT'] as const).map((sev) => (
                  <button
                    key={sev}
                    type="button"
                    onClick={() => setSeverityFilter(sev)}
                    className={`px-2.5 py-1 rounded-lg text-[10px] font-bold uppercase tracking-wider transition-all cursor-pointer ${
                      severityFilter === sev
                        ? 'bg-slate-900 text-white dark:bg-emerald-500 dark:text-slate-950 shadow-xs'
                        : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-200'
                    }`}
                  >
                    {sev === 'ALL' ? 'All' : sev === 'HIGHEST_CRITICAL' ? 'Critical' : sev === 'MEDIUM' ? 'Medium' : 'Low'}
                  </button>
                ))}
              </div>
            </div>

            {/* Run National Scanner Button */}
            <button
              type="button"
              onClick={handleTriggerUnlimitedScan}
              disabled={isScanningAll}
              className="px-4 py-2 bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 text-white rounded-xl text-xs font-bold transition-all shadow-md flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50 shrink-0"
            >
              <Zap className={`w-4 h-4 ${isScanningAll ? 'animate-bounce' : ''}`} />
              <span>{isScanningAll ? `Scanning Assets (${scanProgress}%)...` : 'Run Unlimited Auto Scan'}</span>
            </button>
          </div>

          {/* Progress Bar when scanning */}
          {isScanningAll && (
            <div className="w-full bg-slate-200 dark:bg-slate-800 h-2 rounded-full overflow-hidden">
              <div 
                className="bg-emerald-500 h-full transition-all duration-300 ease-out"
                style={{ width: `${scanProgress}%` }}
              />
            </div>
          )}

          {/* Scanned Assets Table / Cards */}
          <div className="p-4 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl shadow-xs">
            <div className="flex items-center justify-between mb-3 pb-2 border-b border-slate-100 dark:border-slate-800">
              <h3 className="text-xs font-bold text-slate-900 dark:text-slate-100 uppercase tracking-wider flex items-center gap-2">
                <Server className="w-4 h-4 text-emerald-500" />
                <span>Audited Digital Assets Inventory ({filteredAssets.length})</span>
              </h3>
              <span className="text-[11px] text-slate-500 dark:text-slate-400 font-mono">
                Sorted by Petulance Severity Score
              </span>
            </div>

            <div className="divide-y divide-slate-100 dark:divide-slate-800">
              {filteredAssets.length === 0 ? (
                <div className="py-12 text-center text-slate-400">
                  <Server className="w-8 h-8 mx-auto mb-2 opacity-40" />
                  <p className="text-xs font-semibold">No digital assets found matching filters</p>
                </div>
              ) : (
                filteredAssets.map((asset) => {
                  const company = companies.find(c => c.id === asset.companyId);
                  return (
                    <div key={asset.id} className="py-3.5 flex flex-col md:flex-row md:items-center justify-between gap-4 hover:bg-slate-50/50 dark:hover:bg-slate-800/40 p-2 rounded-xl transition-all">
                      <div className="space-y-1 flex-1">
                        <div className="flex flex-wrap items-center gap-2">
                          {/* Asset Type Badge */}
                          <span className="px-2 py-0.5 rounded text-[10px] font-mono font-bold uppercase bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 border border-slate-200 dark:border-slate-700">
                            {asset.assetType}
                          </span>

                          <h4 className="text-xs font-bold text-slate-900 dark:text-slate-100 flex items-center gap-1.5">
                            <span>{asset.assetName}</span>
                            <a href={asset.targetUrl} target="_blank" rel="noreferrer" className="text-slate-400 hover:text-emerald-500">
                              <ArrowUpRight className="w-3 h-3" />
                            </a>
                          </h4>

                          {/* Severity Pill */}
                          {asset.severity === 'HIGHEST_CRITICAL' && (
                            <span className="px-2 py-0.5 rounded-full text-[9px] font-bold bg-rose-500/10 text-rose-600 dark:text-rose-400 border border-rose-500/20 flex items-center gap-1">
                              <span className="w-1.5 h-1.5 rounded-full bg-rose-500 animate-ping" />
                              CRITICAL PETULANCE ({asset.petulanceRiskScore}/100)
                            </span>
                          )}
                          {asset.severity === 'MEDIUM' && (
                            <span className="px-2 py-0.5 rounded-full text-[9px] font-bold bg-amber-500/10 text-amber-600 dark:text-amber-400 border border-amber-500/20">
                              MEDIUM SEVERITY ({asset.petulanceRiskScore}/100)
                            </span>
                          )}
                          {asset.severity === 'LOW_PETULANT' && (
                            <span className="px-2 py-0.5 rounded-full text-[9px] font-bold bg-slate-500/10 text-slate-600 dark:text-slate-400 border border-slate-500/20">
                              LOW NOTICE ({asset.petulanceRiskScore}/100)
                            </span>
                          )}
                        </div>

                        <p className="text-xs text-slate-600 dark:text-slate-300 font-medium">
                          {asset.violationFound}
                        </p>

                        <div className="flex flex-wrap items-center gap-x-3 gap-y-1 text-[10px] text-slate-500 dark:text-slate-400 font-mono">
                          <span>Company: <strong className="text-slate-700 dark:text-slate-200">{company?.name || asset.companyId}</strong></span>
                          <span>•</span>
                          <span>Breached Act: <strong className="text-amber-600 dark:text-amber-400">{asset.nationalActBreached}</strong></span>
                          <span>•</span>
                          <span>Endpoint: <code className="text-emerald-600 dark:text-emerald-400">{asset.targetUrl}</code></span>
                        </div>
                      </div>

                      {/* Right Column: Calculated Fine & Action Buttons */}
                      <div className="flex items-center justify-between md:justify-end gap-3 shrink-0">
                        <div className="text-right">
                          <p className="text-[10px] text-slate-400 uppercase font-bold">Penalty Exposure</p>
                          <p className="text-xs font-black text-rose-600 dark:text-rose-400">
                            €{( (asset.estimatedFineEur || 0) / 1000000 ).toFixed(2)}M
                          </p>
                        </div>

                        <button
                          type="button"
                          onClick={() => handleOpenEmailNoticeModal(asset)}
                          className="px-3 py-1.5 bg-rose-600 hover:bg-rose-500 text-white rounded-xl text-xs font-bold transition-all shadow-xs flex items-center gap-1.5 cursor-pointer"
                        >
                          <Mail className="w-3.5 h-3.5" />
                          <span>Dispatch CEO Warning</span>
                        </button>
                      </div>
                    </div>
                  );
                })
              )}
            </div>
          </div>
        </div>
      )}

      {/* TAB 2: COMPANY REGISTRY (LIST / UNLIST / CEO CONFIG) */}
      {activeTab === 'COMPANY_REGISTRY' && (
        <div className="space-y-6">
          <div className="p-4 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl shadow-xs flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3">
            <div>
              <h3 className="text-sm font-bold text-slate-900 dark:text-slate-100 flex items-center gap-2">
                <Building2 className="w-4 h-4 text-emerald-500" />
                <span>B2G Multi-National Company Surveillance Directory</span>
              </h3>
              <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
                Manage company listing status, CEO/DPO warning dispatch contacts, and global annual turnover figures for statutory fine calculations.
              </p>
            </div>

            <button
              type="button"
              onClick={() => setAddCompanyModalOpen(true)}
              className="px-3.5 py-2 bg-emerald-600 hover:bg-emerald-500 text-white rounded-xl text-xs font-bold transition-all shadow-xs flex items-center gap-1.5 cursor-pointer shrink-0"
            >
              <Plus className="w-4 h-4" />
              <span>Register New Company</span>
            </button>
          </div>

          {/* Companies Grid */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
            {companies.map((company) => {
              const compCountry = COUNTRY_JURISDICTIONS.find(c => c.code === company.primaryCountry);
              return (
                <div key={company.id} className="p-4 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl shadow-xs space-y-3">
                  <div className="flex items-start justify-between gap-3">
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="text-base">{compCountry?.flag || '🌐'}</span>
                        <h4 className="text-sm font-bold text-slate-900 dark:text-slate-100">{company.name}</h4>
                      </div>
                      <p className="text-[11px] font-mono text-slate-500 dark:text-slate-400 mt-0.5">
                        Reg ID: {company.registrationNumber} • Primary: {compCountry?.name || company.primaryCountry}
                      </p>
                    </div>

                    {/* Status Dropdown */}
                    <select
                      value={company.status}
                      onChange={(e) => handleUpdateCompanyStatus(company.id, e.target.value as any)}
                      className={`px-2.5 py-1 rounded-lg text-[10px] font-bold uppercase tracking-wider border cursor-pointer focus:outline-none ${
                        company.status === 'MONITORED_LIST' ? 'bg-amber-50 text-amber-700 border-amber-300 dark:bg-amber-950 dark:text-amber-300' :
                        company.status === 'SANCTION_WATCHLIST' ? 'bg-rose-50 text-rose-700 border-rose-300 dark:bg-rose-950 dark:text-rose-300' :
                        company.status === 'ALLOW_LIST' ? 'bg-emerald-50 text-emerald-700 border-emerald-300 dark:bg-emerald-950 dark:text-emerald-300' :
                        'bg-slate-100 text-slate-700 border-slate-300 dark:bg-slate-800 dark:text-slate-300'
                      }`}
                    >
                      <option value="MONITORED_LIST">Monitored List</option>
                      <option value="SANCTION_WATCHLIST">Sanction Watchlist</option>
                      <option value="ALLOW_LIST">Allow List (Whitelisted)</option>
                      <option value="SUSPENDED_PORTAL">Suspended Portal Access</option>
                    </select>
                  </div>

                  {/* Details Grid */}
                  <div className="grid grid-cols-2 gap-2 p-3 bg-slate-50 dark:bg-slate-950 rounded-xl text-xs font-mono">
                    <div>
                      <span className="text-slate-400 text-[10px] uppercase block">CEO Contact</span>
                      <span className="font-bold text-slate-800 dark:text-slate-200">{company.ceoName}</span>
                      <p className="text-[10px] text-emerald-600 dark:text-emerald-400 truncate">{company.ceoEmail}</p>
                    </div>

                    <div>
                      <span className="text-slate-400 text-[10px] uppercase block">Global Annual Turnover</span>
                      <span className="font-bold text-emerald-600 dark:text-emerald-400">
                        €{(company.globalAnnualTurnoverEur / 1000000).toFixed(0)} Million
                      </span>
                      <p className="text-[10px] text-slate-500">Statutory Fine Base</p>
                    </div>
                  </div>

                  {/* Scanned Violations Summary Bar */}
                  <div className="flex items-center justify-between text-xs font-mono border-t border-slate-100 dark:border-slate-800 pt-2">
                    <span className="text-slate-500">Scanned Footprint: <strong>{company.scannedAssetCount} Assets</strong></span>
                    <div className="flex items-center gap-2 text-[10px]">
                      <span className="text-rose-600 font-bold">{company.criticalViolations} Critical</span>
                      <span>•</span>
                      <span className="text-amber-600 font-bold">{company.mediumViolations} Medium</span>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* TAB 3: STATUTORY PENALTIES & CEO RELAY */}
      {activeTab === 'VIOLATION_ENFORCEMENT' && (
        <div className="space-y-6">
          <div className="p-4 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl shadow-xs">
            <h3 className="text-sm font-bold text-slate-900 dark:text-slate-100 flex items-center gap-2">
              <Gavel className="w-4 h-4 text-rose-500" />
              <span>Automated Statutory Penalty Fine Calculator & Enforcement Dispatcher</span>
            </h3>
            <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
              Statutory penalty fine formulas automatically adjust based on Company Global Annual Turnover and national act statutory caps under {currentCountry.name} ({currentCountry.primaryActs.join(', ')}).
            </p>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Fine Formula Engine Box */}
            <div className="p-4 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl shadow-xs space-y-3">
              <h4 className="text-xs font-bold text-slate-900 dark:text-slate-100 uppercase tracking-wider flex items-center gap-2">
                <DollarSign className="w-4 h-4 text-emerald-500" />
                <span>Statutory Fine Formula ({currentCountry.code})</span>
              </h4>

              <div className="p-3 bg-slate-50 dark:bg-slate-950 rounded-xl space-y-2 text-xs font-mono">
                <div className="flex justify-between">
                  <span className="text-slate-500">Global Turnover Cap:</span>
                  <strong className="text-amber-500">{currentCountry.maxFineTurnoverPct}%</strong>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-500">Fixed Statutory Maximum:</span>
                  <strong className="text-amber-500">€{(currentCountry.fixedFineMaxEur / 1000000).toFixed(0)} Million</strong>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-500">Calculation Method:</span>
                  <strong className="text-emerald-500">Whichever is Higher</strong>
                </div>
              </div>

              <p className="text-[11px] text-slate-500 dark:text-slate-400">
                Official fine orders auto-populate PDF attachments and dispatch encrypted verification receipts with SHA-256 signatures directly to the company board.
              </p>
            </div>

            {/* Pending Enforcement Queue */}
            <div className="lg:col-span-2 p-4 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl shadow-xs space-y-3">
              <h4 className="text-xs font-bold text-slate-900 dark:text-slate-100 uppercase tracking-wider flex items-center gap-2">
                <Mail className="w-4 h-4 text-indigo-500" />
                <span>Enforcement Email & Warning Notice Dispatch Log</span>
              </h4>

              <div className="divide-y divide-slate-100 dark:divide-slate-800">
                {assets.filter(a => a.severity === 'HIGHEST_CRITICAL' || a.severity === 'MEDIUM').map(asset => {
                  const company = companies.find(c => c.id === asset.companyId);
                  return (
                    <div key={asset.id} className="py-2.5 flex items-center justify-between gap-3 text-xs">
                      <div>
                        <p className="font-bold text-slate-900 dark:text-slate-100">{asset.assetName}</p>
                        <p className="text-[10px] text-slate-500 font-mono">To CEO: {company?.ceoEmail} • Breach: {asset.nationalActBreached}</p>
                      </div>

                      <button
                        type="button"
                        onClick={() => handleOpenEmailNoticeModal(asset)}
                        className="px-3 py-1 bg-indigo-600 hover:bg-indigo-500 text-white rounded-lg text-[11px] font-bold transition-all shadow-xs cursor-pointer flex items-center gap-1 shrink-0"
                      >
                        <Send className="w-3 h-3" />
                        <span>Preview & Dispatch</span>
                      </button>
                    </div>
                  );
                })}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* TAB 4: INDUSTRY & CROSS-BORDER DEEP SCAN CONFIG */}
      {activeTab === 'DEEP_SCAN_CONFIG' && (
        <div className="space-y-6">
          <div className="p-4 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl shadow-xs">
            <h3 className="text-sm font-bold text-slate-900 dark:text-slate-100 flex items-center gap-2">
              <SlidersHorizontal className="w-4 h-4 text-emerald-500" />
              <span>Regulator Deep Scanning & Sector-Specific Rule Configuration</span>
            </h3>
            <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
              Configure specialized deep inspection modules for FinTech, Healthcare, AI/Tech, Critical Infrastructure, and Multi-National Cross-Border Corporations.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {deepScanConfigs.map((cfg) => (
              <div key={cfg.industry} className="p-4 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl shadow-xs space-y-3">
                <div className="flex items-center justify-between">
                  <span className="px-2.5 py-1 bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-500/20 text-xs font-bold rounded-lg uppercase">
                    {cfg.industry} DEEP SCAN
                  </span>
                  <span className="text-[10px] font-mono text-slate-500">{cfg.scanFrequency}</span>
                </div>

                <div className="space-y-1.5">
                  <span className="text-[10px] font-bold text-slate-400 uppercase">Active Inspection Modules:</span>
                  <div className="flex flex-wrap gap-1">
                    {cfg.deepScanModules.map((m, i) => (
                      <span key={i} className="px-2 py-0.5 bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 text-[10px] font-mono rounded border border-slate-200 dark:border-slate-700">
                        {m}
                      </span>
                    ))}
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-2 text-xs font-mono pt-2 border-t border-slate-100 dark:border-slate-800">
                  <div>
                    <span className="text-slate-400 text-[10px]">Auto-Fine Threshold:</span>
                    <p className="font-bold text-amber-500">{cfg.autoEnforcementTriggerPct}% Petulance Score</p>
                  </div>
                  <div>
                    <span className="text-slate-400 text-[10px]">Cross-Border Audit:</span>
                    <p className="font-bold text-emerald-500">{cfg.crossBorderDataCheck ? 'ENABLED' : 'DISABLED'}</p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* DISPATCH EMAIL / WARNING NOTICE MODAL */}
      <AnimatePresence>
        {emailNoticeModal.open && (
          <div className="fixed inset-0 bg-slate-950/70 backdrop-blur-xs z-50 flex items-center justify-center p-4">
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl max-w-2xl w-full p-6 shadow-2xl space-y-4"
            >
              <div className="flex items-center justify-between pb-3 border-b border-slate-100 dark:border-slate-800">
                <div className="flex items-center gap-2">
                  <div className="p-2 bg-rose-500/10 text-rose-600 dark:text-rose-400 rounded-xl">
                    <ShieldAlert className="w-5 h-5" />
                  </div>
                  <div>
                    <h3 className="text-sm font-bold text-slate-900 dark:text-slate-100">
                      Official Regulatory Notice & Warning Dispatch
                    </h3>
                    <p className="text-xs text-slate-500 dark:text-slate-400">
                      Dispatches direct statutory warning & penalty order to Chief Executive Officer
                    </p>
                  </div>
                </div>

                <button
                  type="button"
                  onClick={() => setEmailNoticeModal(prev => ({ ...prev, open: false }))}
                  className="p-1 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-lg text-slate-400"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>

              {/* Form & Email Body Preview */}
              <div className="space-y-3 text-xs">
                <div className="grid grid-cols-2 gap-3 p-3 bg-slate-50 dark:bg-slate-950 rounded-xl font-mono">
                  <div>
                    <span className="text-slate-400 text-[10px] uppercase">Recipient CEO:</span>
                    <p className="font-bold text-slate-800 dark:text-slate-200">{emailNoticeModal.ceoName}</p>
                    <p className="text-emerald-600 dark:text-emerald-400">{emailNoticeModal.recipientEmail}</p>
                  </div>

                  <div>
                    <span className="text-slate-400 text-[10px] uppercase">Statutory Penalty Order:</span>
                    <p className="font-black text-rose-600 dark:text-rose-400 text-sm">
                      €{(emailNoticeModal.fineAmountEur / 1000000).toFixed(2)} Million EUR
                    </p>
                    <p className="text-[10px] text-slate-500">{emailNoticeModal.lawViolated}</p>
                  </div>
                </div>

                {/* Email Body Letter Preview */}
                <div className="p-4 bg-slate-900 text-slate-200 rounded-xl font-mono text-[11px] leading-relaxed space-y-2 border border-slate-800">
                  <p className="text-emerald-400 font-bold">[OFFICIAL B2G STATUTORY REGULATORY NOTICE]</p>
                  <p>TO: CEO {emailNoticeModal.ceoName} & Board of Directors ({emailNoticeModal.company?.name})</p>
                  <p>FROM: {currentCountry.name} B2G Regulatory Inspection Authority</p>
                  <p className="text-slate-400">----------------------------------------------------</p>
                  <p>
                    Be advised that automated continuous scanning on asset <strong className="text-white">{emailNoticeModal.asset?.targetUrl}</strong> confirmed a critical statutory breach under <strong className="text-amber-400">{emailNoticeModal.lawViolated}</strong>.
                  </p>
                  <p>
                    Breach Detail: {emailNoticeModal.asset?.violationFound}
                  </p>
                  <p className="text-rose-400 font-bold">
                    PRELIMINARY FINE ASSESSMENT: €{emailNoticeModal.fineAmountEur.toLocaleString()} EUR.
                  </p>
                  <p className="text-slate-400 text-[10px]">
                    SHA-256 SEAL: 0x9f8b7a6c5d4e3f2a1b0c9d8e7f6a5b4c3d2e1f0a
                  </p>
                </div>
              </div>

              {/* Action Buttons */}
              <div className="flex items-center justify-end gap-3 pt-3 border-t border-slate-100 dark:border-slate-800">
                <button
                  type="button"
                  onClick={() => setEmailNoticeModal(prev => ({ ...prev, open: false }))}
                  className="px-4 py-2 bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-300 rounded-xl text-xs font-bold transition-all"
                >
                  Cancel
                </button>

                <button
                  type="button"
                  onClick={handleDispatchEmailOrder}
                  className="px-4 py-2 bg-rose-600 hover:bg-rose-500 text-white rounded-xl text-xs font-bold transition-all shadow-md flex items-center gap-2 cursor-pointer"
                >
                  <Send className="w-4 h-4" />
                  <span>Dispatch Warning & Fine Email</span>
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* REGISTER NEW COMPANY MODAL */}
      <AnimatePresence>
        {addCompanyModalOpen && (
          <div className="fixed inset-0 bg-slate-950/70 backdrop-blur-xs z-50 flex items-center justify-center p-4">
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl max-w-lg w-full p-6 shadow-2xl space-y-4"
            >
              <div className="flex items-center justify-between pb-3 border-b border-slate-100 dark:border-slate-800">
                <h3 className="text-sm font-bold text-slate-900 dark:text-slate-100 flex items-center gap-2">
                  <Building2 className="w-4 h-4 text-emerald-500" />
                  <span>Register Company Entity in B2G Registry</span>
                </h3>
                <button
                  type="button"
                  onClick={() => setAddCompanyModalOpen(false)}
                  className="p-1 text-slate-400 hover:text-slate-600"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>

              <form onSubmit={handleCreateCompany} className="space-y-3 text-xs">
                <div>
                  <label className="block text-[11px] font-bold text-slate-700 dark:text-slate-300 mb-1">Company Legal Name</label>
                  <input
                    type="text"
                    required
                    value={newCompanyName}
                    onChange={(e) => setNewCompanyName(e.target.value)}
                    placeholder="e.g. Acme FinTech Systems GmbH"
                    className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl text-xs text-slate-900 dark:text-slate-100"
                  />
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-[11px] font-bold text-slate-700 dark:text-slate-300 mb-1">Registration No</label>
                    <input
                      type="text"
                      required
                      value={newCompanyReg}
                      onChange={(e) => setNewCompanyReg(e.target.value)}
                      placeholder="e.g. DE-998231"
                      className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl text-xs text-slate-900 dark:text-slate-100"
                    />
                  </div>

                  <div>
                    <label className="block text-[11px] font-bold text-slate-700 dark:text-slate-300 mb-1">Primary Jurisdiction</label>
                    <select
                      value={newCompanyCountry}
                      onChange={(e) => setNewCompanyCountry(e.target.value)}
                      className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl text-xs text-slate-900 dark:text-slate-100"
                    >
                      {COUNTRY_JURISDICTIONS.map(c => (
                        <option key={c.code} value={c.code}>{c.flag} {c.name}</option>
                      ))}
                    </select>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-[11px] font-bold text-slate-700 dark:text-slate-300 mb-1">CEO Full Name</label>
                    <input
                      type="text"
                      required
                      value={newCompanyCeo}
                      onChange={(e) => setNewCompanyCeo(e.target.value)}
                      placeholder="e.g. Dr. Alexander Vance"
                      className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl text-xs text-slate-900 dark:text-slate-100"
                    />
                  </div>

                  <div>
                    <label className="block text-[11px] font-bold text-slate-700 dark:text-slate-300 mb-1">CEO Official Email</label>
                    <input
                      type="email"
                      required
                      value={newCompanyCeoEmail}
                      onChange={(e) => setNewCompanyCeoEmail(e.target.value)}
                      placeholder="ceo@company.com"
                      className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl text-xs text-slate-900 dark:text-slate-100"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-[11px] font-bold text-slate-700 dark:text-slate-300 mb-1">Industry Sector</label>
                  <select
                    value={newCompanyIndustry}
                    onChange={(e) => setNewCompanyIndustry(e.target.value as any)}
                    className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl text-xs text-slate-900 dark:text-slate-100"
                  >
                    <option value="FINTECH">FinTech & Banking</option>
                    <option value="HEALTHCARE">Healthcare & BioTech</option>
                    <option value="AI_TECH">Artificial Intelligence & Tech</option>
                    <option value="CRITICAL_INFRASTRUCTURE">Critical Infrastructure & Energy</option>
                    <option value="ECOMMERCE">E-Commerce & Retail</option>
                    <option value="GOVTECH">GovTech & Public Sector</option>
                    <option value="LOGISTICS">Logistics & Supply Chain</option>
                  </select>
                </div>

                <div className="pt-3 flex items-center justify-end gap-2 border-t border-slate-100 dark:border-slate-800">
                  <button
                    type="button"
                    onClick={() => setAddCompanyModalOpen(false)}
                    className="px-4 py-2 bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 text-slate-700 dark:text-slate-300 rounded-xl font-bold"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="px-4 py-2 bg-emerald-600 hover:bg-emerald-500 text-white rounded-xl font-bold shadow-md"
                  >
                    Save Company Entity
                  </button>
                </div>
              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
};
