import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import {
  CreditCard,
  CheckCircle2,
  AlertTriangle,
  FileText,
  Download,
  Plus,
  Trash2,
  ExternalLink,
  ShieldCheck,
  Zap,
  TrendingUp,
  Clock,
  Building2,
  Globe,
  DollarSign,
  ChevronRight,
  Sparkles,
  Lock,
  RefreshCw,
  Sliders,
  Check,
  X,
  Printer,
  ArrowUpRight,
  HelpCircle,
  QrCode,
  Landmark,
  BadgePercent,
  Layers,
  ShoppingBag,
  SlidersHorizontal,
  Mail,
  UserCheck
} from 'lucide-react';
import { RegionalPaymentGatewayPortal } from './RegionalPaymentGatewayPortal';
import { useRegionalCompliance } from '../../context/RegionalComplianceContext';

export interface InvoiceItem {
  id: string;
  invoiceNumber: string;
  period: string;
  issueDate: string;
  dueDate: string;
  subtotal: number;
  taxAmount: number;
  total: number;
  currency: string;
  status: 'PAID' | 'PENDING' | 'OVERDUE' | 'PROCESSING';
  paymentMethod: string;
  items: {
    description: string;
    quantity: number;
    unitPrice: number;
    amount: number;
  }[];
  vatRate: number;
  taxId: string;
  cryptographicStamp: string;
}

export interface PaymentMethodItem {
  id: string;
  type: 'card' | 'sepa' | 'regional';
  brand?: string;
  last4: string;
  expiryMonth?: string;
  expiryYear?: string;
  holderName: string;
  isDefault: boolean;
  bankName?: string;
  ibanMasked?: string;
  badge?: string;
}

export interface AddonPackage {
  id: string;
  title: string;
  category: string;
  description: string;
  priceEur: number;
  billingType: 'one-time' | 'recurring';
  unit: string;
  features: string[];
  iconBg: string;
  popular?: boolean;
}

interface ClientBillingDashboardProps {
  tenantId?: string;
  showToast?: (message: string, type?: 'success' | 'warning' | 'info' | 'error') => void;
  onNavigateTab?: (tab: string) => void;
  initialSubTab?: 'overview' | 'invoices' | 'payment_methods' | 'addons' | 'tax_profile' | 'gateway';
}

const DEFAULT_INVOICES: InvoiceItem[] = [
  {
    id: 'inv_109',
    invoiceNumber: 'INV-2026-09-001',
    period: 'Sep 01, 2026 – Sep 30, 2026',
    issueDate: '2026-09-01',
    dueDate: '2026-09-15',
    subtotal: 1299.00,
    taxAmount: 246.81,
    total: 1545.81,
    currency: 'EUR',
    status: 'PAID',
    paymentMethod: 'Corporate Visa (ending in 4242)',
    vatRate: 19,
    taxId: 'DE349182901',
    cryptographicStamp: 'SHA256:e3b0c44298fc1c149afbf4c8996fb92427ae41e4649b934ca495991b7852b855',
    items: [
      { description: 'SaaS Enterprise CaaS Subscription (Monthly)', quantity: 1, unitPrice: 1299.00, amount: 1299.00 }
    ]
  },
  {
    id: 'inv_108',
    invoiceNumber: 'INV-2026-08-001',
    period: 'Aug 01, 2026 – Aug 31, 2026',
    issueDate: '2026-08-01',
    dueDate: '2026-08-15',
    subtotal: 1598.00,
    taxAmount: 303.62,
    total: 1901.62,
    currency: 'EUR',
    status: 'PAID',
    paymentMethod: 'Corporate Visa (ending in 4242)',
    vatRate: 19,
    taxId: 'DE349182901',
    cryptographicStamp: 'SHA256:88fa2b109c9103e91340a1b28e44129e00189ab11438903cde872199014234ba',
    items: [
      { description: 'SaaS Enterprise CaaS Subscription (Monthly)', quantity: 1, unitPrice: 1299.00, amount: 1299.00 },
      { description: 'On-Demand Deep Compliance Scan Pack (250 scans)', quantity: 1, unitPrice: 299.00, amount: 299.00 }
    ]
  },
  {
    id: 'inv_107',
    invoiceNumber: 'INV-2026-07-001',
    period: 'Jul 01, 2026 – Jul 31, 2026',
    issueDate: '2026-07-01',
    dueDate: '2026-07-15',
    subtotal: 1299.00,
    taxAmount: 246.81,
    total: 1545.81,
    currency: 'EUR',
    status: 'PAID',
    paymentMethod: 'SEPA Direct Debit (DE89 **** 0000)',
    vatRate: 19,
    taxId: 'DE349182901',
    cryptographicStamp: 'SHA256:71a0b3e41295801c890123efb0198234ab120938475812903847510293847512',
    items: [
      { description: 'SaaS Enterprise CaaS Subscription (Monthly)', quantity: 1, unitPrice: 1299.00, amount: 1299.00 }
    ]
  },
  {
    id: 'inv_106',
    invoiceNumber: 'INV-2026-06-001',
    period: 'Jun 01, 2026 – Jun 30, 2026',
    issueDate: '2026-06-01',
    dueDate: '2026-06-15',
    subtotal: 1299.00,
    taxAmount: 246.81,
    total: 1545.81,
    currency: 'EUR',
    status: 'PAID',
    paymentMethod: 'SEPA Direct Debit (DE89 **** 0000)',
    vatRate: 19,
    taxId: 'DE349182901',
    cryptographicStamp: 'SHA256:3290184019238471029384710293847102938471029384710293847102938471',
    items: [
      { description: 'SaaS Enterprise CaaS Subscription (Monthly)', quantity: 1, unitPrice: 1299.00, amount: 1299.00 }
    ]
  }
];

const DEFAULT_PAYMENT_METHODS: PaymentMethodItem[] = [
  {
    id: 'pm_1',
    type: 'card',
    brand: 'Visa Corporate',
    last4: '4242',
    expiryMonth: '12',
    expiryYear: '2028',
    holderName: 'Acme Compliance Finance Lead',
    isDefault: true,
    badge: 'PCI-DSS v4.0 Tokenized'
  },
  {
    id: 'pm_2',
    type: 'sepa',
    bankName: 'Deutsche Bank Frankfurt',
    last4: '0000',
    ibanMasked: 'DE89 3704 0044 0532 0130 00',
    holderName: 'Acme Regulatory Corp GmbH',
    isDefault: false,
    badge: 'SEPA B2B Mandate Verified'
  }
];

const ADDON_PACKAGES: AddonPackage[] = [
  {
    id: 'addon_deep_scans',
    title: 'Pay-Per-Scan Deep Engine',
    category: 'Analysis & Diagnostics',
    description: 'On-demand deep compliance scan across massive databases, ROPA schemas, and financial registries.',
    priceEur: 150.00,
    billingType: 'one-time',
    unit: 'per scan package',
    features: ['Up to 500k entity records', 'GDPR Art. 30 & 35 DPIA check', 'Instant Cryptographic Attestation'],
    iconBg: 'bg-blue-50 dark:bg-blue-950/50 text-blue-600 dark:text-blue-400'
  },
  {
    id: 'addon_api_expansion',
    title: 'High-Throughput API Expansion',
    category: 'Infrastructure',
    description: 'Direct low-latency access to the RegTech Engine for automated CI/CD and production pipeline validation.',
    priceEur: 500.00,
    billingType: 'recurring',
    unit: 'per month (+250k calls)',
    popular: true,
    features: ['250,000 extra API verification requests', 'Dedicated rate limit conduit', 'Webhook retry SLA guaranteed'],
    iconBg: 'bg-emerald-50 dark:bg-emerald-950/50 text-emerald-600 dark:text-emerald-400'
  },
  {
    id: 'addon_legal_audit_pack',
    title: 'Official Regulatory Audit Report',
    category: 'Legal & Attestation',
    description: 'Cryptographically sealed audit packages ready for submission to BaFin, CNIL, EDPB, or ZATCA authorities.',
    priceEur: 95.00,
    billingType: 'one-time',
    unit: 'per official report',
    features: ['Digital QES/eIDAS stamp included', 'Article 83 mitigation certificate', 'Verified hash notarization'],
    iconBg: 'bg-amber-50 dark:bg-amber-950/50 text-amber-600 dark:text-amber-400'
  },
  {
    id: 'addon_dedicated_counsel',
    title: 'Partner Legal Counsel Retainer',
    category: 'Advisory & Counsel',
    description: 'Direct 5-hour monthly retainer with accredited European Privacy & FinTech attorneys for rapid case defense.',
    priceEur: 850.00,
    billingType: 'recurring',
    unit: '5 hours / month',
    features: ['Direct Slack/Teams private channel', 'Formal Legal Opinion issuance', 'Cross-border transfer guidance'],
    iconBg: 'bg-purple-50 dark:bg-purple-950/50 text-purple-600 dark:text-purple-400'
  },
  {
    id: 'addon_seats_pack',
    title: 'Enterprise Team Seats (+10)',
    category: 'Team & Governance',
    description: 'Expand your compliance team capacity with 10 additional Role-Based Access Control verified enterprise user seats.',
    priceEur: 199.00,
    billingType: 'recurring',
    unit: '10 users / month',
    features: ['Fine-grained RBAC permissioning', 'Individual cryptographic audit logs', 'SSO & SAML 2.0 integration'],
    iconBg: 'bg-indigo-50 dark:bg-indigo-950/50 text-indigo-600 dark:text-indigo-400'
  },
  {
    id: 'addon_csirt_conduit',
    title: '24/7 DORA CSIRT Incident SLA',
    category: 'Incident & DORA',
    description: 'Guaranteed 15-minute emergency response conduit for ICT operational resilience and major incident notification.',
    priceEur: 1200.00,
    billingType: 'recurring',
    unit: 'annual agreement',
    features: ['15-minute CSIRT activation SLA', 'Automated regulator notification feed', 'Post-incident forensic report'],
    iconBg: 'bg-rose-50 dark:bg-rose-950/50 text-rose-600 dark:text-rose-400'
  }
];

export const ClientBillingDashboard: React.FC<ClientBillingDashboardProps> = ({
  tenantId = 'DEFAULT_TENANT',
  showToast = () => {},
  onNavigateTab,
  initialSubTab
}) => {
  const { activeRegion, framework } = useRegionalCompliance();

  // Primary navigation sub-tab
  const [activeSubTab, setActiveSubTab] = useState<'overview' | 'invoices' | 'payment_methods' | 'addons' | 'tax_profile' | 'gateway'>(initialSubTab || 'overview');

  useEffect(() => {
    if (initialSubTab) {
      setActiveSubTab(initialSubTab);
    }
  }, [initialSubTab]);

  // Plan state
  const [currentTier, setCurrentTier] = useState<'STANDARD' | 'ENTERPRISE' | 'SOVEREIGN'>('ENTERPRISE');
  const [billingCycle, setBillingCycle] = useState<'monthly' | 'annual'>('monthly');
  const [autoRenew, setAutoRenew] = useState<boolean>(true);

  // Invoices & Payment Methods State
  const [invoices, setInvoices] = useState<InvoiceItem[]>(() => {
    const saved = localStorage.getItem(`client_invoices_${tenantId}`);
    return saved ? JSON.parse(saved) : DEFAULT_INVOICES;
  });

  const [paymentMethods, setPaymentMethods] = useState<PaymentMethodItem[]>(() => {
    const saved = localStorage.getItem(`client_payment_methods_${tenantId}`);
    return saved ? JSON.parse(saved) : DEFAULT_PAYMENT_METHODS;
  });

  // Billing & Tax Profile State
  const [companyProfile, setCompanyProfile] = useState({
    legalName: 'Acme Regulatory Corp GmbH',
    taxId: 'DE349182901',
    billingEmail: 'finance@acme-compliance.org',
    addressLine: 'Taunusanlage 8',
    city: 'Frankfurt am Main',
    postalCode: '60329',
    country: 'DE',
    currency: 'EUR',
    requirePo: true,
    poNumber: 'PO-2026-EU-991',
    vatVerified: true
  });

  // Credit Balance & Metered Usage
  const [creditBalance, setCreditBalance] = useState<number>(15800);
  const [deepScansUsed, setDeepScansUsed] = useState<number>(842);
  const [deepScansLimit, setDeepScansLimit] = useState<number>(1000);
  const [apiCallsUsed, setApiCallsUsed] = useState<number>(42300);
  const [apiCallsLimit, setApiCallsLimit] = useState<number>(50000);

  // Modals state
  const [selectedInvoiceForModal, setSelectedInvoiceForModal] = useState<InvoiceItem | null>(null);
  const [isPlanModalOpen, setIsPlanModalOpen] = useState<boolean>(false);
  const [isAddPaymentModalOpen, setIsAddPaymentModalOpen] = useState<boolean>(false);
  const [selectedAddonForPurchase, setSelectedAddonForPurchase] = useState<AddonPackage | null>(null);
  const [isPurchasingAddon, setIsPurchasingAddon] = useState<boolean>(false);
  const [isProcessingPayment, setIsProcessingPayment] = useState<boolean>(false);

  // New Payment Form state
  const [newCardForm, setNewCardForm] = useState({
    methodType: 'card',
    cardNumber: '',
    cardExpiry: '',
    cardCvc: '',
    cardHolder: '',
    postalCode: '',
    iban: '',
    bankName: ''
  });

  // Filter state for invoices
  const [invoiceStatusFilter, setInvoiceStatusFilter] = useState<'ALL' | 'PAID' | 'PENDING'>('ALL');
  const [invoiceSearchQuery, setInvoiceSearchQuery] = useState<string>('');

  // Persist state to local storage
  useEffect(() => {
    localStorage.setItem(`client_invoices_${tenantId}`, JSON.stringify(invoices));
  }, [invoices, tenantId]);

  useEffect(() => {
    localStorage.setItem(`client_payment_methods_${tenantId}`, JSON.stringify(paymentMethods));
  }, [paymentMethods, tenantId]);

  // Pricing calculations
  const tierPrices = {
    STANDARD: { monthly: 499, annual: 399 },
    ENTERPRISE: { monthly: 1299, annual: 1039 },
    SOVEREIGN: { monthly: 4900, annual: 3920 }
  };

  const activeMonthlyRate = tierPrices[currentTier][billingCycle];

  // Handler: Change plan
  const handleUpgradePlan = (tier: 'STANDARD' | 'ENTERPRISE' | 'SOVEREIGN') => {
    setCurrentTier(tier);
    setIsPlanModalOpen(false);
    showToast(`Successfully upgraded to ${tier} Tier! Invoicing adjusted.`, 'success');
  };

  // Handler: Add new payment method
  const handleSavePaymentMethod = (e: React.FormEvent) => {
    e.preventDefault();
    if (newCardForm.methodType === 'card') {
      if (!newCardForm.cardNumber || !newCardForm.cardExpiry || !newCardForm.cardHolder) {
        showToast('Please complete all required card fields.', 'error');
        return;
      }
      const last4 = newCardForm.cardNumber.replace(/\s+/g, '').slice(-4) || '8812';
      const [expMonth, expYear] = newCardForm.cardExpiry.split('/');

      const newMethod: PaymentMethodItem = {
        id: `pm_${Date.now()}`,
        type: 'card',
        brand: 'Mastercard Enterprise',
        last4,
        expiryMonth: expMonth || '09',
        expiryYear: expYear ? `20${expYear}` : '2029',
        holderName: newCardForm.cardHolder,
        isDefault: paymentMethods.length === 0,
        badge: '3DS 2.0 Strong Customer Authentication'
      };

      setPaymentMethods(prev => [...prev, newMethod]);
      showToast('New payment card added and verified via 3D Secure!', 'success');
    } else {
      if (!newCardForm.iban || !newCardForm.cardHolder) {
        showToast('Please provide a valid SEPA IBAN and Account Holder.', 'error');
        return;
      }
      const newMethod: PaymentMethodItem = {
        id: `pm_${Date.now()}`,
        type: 'sepa',
        bankName: newCardForm.bankName || 'European Central Bank clearing',
        last4: newCardForm.iban.replace(/\s+/g, '').slice(-4) || '9911',
        ibanMasked: `${newCardForm.iban.slice(0, 4)} **** **** ${newCardForm.iban.slice(-4)}`,
        holderName: newCardForm.cardHolder,
        isDefault: paymentMethods.length === 0,
        badge: 'SEPA B2B Direct Debit Active'
      };

      setPaymentMethods(prev => [...prev, newMethod]);
      showToast('SEPA B2B Direct Debit Mandate generated and verified!', 'success');
    }

    setIsAddPaymentModalOpen(false);
    setNewCardForm({
      methodType: 'card',
      cardNumber: '',
      cardExpiry: '',
      cardCvc: '',
      cardHolder: '',
      postalCode: '',
      iban: '',
      bankName: ''
    });
  };

  // Handler: Set default payment method
  const handleSetDefaultPayment = (id: string) => {
    setPaymentMethods(prev => prev.map(m => ({ ...m, isDefault: m.id === id })));
    showToast('Default payment method updated.', 'success');
  };

  // Handler: Remove payment method
  const handleRemovePaymentMethod = (id: string) => {
    if (paymentMethods.length <= 1) {
      showToast('You must maintain at least one active payment method for subscription continuity.', 'warning');
      return;
    }
    setPaymentMethods(prev => prev.filter(m => m.id !== id));
    showToast('Payment method removed.', 'info');
  };

  // Handler: Purchase add-on
  const handleExecuteAddonPurchase = () => {
    if (!selectedAddonForPurchase) return;
    setIsPurchasingAddon(true);

    setTimeout(() => {
      setIsPurchasingAddon(false);
      const addon = selectedAddonForPurchase;
      setSelectedAddonForPurchase(null);

      // Create new receipt invoice
      const newInv: InvoiceItem = {
        id: `inv_${Date.now()}`,
        invoiceNumber: `INV-2026-EXTRA-${Math.floor(1000 + Math.random() * 9000)}`,
        period: 'Immediate Entitlement Provisioning',
        issueDate: new Date().toISOString().slice(0, 10),
        dueDate: new Date().toISOString().slice(0, 10),
        subtotal: addon.priceEur,
        taxAmount: Math.round(addon.priceEur * 0.19 * 100) / 100,
        total: Math.round(addon.priceEur * 1.19 * 100) / 100,
        currency: 'EUR',
        status: 'PAID',
        paymentMethod: paymentMethods.find(p => p.isDefault)?.brand || 'Corporate Card',
        vatRate: 19,
        taxId: companyProfile.taxId,
        cryptographicStamp: `SHA256:${Math.random().toString(36).substring(2)}${Math.random().toString(36).substring(2)}`,
        items: [
          { description: addon.title, quantity: 1, unitPrice: addon.priceEur, amount: addon.priceEur }
        ]
      };

      setInvoices(prev => [newInv, ...prev]);

      // Adjust allowances
      if (addon.id === 'addon_deep_scans') {
        setDeepScansLimit(prev => prev + 250);
      } else if (addon.id === 'addon_api_expansion') {
        setApiCallsLimit(prev => prev + 250000);
      }

      setCreditBalance(prev => prev + 1000);
      showToast(`Successfully purchased "${addon.title}"! Entitlements active immediately.`, 'success');
    }, 1200);
  };

  // Handler: Pay an unpaid invoice
  const handlePayInvoice = (invId: string) => {
    setIsProcessingPayment(true);
    setTimeout(() => {
      setIsProcessingPayment(false);
      setInvoices(prev => prev.map(inv => inv.id === invId ? { ...inv, status: 'PAID' } : inv));
      showToast('Invoice settled successfully. Cryptographic stamp recorded on immutable ledger.', 'success');
    }, 1000);
  };

  // Handler: Save company tax profile
  const handleSaveTaxProfile = (e: React.FormEvent) => {
    e.preventDefault();
    showToast('Tax profile and statutory entity credentials verified and saved.', 'success');
  };

  // Handler: Download invoice simulation
  const handleDownloadInvoice = (inv: InvoiceItem) => {
    showToast(`Downloading official PDF for ${inv.invoiceNumber} with eIDAS QES signature...`, 'info');
    setTimeout(() => {
      showToast(`${inv.invoiceNumber} PDF downloaded successfully!`, 'success');
    }, 1000);
  };

  // Filtered invoices
  const filteredInvoices = invoices.filter(inv => {
    const matchesFilter = invoiceStatusFilter === 'ALL' || inv.status === invoiceStatusFilter;
    const matchesSearch = inv.invoiceNumber.toLowerCase().includes(invoiceSearchQuery.toLowerCase()) ||
                          inv.period.toLowerCase().includes(invoiceSearchQuery.toLowerCase());
    return matchesFilter && matchesSearch;
  });

  return (
    <div className="space-y-6">
      {/* Top Header & Fast Metrics */}
      <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-5 shadow-xs">
        <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4 border-b border-slate-100 dark:border-slate-800 pb-5">
          <div className="flex items-center space-x-3.5">
            <div className="p-2.5 bg-indigo-50 dark:bg-indigo-950/60 rounded-xl text-indigo-600 dark:text-indigo-400 shadow-xs">
              <CreditCard className="w-6 h-6" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-lg font-black text-slate-900 dark:text-white tracking-tight">
                  Enterprise Billing & Invoicing
                </h2>
                <span className="px-2 py-0.5 rounded-full text-[10px] font-bold font-mono uppercase bg-emerald-100 dark:bg-emerald-950 text-emerald-700 dark:text-emerald-300 border border-emerald-300 dark:border-emerald-800">
                  Tier: {currentTier}
                </span>
                <span className="px-2 py-0.5 rounded-full text-[10px] font-bold font-mono uppercase bg-indigo-100 dark:bg-indigo-950 text-indigo-700 dark:text-indigo-300 border border-indigo-300 dark:border-indigo-800">
                  {companyProfile.currency}
                </span>
              </div>
              <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
                Central corporate subscription ledger, metered quotas, tax profiles, and statutory payment conduits
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2 w-full md:w-auto">
            <button
              onClick={() => setIsPlanModalOpen(true)}
              className="px-3.5 py-2 bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-bold rounded-xl shadow-xs transition flex items-center justify-center gap-1.5 cursor-pointer"
            >
              <Zap className="w-3.5 h-3.5" />
              <span>Change Plan</span>
            </button>

            <button
              onClick={() => setActiveSubTab('gateway')}
              className="px-3.5 py-2 bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-200 text-xs font-bold rounded-xl transition flex items-center justify-center gap-1.5 cursor-pointer"
            >
              <Landmark className="w-3.5 h-3.5 text-emerald-500" />
              <span>Sovereign Settlement</span>
            </button>
          </div>
        </div>

        {/* Metric Cards Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mt-5">
          {/* Active Cost Card */}
          <div className="p-4 bg-slate-50 dark:bg-slate-800/40 border border-slate-200 dark:border-slate-800 rounded-xl relative overflow-hidden">
            <div className="flex items-center justify-between">
              <span className="text-[11px] font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400">
                Monthly Commitment
              </span>
              <span className="text-[10px] font-mono font-bold bg-indigo-100 dark:bg-indigo-950 text-indigo-700 dark:text-indigo-300 px-1.5 py-0.5 rounded">
                {billingCycle === 'annual' ? 'Billed Annually (-20%)' : 'Monthly'}
              </span>
            </div>
            <div className="text-2xl font-black font-mono text-slate-900 dark:text-white mt-1.5 tracking-tight">
              €{activeMonthlyRate.toLocaleString('en-US', { minimumFractionDigits: 2 })}
              <span className="text-xs font-normal text-slate-500 dark:text-slate-400"> / mo</span>
            </div>
            <div className="text-[11px] text-slate-500 dark:text-slate-400 mt-1 flex items-center gap-1">
              <Clock className="w-3 h-3 text-indigo-500" />
              <span>Next Renewal: <strong>Oct 01, 2026</strong></span>
            </div>
          </div>

          {/* Usage Credits */}
          <div className="p-4 bg-slate-50 dark:bg-slate-800/40 border border-slate-200 dark:border-slate-800 rounded-xl">
            <div className="flex items-center justify-between">
              <span className="text-[11px] font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400">
                API & Verification Credits
              </span>
              <button
                onClick={() => setActiveSubTab('addons')}
                className="text-[10px] font-bold text-indigo-600 dark:text-indigo-400 hover:underline flex items-center gap-0.5 cursor-pointer"
              >
                <span>+ Top Up</span>
              </button>
            </div>
            <div className="text-2xl font-black font-mono text-slate-900 dark:text-white mt-1.5 tracking-tight">
              {creditBalance.toLocaleString()}
              <span className="text-xs font-normal text-slate-500 dark:text-slate-400"> pts</span>
            </div>
            <div className="text-[11px] text-slate-500 dark:text-slate-400 mt-1 flex items-center gap-1">
              <TrendingUp className="w-3 h-3 text-emerald-500" />
              <span>Prepaid balance ready for on-demand queries</span>
            </div>
          </div>

          {/* Deep Scans Allowance */}
          <div className="p-4 bg-slate-50 dark:bg-slate-800/40 border border-slate-200 dark:border-slate-800 rounded-xl">
            <div className="flex items-center justify-between">
              <span className="text-[11px] font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400">
                Deep Scans Quota
              </span>
              <span className="text-[10px] font-mono font-bold text-slate-600 dark:text-slate-300">
                {Math.round((deepScansUsed / deepScansLimit) * 100)}% Used
              </span>
            </div>
            <div className="text-2xl font-black font-mono text-slate-900 dark:text-white mt-1.5 tracking-tight">
              {deepScansUsed} <span className="text-xs font-normal text-slate-400">/ {deepScansLimit}</span>
            </div>
            <div className="w-full bg-slate-200 dark:bg-slate-700 h-1.5 rounded-full mt-2 overflow-hidden">
              <div
                className="bg-indigo-600 h-full rounded-full transition-all duration-500"
                style={{ width: `${(deepScansUsed / deepScansLimit) * 100}%` }}
              />
            </div>
          </div>

          {/* Compliance & SLA Status */}
          <div className="p-4 bg-slate-50 dark:bg-slate-800/40 border border-slate-200 dark:border-slate-800 rounded-xl">
            <div className="flex items-center justify-between">
              <span className="text-[11px] font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400">
                Statutory Status
              </span>
              <ShieldCheck className="w-4 h-4 text-emerald-500" />
            </div>
            <div className="text-2xl font-black text-emerald-600 dark:text-emerald-400 mt-1.5 tracking-tight flex items-center gap-1.5">
              <span>ACTIVE</span>
              <CheckCircle2 className="w-4 h-4" />
            </div>
            <div className="text-[11px] text-slate-500 dark:text-slate-400 mt-1">
              Compliant with GDPR Art. 83 & DORA Art. 12
            </div>
          </div>
        </div>
      </div>

      {/* Navigation Sub-Tabs */}
      <div className="flex items-center space-x-1 border-b border-slate-200 dark:border-slate-800 overflow-x-auto pb-px">
        <button
          onClick={() => setActiveSubTab('overview')}
          className={`px-4 py-2.5 text-xs font-bold border-b-2 transition whitespace-nowrap flex items-center gap-2 cursor-pointer ${
            activeSubTab === 'overview'
              ? 'border-indigo-600 text-indigo-600 dark:text-indigo-400'
              : 'border-transparent text-slate-500 hover:text-slate-900 dark:text-slate-400 dark:hover:text-white'
          }`}
        >
          <Layers className="w-3.5 h-3.5" />
          <span>Plan & Quotas</span>
        </button>

        <button
          onClick={() => setActiveSubTab('invoices')}
          className={`px-4 py-2.5 text-xs font-bold border-b-2 transition whitespace-nowrap flex items-center gap-2 cursor-pointer ${
            activeSubTab === 'invoices'
              ? 'border-indigo-600 text-indigo-600 dark:text-indigo-400'
              : 'border-transparent text-slate-500 hover:text-slate-900 dark:text-slate-400 dark:hover:text-white'
          }`}
        >
          <FileText className="w-3.5 h-3.5" />
          <span>Invoices & Receipts ({invoices.length})</span>
        </button>

        <button
          onClick={() => setActiveSubTab('payment_methods')}
          className={`px-4 py-2.5 text-xs font-bold border-b-2 transition whitespace-nowrap flex items-center gap-2 cursor-pointer ${
            activeSubTab === 'payment_methods'
              ? 'border-indigo-600 text-indigo-600 dark:text-indigo-400'
              : 'border-transparent text-slate-500 hover:text-slate-900 dark:text-slate-400 dark:hover:text-white'
          }`}
        >
          <CreditCard className="w-3.5 h-3.5" />
          <span>Payment Methods ({paymentMethods.length})</span>
        </button>

        <button
          onClick={() => setActiveSubTab('addons')}
          className={`px-4 py-2.5 text-xs font-bold border-b-2 transition whitespace-nowrap flex items-center gap-2 cursor-pointer ${
            activeSubTab === 'addons'
              ? 'border-indigo-600 text-indigo-600 dark:text-indigo-400'
              : 'border-transparent text-slate-500 hover:text-slate-900 dark:text-slate-400 dark:hover:text-white'
          }`}
        >
          <ShoppingBag className="w-3.5 h-3.5" />
          <span>Add-ons & Top-Ups</span>
        </button>

        <button
          onClick={() => setActiveSubTab('tax_profile')}
          className={`px-4 py-2.5 text-xs font-bold border-b-2 transition whitespace-nowrap flex items-center gap-2 cursor-pointer ${
            activeSubTab === 'tax_profile'
              ? 'border-indigo-600 text-indigo-600 dark:text-indigo-400'
              : 'border-transparent text-slate-500 hover:text-slate-900 dark:text-slate-400 dark:hover:text-white'
          }`}
        >
          <Building2 className="w-3.5 h-3.5" />
          <span>Tax & Legal Entity</span>
        </button>

        <button
          onClick={() => setActiveSubTab('gateway')}
          className={`px-4 py-2.5 text-xs font-bold border-b-2 transition whitespace-nowrap flex items-center gap-2 cursor-pointer ${
            activeSubTab === 'gateway'
              ? 'border-indigo-600 text-indigo-600 dark:text-indigo-400'
              : 'border-transparent text-slate-500 hover:text-slate-900 dark:text-slate-400 dark:hover:text-white'
          }`}
        >
          <Landmark className="w-3.5 h-3.5" />
          <span>Multi-Gateway Settlement</span>
        </button>
      </div>

      {/* SUB-TAB 1: OVERVIEW & QUOTAS */}
      {activeSubTab === 'overview' && (
        <div className="space-y-6">
          {/* Active Plan Detail Box */}
          <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-5 shadow-xs">
            <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 pb-5 border-b border-slate-100 dark:border-slate-800">
              <div className="space-y-1">
                <div className="flex items-center gap-2">
                  <span className="text-base font-black text-slate-900 dark:text-white">
                    {currentTier === 'STANDARD' ? 'Standard RegTech CaaS' : currentTier === 'ENTERPRISE' ? 'Enterprise CaaS Suite' : 'Sovereign Confidential Enclave'}
                  </span>
                  <span className="px-2 py-0.5 rounded text-[10px] font-mono font-bold bg-indigo-50 dark:bg-indigo-950 text-indigo-700 dark:text-indigo-300 border border-indigo-200 dark:border-indigo-800">
                    Active Tier
                  </span>
                </div>
                <p className="text-xs text-slate-500 dark:text-slate-400">
                  Full access to European AI Act Annex IV, DORA Multi-Cloud Resilience, and ZATCA Phase 2 E-Invoicing.
                </p>
              </div>

              <div className="flex items-center gap-3">
                <div className="flex items-center gap-2 text-xs text-slate-600 dark:text-slate-300">
                  <span>Auto-Renew:</span>
                  <button
                    type="button"
                    onClick={() => {
                      setAutoRenew(!autoRenew);
                      showToast(`Auto-renewal ${!autoRenew ? 'enabled' : 'disabled'}.`, 'info');
                    }}
                    className={`relative inline-flex h-5 w-9 items-center rounded-full transition-colors cursor-pointer ${
                      autoRenew ? 'bg-indigo-600' : 'bg-slate-300 dark:bg-slate-700'
                    }`}
                  >
                    <span
                      className={`inline-block h-3.5 w-3.5 transform rounded-full bg-white transition-transform ${
                        autoRenew ? 'translate-x-4' : 'translate-x-1'
                      }`}
                    />
                  </button>
                </div>

                <button
                  onClick={() => setIsPlanModalOpen(true)}
                  className="px-3 py-1.5 bg-indigo-50 dark:bg-indigo-950/60 hover:bg-indigo-100 dark:hover:bg-indigo-900 text-indigo-700 dark:text-indigo-300 text-xs font-bold rounded-lg border border-indigo-200 dark:border-indigo-800 transition cursor-pointer"
                >
                  Change Plan Tier
                </button>
              </div>
            </div>

            {/* Quota Progress Details */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mt-5">
              <div className="p-3.5 bg-slate-50 dark:bg-slate-800/40 rounded-xl border border-slate-200 dark:border-slate-800">
                <div className="flex items-center justify-between text-xs mb-1">
                  <span className="font-bold text-slate-700 dark:text-slate-300">Deep Scans</span>
                  <span className="font-mono text-slate-500">{deepScansUsed} / {deepScansLimit}</span>
                </div>
                <div className="w-full bg-slate-200 dark:bg-slate-700 h-2 rounded-full overflow-hidden">
                  <div className="bg-indigo-600 h-full rounded-full" style={{ width: `${(deepScansUsed / deepScansLimit) * 100}%` }} />
                </div>
                <span className="text-[10px] text-slate-400 mt-1 block">Renews on Oct 01, 2026</span>
              </div>

              <div className="p-3.5 bg-slate-50 dark:bg-slate-800/40 rounded-xl border border-slate-200 dark:border-slate-800">
                <div className="flex items-center justify-between text-xs mb-1">
                  <span className="font-bold text-slate-700 dark:text-slate-300">API Requests</span>
                  <span className="font-mono text-slate-500">{apiCallsUsed.toLocaleString()} / {apiCallsLimit.toLocaleString()}</span>
                </div>
                <div className="w-full bg-slate-200 dark:bg-slate-700 h-2 rounded-full overflow-hidden">
                  <div className="bg-emerald-600 h-full rounded-full" style={{ width: `${(apiCallsUsed / apiCallsLimit) * 100}%` }} />
                </div>
                <span className="text-[10px] text-slate-400 mt-1 block">7,700 requests remaining</span>
              </div>

              <div className="p-3.5 bg-slate-50 dark:bg-slate-800/40 rounded-xl border border-slate-200 dark:border-slate-800">
                <div className="flex items-center justify-between text-xs mb-1">
                  <span className="font-bold text-slate-700 dark:text-slate-300">Enterprise Seats</span>
                  <span className="font-mono text-slate-500">18 / 25 seats</span>
                </div>
                <div className="w-full bg-slate-200 dark:bg-slate-700 h-2 rounded-full overflow-hidden">
                  <div className="bg-amber-600 h-full rounded-full" style={{ width: '72%' }} />
                </div>
                <span className="text-[10px] text-slate-400 mt-1 block">7 seats available to assign</span>
              </div>

              <div className="p-3.5 bg-slate-50 dark:bg-slate-800/40 rounded-xl border border-slate-200 dark:border-slate-800">
                <div className="flex items-center justify-between text-xs mb-1">
                  <span className="font-bold text-slate-700 dark:text-slate-300">Audit Evidence Storage</span>
                  <span className="font-mono text-slate-500">14.2 GB / 50 GB</span>
                </div>
                <div className="w-full bg-slate-200 dark:bg-slate-700 h-2 rounded-full overflow-hidden">
                  <div className="bg-blue-600 h-full rounded-full" style={{ width: '28.4%' }} />
                </div>
                <span className="text-[10px] text-slate-400 mt-1 block">Post-Quantum WORM storage</span>
              </div>
            </div>
          </div>

          {/* Quick Recent Invoices Preview */}
          <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-5 shadow-xs">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-sm font-bold text-slate-900 dark:text-white flex items-center gap-2">
                <FileText className="w-4 h-4 text-indigo-600 dark:text-indigo-400" />
                <span>Recent Invoices</span>
              </h3>
              <button
                onClick={() => setActiveSubTab('invoices')}
                className="text-xs font-bold text-indigo-600 dark:text-indigo-400 hover:underline flex items-center gap-1 cursor-pointer"
              >
                <span>View all ({invoices.length})</span>
                <ChevronRight className="w-3.5 h-3.5" />
              </button>
            </div>

            <div className="divide-y divide-slate-100 dark:divide-slate-800">
              {invoices.slice(0, 3).map((inv) => (
                <div key={inv.id} className="py-3 flex items-center justify-between text-xs">
                  <div className="space-y-0.5">
                    <div className="font-bold text-slate-900 dark:text-white flex items-center gap-2">
                      <span>{inv.invoiceNumber}</span>
                      <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-emerald-50 dark:bg-emerald-950 text-emerald-700 dark:text-emerald-300 font-bold border border-emerald-300 dark:border-emerald-800">
                        {inv.status}
                      </span>
                    </div>
                    <div className="text-[11px] text-slate-500 dark:text-slate-400">
                      {inv.period} • Issued {inv.issueDate}
                    </div>
                  </div>

                  <div className="flex items-center gap-3">
                    <span className="font-mono font-bold text-slate-900 dark:text-white">
                      €{inv.total.toFixed(2)}
                    </span>
                    <button
                      onClick={() => setSelectedInvoiceForModal(inv)}
                      className="p-1.5 text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-lg transition cursor-pointer"
                      title="View Receipt"
                    >
                      <ArrowUpRight className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* SUB-TAB 2: INVOICES & RECEIPTS HUB */}
      {activeSubTab === 'invoices' && (
        <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-5 shadow-xs space-y-4">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-slate-100 dark:border-slate-800">
            <div>
              <h3 className="text-sm font-bold text-slate-900 dark:text-white">
                Official Compliance Invoices & Cryptographic Receipts
              </h3>
              <p className="text-xs text-slate-500 dark:text-slate-400">
                Statutory ledger compliant with German GoBD, French Article 289 bis, and Saudi ZATCA Phase-2
              </p>
            </div>

            <button
              onClick={() => showToast('Exporting complete fiscal ledger (CSV & XML)...', 'info')}
              className="px-3 py-1.5 bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-200 text-xs font-bold rounded-lg transition flex items-center gap-1.5 self-start sm:self-auto cursor-pointer"
            >
              <Download className="w-3.5 h-3.5" />
              <span>Export Ledger</span>
            </button>
          </div>

          {/* Search & Filter Bar */}
          <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3">
            <div className="flex items-center space-x-1.5">
              <button
                onClick={() => setInvoiceStatusFilter('ALL')}
                className={`px-3 py-1 rounded-lg text-xs font-bold transition cursor-pointer ${
                  invoiceStatusFilter === 'ALL'
                    ? 'bg-indigo-600 text-white shadow-xs'
                    : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400'
                }`}
              >
                All
              </button>
              <button
                onClick={() => setInvoiceStatusFilter('PAID')}
                className={`px-3 py-1 rounded-lg text-xs font-bold transition cursor-pointer ${
                  invoiceStatusFilter === 'PAID'
                    ? 'bg-emerald-600 text-white shadow-xs'
                    : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400'
                }`}
              >
                Paid
              </button>
              <button
                onClick={() => setInvoiceStatusFilter('PENDING')}
                className={`px-3 py-1 rounded-lg text-xs font-bold transition cursor-pointer ${
                  invoiceStatusFilter === 'PENDING'
                    ? 'bg-amber-600 text-white shadow-xs'
                    : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400'
                }`}
              >
                Pending
              </button>
            </div>

            <input
              type="text"
              placeholder="Search invoice number or date..."
              value={invoiceSearchQuery}
              onChange={(e) => setInvoiceSearchQuery(e.target.value)}
              className="px-3 py-1.5 bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700 rounded-xl text-xs text-slate-900 dark:text-white placeholder:text-slate-400 focus:outline-none focus:ring-1 focus:ring-indigo-500 w-full sm:w-64"
            />
          </div>

          {/* Invoices Table */}
          <div className="overflow-x-auto border border-slate-200 dark:border-slate-800 rounded-xl">
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-50 dark:bg-slate-800/60 text-slate-500 dark:text-slate-400 font-bold border-b border-slate-200 dark:border-slate-800">
                <tr>
                  <th className="p-3">Invoice #</th>
                  <th className="p-3">Billing Period</th>
                  <th className="p-3">Issued Date</th>
                  <th className="p-3">Payment Channel</th>
                  <th className="p-3">Tax (VAT 19%)</th>
                  <th className="p-3">Total Amount</th>
                  <th className="p-3">Status</th>
                  <th className="p-3 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                {filteredInvoices.map((inv) => (
                  <tr key={inv.id} className="hover:bg-slate-50/50 dark:hover:bg-slate-800/30 transition">
                    <td className="p-3 font-mono font-bold text-indigo-600 dark:text-indigo-400">
                      {inv.invoiceNumber}
                    </td>
                    <td className="p-3 text-slate-700 dark:text-slate-300">
                      {inv.period}
                    </td>
                    <td className="p-3 text-slate-500 dark:text-slate-400 font-mono">
                      {inv.issueDate}
                    </td>
                    <td className="p-3 text-slate-600 dark:text-slate-400">
                      {inv.paymentMethod}
                    </td>
                    <td className="p-3 font-mono text-slate-500 dark:text-slate-400">
                      €{inv.taxAmount.toFixed(2)}
                    </td>
                    <td className="p-3 font-mono font-black text-slate-900 dark:text-white">
                      €{inv.total.toFixed(2)}
                    </td>
                    <td className="p-3">
                      <span className={`inline-flex items-center px-2 py-0.5 rounded text-[10px] font-mono font-bold border ${
                        inv.status === 'PAID'
                          ? 'bg-emerald-50 dark:bg-emerald-950 text-emerald-700 dark:text-emerald-300 border-emerald-300 dark:border-emerald-800'
                          : 'bg-amber-50 dark:bg-amber-950 text-amber-700 dark:text-amber-300 border-amber-300 dark:border-amber-800'
                      }`}>
                        {inv.status}
                      </span>
                    </td>
                    <td className="p-3 text-right">
                      <div className="flex items-center justify-end gap-1.5">
                        <button
                          onClick={() => setSelectedInvoiceForModal(inv)}
                          className="px-2.5 py-1 bg-slate-100 dark:bg-slate-800 hover:bg-indigo-50 dark:hover:bg-indigo-950 text-slate-700 dark:text-slate-200 hover:text-indigo-600 rounded-lg text-xs font-semibold transition cursor-pointer"
                          title="View Invoice Receipt"
                        >
                          View
                        </button>

                        <button
                          onClick={() => handleDownloadInvoice(inv)}
                          className="p-1 text-slate-500 hover:text-slate-900 dark:text-slate-400 dark:hover:text-white rounded transition cursor-pointer"
                          title="Download PDF"
                        >
                          <Download className="w-3.5 h-3.5" />
                        </button>

                        {inv.status === 'PENDING' && (
                          <button
                            onClick={() => handlePayInvoice(inv.id)}
                            disabled={isProcessingPayment}
                            className="px-2.5 py-1 bg-emerald-600 hover:bg-emerald-500 text-white rounded-lg text-xs font-bold transition cursor-pointer disabled:opacity-50"
                          >
                            Pay Now
                          </button>
                        )}
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* SUB-TAB 3: PAYMENT METHODS & WALLET */}
      {activeSubTab === 'payment_methods' && (
        <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-5 shadow-xs space-y-5">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-4 border-b border-slate-100 dark:border-slate-800">
            <div>
              <h3 className="text-sm font-bold text-slate-900 dark:text-white">
                Stored Corporate Payment Instruments
              </h3>
              <p className="text-xs text-slate-500 dark:text-slate-400">
                Secure PCI-DSS v4.0 Level 1 vaulted cards, SEPA B2B Direct Debit mandates, and regional accounts
              </p>
            </div>

            <button
              onClick={() => setIsAddPaymentModalOpen(true)}
              className="px-3.5 py-2 bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-bold rounded-xl shadow-xs transition flex items-center justify-center gap-1.5 cursor-pointer self-start sm:self-auto"
            >
              <Plus className="w-4 h-4" />
              <span>Add Payment Method</span>
            </button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {paymentMethods.map((pm) => (
              <div
                key={pm.id}
                className={`p-4 rounded-xl border transition relative flex flex-col justify-between space-y-3 ${
                  pm.isDefault
                    ? 'border-indigo-600 bg-indigo-50/30 dark:bg-indigo-950/20 ring-1 ring-indigo-500/20'
                    : 'border-slate-200 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-800/30'
                }`}
              >
                <div>
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-2">
                      <div className="p-2 bg-white dark:bg-slate-800 rounded-lg border border-slate-200 dark:border-slate-700 text-indigo-600 dark:text-indigo-400">
                        {pm.type === 'card' ? <CreditCard className="w-4 h-4" /> : <Landmark className="w-4 h-4" />}
                      </div>
                      <div>
                        <div className="text-xs font-bold text-slate-900 dark:text-white">
                          {pm.type === 'card' ? pm.brand : pm.bankName}
                        </div>
                        <div className="text-[11px] font-mono text-slate-500 dark:text-slate-400">
                          {pm.type === 'card' ? `•••• •••• •••• ${pm.last4}` : pm.ibanMasked}
                        </div>
                      </div>
                    </div>

                    {pm.isDefault && (
                      <span className="px-2 py-0.5 rounded text-[10px] font-mono font-bold bg-indigo-600 text-white">
                        DEFAULT
                      </span>
                    )}
                  </div>

                  <div className="mt-3 text-[11px] text-slate-600 dark:text-slate-400 space-y-0.5">
                    <div>Cardholder: <strong>{pm.holderName}</strong></div>
                    {pm.expiryMonth && <div>Expires: <strong>{pm.expiryMonth}/{pm.expiryYear}</strong></div>}
                    {pm.badge && (
                      <div className="inline-flex items-center gap-1 text-[10px] text-emerald-600 dark:text-emerald-400 font-semibold mt-1">
                        <ShieldCheck className="w-3 h-3" />
                        <span>{pm.badge}</span>
                      </div>
                    )}
                  </div>
                </div>

                <div className="pt-2 border-t border-slate-200 dark:border-slate-700 flex items-center justify-between">
                  {!pm.isDefault ? (
                    <button
                      onClick={() => handleSetDefaultPayment(pm.id)}
                      className="text-xs font-bold text-indigo-600 dark:text-indigo-400 hover:underline cursor-pointer"
                    >
                      Make Default
                    </button>
                  ) : (
                    <span className="text-[10px] text-slate-400">Used for automated renewals</span>
                  )}

                  <button
                    onClick={() => handleRemovePaymentMethod(pm.id)}
                    className="p-1.5 text-rose-500 hover:text-rose-700 hover:bg-rose-50 dark:hover:bg-rose-950/50 rounded-lg transition cursor-pointer"
                    title="Remove method"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>
            ))}
          </div>

          {/* Security & Tokenization Guarantee Notice */}
          <div className="p-4 bg-slate-50 dark:bg-slate-800/40 border border-slate-200 dark:border-slate-800 rounded-xl flex items-start space-x-3 text-xs text-slate-600 dark:text-slate-400">
            <Lock className="w-4 h-4 text-emerald-500 shrink-0 mt-0.5" />
            <div className="space-y-1">
              <span className="font-bold text-slate-900 dark:text-white">
                Zero Raw PAN Storage Guarantee (PCI-DSS v4.0 Scope Tokenizer)
              </span>
              <p className="text-[11px] leading-relaxed">
                All payment instruments are encrypted at rest with hardware HSM modules. Raw cardholder data never touches application memory. Fully compliant with EU PSD3 Strong Customer Authentication (SCA).
              </p>
            </div>
          </div>
        </div>
      )}

      {/* SUB-TAB 4: ADD-ONS & ON-DEMAND TOP-UPS */}
      {activeSubTab === 'addons' && (
        <div className="space-y-6">
          <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-5 shadow-xs">
            <div className="border-b border-slate-100 dark:border-slate-800 pb-3 mb-5">
              <h3 className="text-sm font-bold text-slate-900 dark:text-white">
                On-Demand Compliance Packs & Service Expansions
              </h3>
              <p className="text-xs text-slate-500 dark:text-slate-400">
                Enhance your SaaS plan with metered capacity, specialized statutory audits, or priority legal retainers
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {ADDON_PACKAGES.map((addon) => (
                <div
                  key={addon.id}
                  className="p-5 bg-white dark:bg-slate-800/50 border border-slate-200 dark:border-slate-800 rounded-xl shadow-xs hover:border-indigo-300 dark:hover:border-indigo-700 transition flex flex-col justify-between relative overflow-hidden"
                >
                  {addon.popular && (
                    <div className="absolute top-0 right-0 bg-indigo-600 text-white font-bold text-[9px] uppercase tracking-wider px-2 py-0.5 rounded-bl-lg">
                      Popular
                    </div>
                  )}

                  <div>
                    <div className={`w-9 h-9 rounded-lg flex items-center justify-center mb-3 ${addon.iconBg}`}>
                      <Zap className="w-4 h-4" />
                    </div>

                    <div className="text-[10px] font-bold uppercase tracking-wider text-slate-400 mb-0.5">
                      {addon.category}
                    </div>
                    <h4 className="font-bold text-slate-900 dark:text-white text-sm mb-1.5">
                      {addon.title}
                    </h4>
                    <p className="text-xs text-slate-500 dark:text-slate-400 mb-3 leading-relaxed">
                      {addon.description}
                    </p>

                    <div className="text-lg font-black text-slate-900 dark:text-white mb-3">
                      €{addon.priceEur.toFixed(2)}
                      <span className="text-[10px] font-normal text-slate-400"> / {addon.unit}</span>
                    </div>

                    <div className="space-y-1.5 mb-4 border-t border-slate-100 dark:border-slate-700 pt-3">
                      {addon.features.map((f, i) => (
                        <div key={i} className="text-[11px] text-slate-600 dark:text-slate-300 flex items-center gap-1.5">
                          <Check className="w-3 h-3 text-emerald-500 shrink-0" />
                          <span>{f}</span>
                        </div>
                      ))}
                    </div>
                  </div>

                  <button
                    onClick={() => setSelectedAddonForPurchase(addon)}
                    className="w-full py-2 bg-indigo-50 dark:bg-indigo-950/60 hover:bg-indigo-100 dark:hover:bg-indigo-900 text-indigo-700 dark:text-indigo-300 text-xs font-bold rounded-lg transition border border-indigo-200 dark:border-indigo-800 flex items-center justify-center gap-1.5 cursor-pointer"
                  >
                    <Plus className="w-3.5 h-3.5" />
                    <span>Purchase Entitlement</span>
                  </button>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* SUB-TAB 5: TAX & LEGAL ENTITY PROFILE */}
      {activeSubTab === 'tax_profile' && (
        <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-5 shadow-xs">
          <div className="border-b border-slate-100 dark:border-slate-800 pb-3 mb-5">
            <h3 className="text-sm font-bold text-slate-900 dark:text-white">
              Corporate Legal Entity & Statutory Tax Profile
            </h3>
            <p className="text-xs text-slate-500 dark:text-slate-400">
              Information required for automated VAT exemption (Article 196 EU VAT Directive) and B2G e-invoices
            </p>
          </div>

          <form onSubmit={handleSaveTaxProfile} className="space-y-4 max-w-2xl">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                  Registered Entity Legal Name
                </label>
                <input
                  type="text"
                  value={companyProfile.legalName}
                  onChange={(e) => setCompanyProfile({ ...companyProfile, legalName: e.target.value })}
                  className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-xs text-slate-900 dark:text-white focus:ring-1 focus:ring-indigo-500"
                  required
                />
              </div>

              <div>
                <div className="flex items-center justify-between mb-1">
                  <label className="block text-xs font-bold text-slate-700 dark:text-slate-300">
                    VAT / Tax Registration ID
                  </label>
                  {companyProfile.vatVerified && (
                    <span className="text-[10px] font-mono font-bold text-emerald-600 dark:text-emerald-400 flex items-center gap-1">
                      <CheckCircle2 className="w-3 h-3" />
                      VIES Verified
                    </span>
                  )}
                </div>
                <input
                  type="text"
                  value={companyProfile.taxId}
                  onChange={(e) => setCompanyProfile({ ...companyProfile, taxId: e.target.value })}
                  className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-xs text-slate-900 dark:text-white focus:ring-1 focus:ring-indigo-500 font-mono"
                  required
                />
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                  Statutory Billing Email (Invoicing Notices)
                </label>
                <input
                  type="email"
                  value={companyProfile.billingEmail}
                  onChange={(e) => setCompanyProfile({ ...companyProfile, billingEmail: e.target.value })}
                  className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-xs text-slate-900 dark:text-white focus:ring-1 focus:ring-indigo-500"
                  required
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                  Standard Invoice Currency
                </label>
                <select
                  value={companyProfile.currency}
                  onChange={(e) => setCompanyProfile({ ...companyProfile, currency: e.target.value })}
                  className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-xs text-slate-900 dark:text-white focus:ring-1 focus:ring-indigo-500"
                >
                  <option value="EUR">EUR (€) - European Central Bank</option>
                  <option value="USD">USD ($) - US Federal Clearing</option>
                  <option value="GBP">GBP (£) - Bank of England</option>
                  <option value="SAR">SAR (﷼) - Saudi SAMA & ZATCA</option>
                  <option value="USD">USD (৳) - Global Region Bank NPSB</option>
                </select>
              </div>
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                Registered Fiscal Address
              </label>
              <input
                type="text"
                value={companyProfile.addressLine}
                onChange={(e) => setCompanyProfile({ ...companyProfile, addressLine: e.target.value })}
                className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-xs text-slate-900 dark:text-white focus:ring-1 focus:ring-indigo-500"
                required
              />
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <div>
                <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                  City
                </label>
                <input
                  type="text"
                  value={companyProfile.city}
                  onChange={(e) => setCompanyProfile({ ...companyProfile, city: e.target.value })}
                  className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-xs text-slate-900 dark:text-white focus:ring-1 focus:ring-indigo-500"
                  required
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                  Postal Code
                </label>
                <input
                  type="text"
                  value={companyProfile.postalCode}
                  onChange={(e) => setCompanyProfile({ ...companyProfile, postalCode: e.target.value })}
                  className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-xs text-slate-900 dark:text-white focus:ring-1 focus:ring-indigo-500 font-mono"
                  required
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                  Country
                </label>
                <select
                  value={companyProfile.country}
                  onChange={(e) => setCompanyProfile({ ...companyProfile, country: e.target.value })}
                  className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-xs text-slate-900 dark:text-white focus:ring-1 focus:ring-indigo-500"
                >
                  <option value="DE">Germany (DE) - GoBD / 19% VAT</option>
                  <option value="FR">France (FR) - Factur-X / 20% TVA</option>
                  <option value="SA">Saudi Arabia (SA) - ZATCA / 15% VAT</option>
                  <option value="GB">United Kingdom (GB) - HMRC / 20% VAT</option>
                  <option value="US">United States (US) - State Sales Tax</option>
                  <option value="BD">Global Region (BD) - NBR / 15% VAT</option>
                </select>
              </div>
            </div>

            <div className="pt-2">
              <button
                type="submit"
                className="px-4 py-2.5 bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-bold rounded-xl shadow-xs transition cursor-pointer"
              >
                Save Statutory Profile
              </button>
            </div>
          </form>
        </div>
      )}

      {/* SUB-TAB 6: MULTI-GATEWAY SETTLEMENT (REGIONAL PAYMENT PORTAL) */}
      {activeSubTab === 'gateway' && (
        <div className="space-y-4">
          <div className="p-4 bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-200 dark:border-emerald-800 rounded-2xl flex items-center justify-between text-xs">
            <div className="flex items-center gap-2 text-emerald-800 dark:text-emerald-300">
              <Landmark className="w-4 h-4 text-emerald-600 dark:text-emerald-400" />
              <span>
                <strong>Sovereign Clearing Active:</strong> Settling in local compliant currencies across European SEPA, Saudi ZATCA, and US FedNow corridors.
              </span>
            </div>
            <span className="font-mono font-bold text-emerald-700 dark:text-emerald-400 bg-white dark:bg-slate-900 px-2.5 py-1 rounded-lg border border-emerald-300 dark:border-emerald-800">
              Active Framework: {framework?.displayName || 'EU GDPR / DORA'}
            </span>
          </div>

          <RegionalPaymentGatewayPortal
            baseAmountEur={activeMonthlyRate}
            title="Sovereign Multi-Gateway Direct Settlement"
            subtitle="Immediate regulatory clearing with instant cryptographic tax receipt issuance"
            onPaymentSuccess={(receipt) => {
              showToast(`Payment of €${receipt.amount} settled via ${receipt.gateway}! Receipt recorded.`, 'success');
              const newInv: InvoiceItem = {
                id: `inv_${Date.now()}`,
                invoiceNumber: `INV-${receipt.transactionId.slice(0, 8)}`,
                period: 'Immediate Sovereign Settlement',
                issueDate: new Date().toISOString().slice(0, 10),
                dueDate: new Date().toISOString().slice(0, 10),
                subtotal: receipt.amount,
                taxAmount: Math.round(receipt.amount * 0.19 * 100) / 100,
                total: Math.round(receipt.amount * 1.19 * 100) / 100,
                currency: receipt.currency || 'EUR',
                status: 'PAID',
                paymentMethod: `${receipt.gateway} (${receipt.paymentMethod})`,
                vatRate: 19,
                taxId: companyProfile.taxId,
                cryptographicStamp: receipt.clearingReference || 'SHA256:cleared_gateway_ok',
                items: [
                  { description: `Settlement via ${receipt.gateway}`, quantity: 1, unitPrice: receipt.amount, amount: receipt.amount }
                ]
              };
              setInvoices(prev => [newInv, ...prev]);
            }}
          />
        </div>
      )}

      {/* MODAL 1: PLAN UPGRADE & TIER SELECTION */}
      <AnimatePresence>
        {isPlanModalOpen && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/60 backdrop-blur-xs">
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl max-w-3xl w-full p-6 shadow-2xl space-y-5 max-h-[90vh] overflow-y-auto"
            >
              <div className="flex items-center justify-between border-b border-slate-100 dark:border-slate-800 pb-4">
                <div>
                  <h3 className="text-base font-black text-slate-900 dark:text-white">
                    Select Your Compliance-as-a-Service Tier
                  </h3>
                  <p className="text-xs text-slate-500 dark:text-slate-400">
                    Scale your regulatory posture and automated audit defense capabilities
                  </p>
                </div>
                <button
                  onClick={() => setIsPlanModalOpen(false)}
                  className="p-1.5 text-slate-400 hover:text-slate-600 dark:hover:text-white rounded-lg cursor-pointer"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              {/* Billing Cycle Toggle */}
              <div className="flex items-center justify-center">
                <div className="bg-slate-100 dark:bg-slate-800 p-1 rounded-xl flex items-center text-xs font-bold">
                  <button
                    onClick={() => setBillingCycle('monthly')}
                    className={`px-3 py-1.5 rounded-lg transition cursor-pointer ${
                      billingCycle === 'monthly' ? 'bg-white dark:bg-slate-900 text-slate-900 dark:text-white shadow-xs' : 'text-slate-500'
                    }`}
                  >
                    Monthly Billing
                  </button>
                  <button
                    onClick={() => setBillingCycle('annual')}
                    className={`px-3 py-1.5 rounded-lg transition flex items-center gap-1.5 cursor-pointer ${
                      billingCycle === 'annual' ? 'bg-white dark:bg-slate-900 text-slate-900 dark:text-white shadow-xs' : 'text-slate-500'
                    }`}
                  >
                    <span>Annual Billing</span>
                    <span className="bg-emerald-500 text-white text-[9px] px-1.5 py-0.5 rounded-full font-extrabold">Save 20%</span>
                  </button>
                </div>
              </div>

              {/* 3 Tier Cards */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                {/* Standard */}
                <div className={`p-4 rounded-xl border flex flex-col justify-between space-y-3 ${
                  currentTier === 'STANDARD' ? 'border-indigo-600 ring-2 ring-indigo-500/20 bg-indigo-50/20 dark:bg-indigo-950/20' : 'border-slate-200 dark:border-slate-800'
                }`}>
                  <div>
                    <div className="font-bold text-slate-900 dark:text-white text-sm">Standard RegTech</div>
                    <div className="text-xl font-black font-mono text-slate-900 dark:text-white mt-1">
                      €{tierPrices.STANDARD[billingCycle]}<span className="text-xs font-normal text-slate-400">/mo</span>
                    </div>
                    <p className="text-[11px] text-slate-500 mt-2">Essential compliance for growing EU businesses.</p>
                    <div className="space-y-1 mt-3 text-[11px] text-slate-600 dark:text-slate-400">
                      <div>• GDPR Art. 30 ROPA Records</div>
                      <div>• Standard TLS 1.3 Audit Conduits</div>
                      <div>• 250 Deep Scans / mo</div>
                      <div>• Email Notification Digests</div>
                    </div>
                  </div>
                  <button
                    onClick={() => handleUpgradePlan('STANDARD')}
                    className={`w-full py-2 rounded-lg font-bold text-xs transition cursor-pointer ${
                      currentTier === 'STANDARD' ? 'bg-slate-200 dark:bg-slate-700 text-slate-700 dark:text-slate-300' : 'bg-indigo-600 text-white hover:bg-indigo-500'
                    }`}
                  >
                    {currentTier === 'STANDARD' ? 'Current Plan' : 'Select Standard'}
                  </button>
                </div>

                {/* Enterprise */}
                <div className={`p-4 rounded-xl border flex flex-col justify-between space-y-3 relative ${
                  currentTier === 'ENTERPRISE' ? 'border-indigo-600 ring-2 ring-indigo-500/20 bg-indigo-50/20 dark:bg-indigo-950/20' : 'border-slate-200 dark:border-slate-800'
                }`}>
                  <div className="absolute -top-2.5 left-1/2 -translate-x-1/2 bg-indigo-600 text-white text-[9px] font-extrabold uppercase px-2 py-0.5 rounded-full">
                    Recommended
                  </div>
                  <div>
                    <div className="font-bold text-slate-900 dark:text-white text-sm">Enterprise CaaS</div>
                    <div className="text-xl font-black font-mono text-slate-900 dark:text-white mt-1">
                      €{tierPrices.ENTERPRISE[billingCycle]}<span className="text-xs font-normal text-slate-400">/mo</span>
                    </div>
                    <p className="text-[11px] text-slate-500 mt-2">Full multi-regulation suite for global operators.</p>
                    <div className="space-y-1 mt-3 text-[11px] text-slate-600 dark:text-slate-400">
                      <div>• EU AI Act Annex IV Governance</div>
                      <div>• DORA Multi-Cloud Resilience</div>
                      <div>• 1,000 Deep Scans / mo</div>
                      <div>• 25 Team Seats with RBAC</div>
                      <div>• Post-Quantum WORM storage</div>
                    </div>
                  </div>
                  <button
                    onClick={() => handleUpgradePlan('ENTERPRISE')}
                    className={`w-full py-2 rounded-lg font-bold text-xs transition cursor-pointer ${
                      currentTier === 'ENTERPRISE' ? 'bg-slate-200 dark:bg-slate-700 text-slate-700 dark:text-slate-300' : 'bg-indigo-600 text-white hover:bg-indigo-500'
                    }`}
                  >
                    {currentTier === 'ENTERPRISE' ? 'Current Plan' : 'Select Enterprise'}
                  </button>
                </div>

                {/* Sovereign */}
                <div className={`p-4 rounded-xl border flex flex-col justify-between space-y-3 ${
                  currentTier === 'SOVEREIGN' ? 'border-indigo-600 ring-2 ring-indigo-500/20 bg-indigo-50/20 dark:bg-indigo-950/20' : 'border-slate-200 dark:border-slate-800'
                }`}>
                  <div>
                    <div className="font-bold text-slate-900 dark:text-white text-sm">Sovereign Enclave</div>
                    <div className="text-xl font-black font-mono text-slate-900 dark:text-white mt-1">
                      €{tierPrices.SOVEREIGN[billingCycle]}<span className="text-xs font-normal text-slate-400">/mo</span>
                    </div>
                    <p className="text-[11px] text-slate-500 mt-2">Maximum hardware SEV-SNP cryptographic isolation.</p>
                    <div className="space-y-1 mt-3 text-[11px] text-slate-600 dark:text-slate-400">
                      <div>• Hardware SEV-SNP Enclave Isolation</div>
                      <div>• ML-KEM-768 Zero-Egress Encryption</div>
                      <div>• B2G Direct Regulator Portal Node</div>
                      <div>• Unlimited Deep Scans & Seats</div>
                      <div>• 24/7 Dedicated CSIRT SLA</div>
                    </div>
                  </div>
                  <button
                    onClick={() => handleUpgradePlan('SOVEREIGN')}
                    className={`w-full py-2 rounded-lg font-bold text-xs transition cursor-pointer ${
                      currentTier === 'SOVEREIGN' ? 'bg-slate-200 dark:bg-slate-700 text-slate-700 dark:text-slate-300' : 'bg-indigo-600 text-white hover:bg-indigo-500'
                    }`}
                  >
                    {currentTier === 'SOVEREIGN' ? 'Current Plan' : 'Select Sovereign'}
                  </button>
                </div>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* MODAL 2: ADD PAYMENT METHOD */}
      <AnimatePresence>
        {isAddPaymentModalOpen && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/60 backdrop-blur-xs">
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl max-w-md w-full p-5 shadow-2xl space-y-4"
            >
              <div className="flex items-center justify-between border-b border-slate-100 dark:border-slate-800 pb-3">
                <h3 className="text-sm font-bold text-slate-900 dark:text-white flex items-center gap-2">
                  <CreditCard className="w-4 h-4 text-indigo-600" />
                  <span>Add Corporate Payment Instrument</span>
                </h3>
                <button
                  onClick={() => setIsAddPaymentModalOpen(false)}
                  className="p-1 text-slate-400 hover:text-slate-600 dark:hover:text-white rounded cursor-pointer"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>

              {/* Method Type Selector */}
              <div className="grid grid-cols-2 gap-2">
                <button
                  type="button"
                  onClick={() => setNewCardForm({ ...newCardForm, methodType: 'card' })}
                  className={`py-2 text-xs font-bold rounded-lg border flex items-center justify-center gap-1.5 transition cursor-pointer ${
                    newCardForm.methodType === 'card'
                      ? 'border-indigo-600 bg-indigo-50 dark:bg-indigo-950 text-indigo-600 dark:text-indigo-300'
                      : 'border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-400'
                  }`}
                >
                  <CreditCard className="w-3.5 h-3.5" />
                  <span>Credit/Debit Card</span>
                </button>

                <button
                  type="button"
                  onClick={() => setNewCardForm({ ...newCardForm, methodType: 'sepa' })}
                  className={`py-2 text-xs font-bold rounded-lg border flex items-center justify-center gap-1.5 transition cursor-pointer ${
                    newCardForm.methodType === 'sepa'
                      ? 'border-indigo-600 bg-indigo-50 dark:bg-indigo-950 text-indigo-600 dark:text-indigo-300'
                      : 'border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-400'
                  }`}
                >
                  <Landmark className="w-3.5 h-3.5" />
                  <span>SEPA Direct Debit</span>
                </button>
              </div>

              <form onSubmit={handleSavePaymentMethod} className="space-y-3 text-xs">
                {newCardForm.methodType === 'card' ? (
                  <>
                    <div>
                      <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1">
                        Cardholder Name
                      </label>
                      <input
                        type="text"
                        placeholder="e.g. Acme Corp Finance"
                        value={newCardForm.cardHolder}
                        onChange={(e) => setNewCardForm({ ...newCardForm, cardHolder: e.target.value })}
                        className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg text-xs"
                        required
                      />
                    </div>

                    <div>
                      <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1">
                        Card Number (Tokenized)
                      </label>
                      <input
                        type="text"
                        placeholder="4242 4242 4242 4242"
                        value={newCardForm.cardNumber}
                        onChange={(e) => setNewCardForm({ ...newCardForm, cardNumber: e.target.value })}
                        className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg text-xs font-mono"
                        required
                      />
                    </div>

                    <div className="grid grid-cols-2 gap-2">
                      <div>
                        <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1">
                          Expiry (MM/YY)
                        </label>
                        <input
                          type="text"
                          placeholder="12/28"
                          value={newCardForm.cardExpiry}
                          onChange={(e) => setNewCardForm({ ...newCardForm, cardExpiry: e.target.value })}
                          className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg text-xs font-mono"
                          required
                        />
                      </div>
                      <div>
                        <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1">
                          CVC / CVV
                        </label>
                        <input
                          type="password"
                          placeholder="424"
                          maxLength={4}
                          value={newCardForm.cardCvc}
                          onChange={(e) => setNewCardForm({ ...newCardForm, cardCvc: e.target.value })}
                          className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg text-xs font-mono"
                          required
                        />
                      </div>
                    </div>
                  </>
                ) : (
                  <>
                    <div>
                      <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1">
                        Account Holder Name
                      </label>
                      <input
                        type="text"
                        placeholder="e.g. Acme Regulatory Corp GmbH"
                        value={newCardForm.cardHolder}
                        onChange={(e) => setNewCardForm({ ...newCardForm, cardHolder: e.target.value })}
                        className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg text-xs"
                        required
                      />
                    </div>

                    <div>
                      <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1">
                        Bank Name
                      </label>
                      <input
                        type="text"
                        placeholder="e.g. Deutsche Bank Frankfurt"
                        value={newCardForm.bankName}
                        onChange={(e) => setNewCardForm({ ...newCardForm, bankName: e.target.value })}
                        className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg text-xs"
                        required
                      />
                    </div>

                    <div>
                      <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1">
                        IBAN (International Bank Account Number)
                      </label>
                      <input
                        type="text"
                        placeholder="DE89 3704 0044 0532 0130 00"
                        value={newCardForm.iban}
                        onChange={(e) => setNewCardForm({ ...newCardForm, iban: e.target.value })}
                        className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg text-xs font-mono uppercase"
                        required
                      />
                    </div>
                  </>
                )}

                <div className="pt-2 flex justify-end gap-2">
                  <button
                    type="button"
                    onClick={() => setIsAddPaymentModalOpen(false)}
                    className="px-3 py-2 bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 font-bold rounded-lg cursor-pointer"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="px-4 py-2 bg-indigo-600 hover:bg-indigo-500 text-white font-bold rounded-lg shadow-xs cursor-pointer"
                  >
                    Verify & Store Method
                  </button>
                </div>
              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* MODAL 3: INVOICE DETAIL & STATUTORY RECEIPT */}
      <AnimatePresence>
        {selectedInvoiceForModal && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/60 backdrop-blur-xs">
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl max-w-2xl w-full p-6 shadow-2xl space-y-5 max-h-[90vh] overflow-y-auto"
            >
              {/* Receipt Header */}
              <div className="flex items-start justify-between border-b border-slate-100 dark:border-slate-800 pb-4">
                <div>
                  <div className="text-[10px] font-mono font-bold uppercase tracking-wider text-indigo-600 dark:text-indigo-400">
                    Official Statutory Tax Invoice
                  </div>
                  <h3 className="text-xl font-black text-slate-900 dark:text-white mt-0.5">
                    {selectedInvoiceForModal.invoiceNumber}
                  </h3>
                  <p className="text-xs text-slate-500 dark:text-slate-400">
                    Period: {selectedInvoiceForModal.period}
                  </p>
                </div>

                <div className="flex items-center gap-2">
                  <button
                    onClick={() => handleDownloadInvoice(selectedInvoiceForModal)}
                    className="p-2 bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 rounded-lg text-slate-700 dark:text-slate-200 cursor-pointer"
                    title="Print/Download"
                  >
                    <Printer className="w-4 h-4" />
                  </button>
                  <button
                    onClick={() => setSelectedInvoiceForModal(null)}
                    className="p-2 text-slate-400 hover:text-slate-600 dark:hover:text-white rounded-lg cursor-pointer"
                  >
                    <X className="w-5 h-5" />
                  </button>
                </div>
              </div>

              {/* Vendor & Client Entity Box */}
              <div className="grid grid-cols-2 gap-4 text-xs">
                <div className="space-y-1 bg-slate-50 dark:bg-slate-800/40 p-3 rounded-xl">
                  <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Issued By</span>
                  <div className="font-bold text-slate-900 dark:text-white">RegTech Sovereign Cloud AG</div>
                  <div className="text-slate-500">Europa-Allee 12, 60327 Frankfurt am Main</div>
                  <div className="font-mono text-[11px] text-slate-500">VAT ID: DE814981920</div>
                </div>

                <div className="space-y-1 bg-slate-50 dark:bg-slate-800/40 p-3 rounded-xl">
                  <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Billed To</span>
                  <div className="font-bold text-slate-900 dark:text-white">{companyProfile.legalName}</div>
                  <div className="text-slate-500">{companyProfile.addressLine}, {companyProfile.city}</div>
                  <div className="font-mono text-[11px] text-slate-500">VAT ID: {selectedInvoiceForModal.taxId}</div>
                </div>
              </div>

              {/* Items Breakdown Table */}
              <div className="border border-slate-200 dark:border-slate-800 rounded-xl overflow-hidden text-xs">
                <table className="w-full text-left">
                  <thead className="bg-slate-50 dark:bg-slate-800/60 font-bold text-slate-500 border-b border-slate-200 dark:border-slate-800">
                    <tr>
                      <th className="p-3">Description</th>
                      <th className="p-3 text-center">Qty</th>
                      <th className="p-3 text-right">Unit Price</th>
                      <th className="p-3 text-right">Amount</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                    {selectedInvoiceForModal.items.map((item, idx) => (
                      <tr key={idx}>
                        <td className="p-3 font-semibold text-slate-800 dark:text-slate-200">
                          {item.description}
                        </td>
                        <td className="p-3 text-center font-mono text-slate-500">
                          {item.quantity}
                        </td>
                        <td className="p-3 text-right font-mono text-slate-600 dark:text-slate-400">
                          €{item.unitPrice.toFixed(2)}
                        </td>
                        <td className="p-3 text-right font-mono font-bold text-slate-900 dark:text-white">
                          €{item.amount.toFixed(2)}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>

              {/* Totals & Tax Breakdown */}
              <div className="flex justify-end text-xs">
                <div className="w-64 space-y-1.5">
                  <div className="flex justify-between text-slate-500">
                    <span>Subtotal:</span>
                    <span className="font-mono">€{selectedInvoiceForModal.subtotal.toFixed(2)}</span>
                  </div>
                  <div className="flex justify-between text-slate-500">
                    <span>VAT ({selectedInvoiceForModal.vatRate}%):</span>
                    <span className="font-mono">€{selectedInvoiceForModal.taxAmount.toFixed(2)}</span>
                  </div>
                  <div className="flex justify-between font-bold text-slate-900 dark:text-white border-t border-slate-200 dark:border-slate-800 pt-2 text-sm">
                    <span>Total Paid:</span>
                    <span className="font-mono font-black text-indigo-600 dark:text-indigo-400">
                      €{selectedInvoiceForModal.total.toFixed(2)}
                    </span>
                  </div>
                </div>
              </div>

              {/* Cryptographic Compliance QR Code & Stamp */}
              <div className="p-3 bg-slate-50 dark:bg-slate-800/40 border border-slate-200 dark:border-slate-800 rounded-xl flex items-center justify-between text-[11px]">
                <div className="space-y-0.5">
                  <div className="font-bold text-slate-700 dark:text-slate-300 flex items-center gap-1.5">
                    <ShieldCheck className="w-3.5 h-3.5 text-emerald-500" />
                    <span>GoBD & ZATCA Cryptographic Integrity Stamp</span>
                  </div>
                  <div className="font-mono text-[10px] text-slate-400 truncate max-w-sm">
                    {selectedInvoiceForModal.cryptographicStamp}
                  </div>
                </div>

                <div className="p-1.5 bg-white dark:bg-slate-900 rounded border border-slate-200 dark:border-slate-700">
                  <QrCode className="w-8 h-8 text-slate-800 dark:text-slate-200" />
                </div>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* MODAL 4: PURCHASE ADD-ON CONFIRMATION */}
      <AnimatePresence>
        {selectedAddonForPurchase && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/60 backdrop-blur-xs">
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl max-w-md w-full p-5 shadow-2xl space-y-4"
            >
              <div className="flex items-center justify-between border-b border-slate-100 dark:border-slate-800 pb-3">
                <h3 className="text-sm font-bold text-slate-900 dark:text-white flex items-center gap-2">
                  <ShoppingBag className="w-4 h-4 text-indigo-600" />
                  <span>Confirm Entitlement Purchase</span>
                </h3>
                <button
                  onClick={() => setSelectedAddonForPurchase(null)}
                  className="p-1 text-slate-400 hover:text-slate-600 dark:hover:text-white rounded cursor-pointer"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>

              <div className="p-3 bg-slate-50 dark:bg-slate-800/40 rounded-xl space-y-1">
                <div className="font-bold text-slate-900 dark:text-white text-sm">
                  {selectedAddonForPurchase.title}
                </div>
                <div className="text-xs text-slate-500 dark:text-slate-400 leading-relaxed">
                  {selectedAddonForPurchase.description}
                </div>
                <div className="text-base font-black font-mono text-indigo-600 dark:text-indigo-400 pt-1">
                  €{selectedAddonForPurchase.priceEur.toFixed(2)}{' '}
                  <span className="text-[11px] font-normal text-slate-400">+ 19% VAT</span>
                </div>
              </div>

              <div className="text-xs space-y-2">
                <div className="text-slate-600 dark:text-slate-400">
                  Payment instrument: <strong>{paymentMethods.find(p => p.isDefault)?.brand || 'Default Card'}</strong>
                </div>
                <div className="text-[11px] text-slate-400 flex items-center gap-1">
                  <CheckCircle2 className="w-3 h-3 text-emerald-500" />
                  <span>Entitlement will be provisioned immediately upon confirmation.</span>
                </div>
              </div>

              <div className="pt-2 flex justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setSelectedAddonForPurchase(null)}
                  className="px-3 py-2 bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 text-xs font-bold rounded-lg cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  onClick={handleExecuteAddonPurchase}
                  disabled={isPurchasingAddon}
                  className="px-4 py-2 bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-bold rounded-lg shadow-xs flex items-center gap-1.5 transition cursor-pointer disabled:opacity-50"
                >
                  {isPurchasingAddon ? <RefreshCw className="w-3.5 h-3.5 animate-spin" /> : <Check className="w-3.5 h-3.5" />}
                  <span>Authorize & Pay</span>
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default ClientBillingDashboard;
