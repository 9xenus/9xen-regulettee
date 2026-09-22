import React, { useState, useMemo } from 'react';
import { 
  Check, 
  Sparkles, 
  Sliders, 
  ShieldCheck, 
  Cpu, 
  Lock, 
  Layers, 
  Download, 
  Send, 
  CheckCircle2, 
  Building2, 
  ArrowRight,
  Zap,
  HelpCircle,
  FileText,
  Calculator,
  Activity,
  Layers3,
  CreditCard,
  Key
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { fetchWithRetry } from '../../lib/api-client';
import { StripeCheckoutModal, StripeCheckoutItem } from '../payment/StripeCheckoutModal';

export const PricingSection: React.FC = () => {
  const [pricingMode, setPricingMode] = useState<'standard' | 'calculator' | 'one-time' | 'curator' | 'verticals'>('calculator');
  const [isYearly, setIsYearly] = useState(false);

  // Stripe Checkout state
  const [checkoutItem, setCheckoutItem] = useState<StripeCheckoutItem | null>(null);
  const [isCheckoutOpen, setIsCheckoutOpen] = useState<boolean>(false);

  // Tooltip active states
  const [activeTooltip, setActiveTooltip] = useState<string | null>(null);

  // --- Volume Calculator State ---
  const [checksVolume, setChecksVolume] = useState<number>(10000); // 1,000 to 250,000
  const [entitiesCount, setEntitiesCount] = useState<number>(3);    // 1 to 50
  const [assetsCount, setAssetsCount] = useState<number>(10);      // 1 to 100
  const [teamSeats, setTeamSeats] = useState<number>(8);           // 1 to 100

  // --- Curator State ---
  const [nodesCount, setNodesCount] = useState<number>(10);
  const [seatsCount, setSeatsCount] = useState<number>(15);
  const [selectedFrameworks, setSelectedFrameworks] = useState<string[]>(['GDPR', 'DORA']);
  const [selectedAddons, setSelectedAddons] = useState<string[]>(['AI_RISK_AUDITING']);
  const [companyName, setCompanyName] = useState<string>('');
  const [contactEmail, setContactEmail] = useState<string>('');
  
  const [curatedQuote, setCuratedQuote] = useState<any>(null);
  const [isCuratingLoading, setIsCuratingLoading] = useState<boolean>(false);
  const [showQuoteModal, setShowQuoteModal] = useState<boolean>(false);

  // --- Calculator Cost Logic ---
  const calculatorEstimate = useMemo(() => {
    // Determine recommended tier
    let recommendedTier = 'Starter';
    let basePrice = 59;
    
    if (checksVolume > 20000 || entitiesCount > 5 || assetsCount > 15 || teamSeats > 10) {
      recommendedTier = 'Pro';
      basePrice = 299;
    }
    if (checksVolume > 100000 || entitiesCount > 15 || assetsCount > 50 || teamSeats > 30) {
      recommendedTier = 'Enterprise';
      basePrice = 899;
    }

    // Incremental costs
    const includedChecks = recommendedTier === 'Starter' ? 2000 : recommendedTier === 'Pro' ? 15000 : 50000;
    const extraChecks = Math.max(0, checksVolume - includedChecks);
    const checksCost = Math.round((extraChecks / 1000) * 12); // €12 per 1,000 extra checks

    const includedEntities = recommendedTier === 'Starter' ? 1 : recommendedTier === 'Pro' ? 3 : 10;
    const extraEntities = Math.max(0, entitiesCount - includedEntities);
    const entitiesCost = extraEntities * 45; // €45 per extra subsidiary/entity

    const includedAssets = recommendedTier === 'Starter' ? 5 : recommendedTier === 'Pro' ? 20 : 50;
    const extraAssets = Math.max(0, assetsCount - includedAssets);
    const assetsCost = extraAssets * 10; // €10 per extra asset

    const includedSeats = recommendedTier === 'Starter' ? 3 : recommendedTier === 'Pro' ? 10 : 25;
    const extraSeats = Math.max(0, teamSeats - includedSeats);
    const seatsCost = extraSeats * 15; // €15 per extra seat

    const subtotalMonthly = basePrice + checksCost + entitiesCost + assetsCost + seatsCost;
    const discountFactor = isYearly ? 0.2 : 0;
    const finalMonthlyPrice = Math.round(subtotalMonthly * (1 - discountFactor));
    const annualTotal = finalMonthlyPrice * 12;

    return {
      recommendedTier,
      basePrice,
      checksCost,
      entitiesCost,
      assetsCost,
      seatsCost,
      subtotalMonthly,
      discountAmount: Math.round(subtotalMonthly * discountFactor),
      finalMonthlyPrice,
      annualTotal
    };
  }, [checksVolume, entitiesCount, assetsCount, teamSeats, isYearly]);

  // Standard Plans (Preserved verbatim)
  const standardPlans = [
    {
      name: 'Starter',
      price: isYearly ? 49 : 59,
      description: 'Ideal for small teams and startups starting their compliance journey.',
      features: [
        'Up to 5 connected systems',
        'Basic privacy mapping',
        'Standard cookie consent',
        'Monthly compliance reports',
        'Email support',
      ],
      cta: 'Start Free Trial',
      popular: false,
    },
    {
      name: 'Pro',
      price: isYearly ? 249 : 299,
      description: 'Advanced tools for growing companies with complex regulatory needs.',
      features: [
        'Unlimited connected systems',
        'Automated GDPR Article 30',
        'Real-time drift detection',
        'DORA & NIS2 audit kits',
        'Priority 24/7 support',
        'Custom API access',
      ],
      cta: 'Get Started',
      popular: true,
    },
    {
      name: 'Enterprise',
      price: 'Custom',
      description: 'Bespoke solutions for global organizations requiring maximum sovereignty.',
      features: [
        'Dedicated sovereign cloud',
        'White-labeled portals',
        'On-premise deployment options',
        'Advanced AI risk auditing',
        'SLA-backed uptime',
        'Dedicated account manager',
      ],
      cta: 'Contact Sales',
      popular: false,
    },
  ];

  // Industry Vertical & Add-On Modules
  const verticalAddons = [
    {
      id: 'addon-sovereign-enclave',
      title: 'Sovereign Cloud Enclave',
      price: isYearly ? '€399' : '€499',
      numericPriceEur: isYearly ? 399 : 499,
      unit: '/month',
      badge: 'Maximum Sovereignty',
      description: 'Dedicated isolated EU data boundary with hardware HSM key storage and zero cross-border telemetry.',
      features: ['AES-256-GCM HSM Key Isolation', 'EU Data Boundary Guarantee', 'Air-Gapped Audit Trail', 'Zero Foreign Jurisdiction Access']
    },
    {
      id: 'addon-ai-risk-audit',
      title: 'AI Risk Audit & Auto-Remediation',
      price: isYearly ? '€239' : '€299',
      numericPriceEur: isYearly ? 239 : 299,
      unit: '/month',
      badge: 'EU AI Act Compliant',
      description: 'Continuous model lineage verification, automated DPIA generator, and real-time hallucination/bias guardrails.',
      features: ['Automated Model DPIA Generator', 'Bias & Drift Telemetry', 'NIST PQC Proof Verification', 'Auto-Remediation Script Engine']
    },
    {
      id: 'addon-zkp-vault',
      title: 'ZKP Zero-Knowledge Evidence Vault',
      price: isYearly ? '€199' : '€249',
      numericPriceEur: isYearly ? 199 : 249,
      unit: '/month',
      badge: 'Cryptographic Privacy',
      description: 'Generate Groth16 zero-knowledge compliance proofs for regulators without exposing sensitive PII records.',
      features: ['Groth16 Zero-Knowledge SNARKs', 'PII Concealment Proofs', '1-Click Regulator Export', 'Immutable Hash Ledger']
    },
    {
      id: 'addon-edtech-shield',
      title: 'EdTech / Children Privacy Shield',
      price: isYearly ? '€159' : '€199',
      numericPriceEur: isYearly ? 159 : 199,
      unit: '/month',
      badge: 'COPPA & EU K-12',
      description: 'Child data protection verification, COPPA consent gates, and student record anonymization suite.',
      features: ['Parental Consent Gate SDK', 'Student PII Anonymizer', 'School District Compliance', 'Real-time Breach Isolation']
    },
    {
      id: 'addon-govtech-connector',
      title: 'GovTech & B2G Regulator Connector',
      price: isYearly ? '€279' : '€349',
      numericPriceEur: isYearly ? 279 : 349,
      unit: '/month',
      badge: 'B2G Direct Integration',
      description: 'Direct automated filing channel with ESMA, EDPB, BaFin, FCA, and national regulatory gazettes.',
      features: ['Direct Statutory Gazette Push', 'Automated Breach Filing (Art. 33)', 'Regulator Audit Inspection Portal', 'Legal Verification Receipts']
    },
    {
      id: 'addon-cyber-insurance',
      title: 'Cyber Insurance & Risk Connector',
      price: isYearly ? '€119' : '€149',
      numericPriceEur: isYearly ? 119 : 149,
      unit: '/month',
      badge: 'Premium Reduction',
      description: 'Streamlined telemetric audit log sharing with cyber underwriters for up to 35% insurance rate discounts.',
      features: ['Underwriter Telemetry Stream', 'Real-Time Risk Rating Export', 'Automated Claim Evidence Package', 'Underwriting Audit Signoff']
    }
  ];

  // CaaS Enterprise One-Time Perpetual Licensing Options
  const oneTimeEnterpriseLicenses = [
    {
      id: 'caas-one-time-enterprise',
      title: 'Enterprise Perpetual License',
      price: '€49,900',
      numericPriceEur: 49900,
      unit: 'one-time fee',
      badge: 'Perpetual Core Engine License',
      popular: true,
      description: 'Lifetime CaaS core compliance engine source code escrow, on-premise private cloud deployment, and unlimited subsidiary entities.',
      features: [
        'Lifetime CaaS Core Engine Source Code & Escrow',
        'On-Premise or Sovereign Private Cloud Deployment',
        'Unlimited Sub-Entities & Subsidiary Organizations',
        '3 Years Included Continuous Regulatory Rule Updates',
        'Full API Integration SDK & Webhook Gateway',
        'Dedicated Executive Technical DPO & Legal Counsel'
      ]
    },
    {
      id: 'caas-sovereign-perpetual',
      title: 'Global Sovereign Enclave Perpetual',
      price: '€99,500',
      numericPriceEur: 99500,
      unit: 'one-time fee',
      badge: 'Fortune 500 Sovereign Enclave',
      popular: false,
      description: 'Custom multi-jurisdictional enclave build with Post-Quantum Cryptography (PQC) sharding and air-gapped infrastructure escrow.',
      features: [
        'Custom Multi-Jurisdictional Sovereign Enclave Build',
        'Post-Quantum Cryptographic (PQC) Key Sharding',
        'Direct B2G Regulatory Authority Liaison Integration',
        'Custom Industry Regulatory Engine Adaptation',
        'Air-Gapped Infrastructure Security Escrow',
        'Lifetime Continuous Auditing & Auto-Remediation'
      ]
    },
    {
      id: 'caas-one-time-audit-scan',
      title: 'Enterprise One-Time Compliance Health Scan',
      price: '€2,500',
      numericPriceEur: 2500,
      unit: 'one-time audit',
      badge: 'Comprehensive One-Time Audit',
      popular: false,
      description: 'Full-spectrum automated compliance scan across GDPR, DORA, NIS2, and EU AI Act prior to perpetual deployment.',
      features: [
        '250,000 Automated Scan Probes across Infrastructure',
        'Instant Regulator-Ready Audit Report & Evidence Vault',
        'Complete Data Lineage & Shadow AI Discovery Map',
        '1-on-1 Senior Legal Engineer & CISO Executive Debrief'
      ]
    }
  ];

  // Available Framework Options for Curator
  const frameworkOptions = [
    { id: 'GDPR', label: 'GDPR (EU 2016/679)', price: 0, desc: 'Included in base' },
    { id: 'DORA', label: 'DORA (EU Digital Resilience)', price: 79, desc: '+€79/mo' },
    { id: 'NIS2', label: 'NIS2 (EU Cyber Directive)', price: 79, desc: '+€79/mo' },
    { id: 'EU_AI_ACT', label: 'EU AI Act (Reg 2024/1689)', price: 99, desc: '+€99/mo' },
    { id: 'MICA', label: 'MiCA (Crypto Assets)', price: 89, desc: '+€89/mo' },
    { id: 'SOC2_ISO', label: 'SOC 2 & ISO 27001 Suite', price: 69, desc: '+€69/mo' }
  ];

  // Available Add-On Options for Curator
  const addonOptions = [
    { id: 'SOVEREIGN_ENCLAVE', label: 'Sovereign Enclave', price: 499, desc: 'Isolated HSM & Air-Gap' },
    { id: 'AI_RISK_AUDITING', label: 'AI Risk Audit & Remediation', price: 299, desc: 'Continuous Model Guardrails' },
    { id: 'ZKP_EVIDENCE_VAULT', label: 'ZKP Zero-Knowledge Vault', price: 249, desc: 'Cryptographic Privacy Proofs' },
    { id: 'EDTECH_SHIELD', label: 'EdTech Shield', price: 199, desc: 'Student Data & COPPA Gates' },
    { id: 'GOVTECH_SHIELD', label: 'GovTech & B2G Connector', price: 349, desc: 'Direct Regulator Gazette Push' },
    { id: 'CYBER_INSURANCE_CONNECTOR', label: 'Cyber Insurance Connector', price: 149, desc: 'Underwriter Telemetry Stream' }
  ];

  // Real-time Pricing Calculation
  const curatorCalculatedPrice = useMemo(() => {
    let base = 59;
    if (nodesCount > 15 || seatsCount > 25 || selectedFrameworks.length >= 3) {
      base = 299;
    }
    if (nodesCount > 50 || seatsCount > 100 || selectedAddons.includes('SOVEREIGN_ENCLAVE')) {
      base = 899;
    }

    const extraNodes = Math.max(0, nodesCount - 5);
    const nodesCost = extraNodes * 12;

    const extraSeats = Math.max(0, seatsCount - 5);
    const seatsCost = extraSeats * 18;

    const extraFrameworks = Math.max(0, selectedFrameworks.length - 1);
    const frameworksCost = extraFrameworks * 79;

    let addonsCost = 0;
    selectedAddons.forEach((addonId) => {
      const match = addonOptions.find(a => a.id === addonId);
      if (match) addonsCost += match.price;
    });

    const subtotal = base + nodesCost + seatsCost + frameworksCost + addonsCost;
    const discount = isYearly ? 0.2 : 0;
    const finalMonthly = Math.round(subtotal * (1 - discount));
    const annualCommitment = finalMonthly * 12;

    return {
      base,
      nodesCost,
      seatsCost,
      frameworksCost,
      addonsCost,
      subtotal,
      discountAmount: Math.round(subtotal * discount),
      finalMonthly,
      annualCommitment
    };
  }, [nodesCount, seatsCount, selectedFrameworks, selectedAddons, isYearly]);

  const toggleFramework = (id: string) => {
    if (selectedFrameworks.includes(id)) {
      if (selectedFrameworks.length === 1) return; // Keep at least 1
      setSelectedFrameworks(selectedFrameworks.filter(f => f !== id));
    } else {
      setSelectedFrameworks([...selectedFrameworks, id]);
    }
  };

  const toggleAddon = (id: string) => {
    if (selectedAddons.includes(id)) {
      setSelectedAddons(selectedAddons.filter(a => a !== id));
    } else {
      setSelectedAddons([...selectedAddons, id]);
    }
  };

  const handleCurateQuote = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsCuratingLoading(true);
    try {
      const res = await fetchWithRetry('/api/v1/billing/curate-plan', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          nodes: nodesCount,
          seats: seatsCount,
          billingCycle: isYearly ? 'ANNUAL' : 'MONTHLY',
          frameworks: selectedFrameworks,
          addons: selectedAddons,
          companyName: companyName || 'Prospect Organization',
          contactEmail
        })
      });

      if (res && res.ok) {
        const json = await res.json();
        if (json.success) {
          setCuratedQuote(json.quote);
          setShowQuoteModal(true);
        }
      }
    } catch (err) {
      console.warn('Quote curation error:', err);
    } finally {
      setIsCuratingLoading(false);
    }
  };

  return (
    <section id="pricing" className="py-24 bg-white relative overflow-hidden">
      <div className="container mx-auto px-4 sm:px-6">
        
        {/* Section Header */}
        <div className="text-center max-w-3xl mx-auto mb-12">
          <div className="inline-flex items-center gap-2 px-3.5 py-1.5 bg-indigo-50 border border-indigo-200 rounded-full text-indigo-700 text-xs font-bold uppercase tracking-wider mb-4">
            <Sparkles className="w-3.5 h-3.5 text-indigo-600" />
            <span>TRANSPARENT & VOLUME-BASED PRICING</span>
          </div>
          <h3 className="text-3xl sm:text-5xl font-black text-slate-900 tracking-tight mb-4">
            Estimate Cost by Compliance Volume & Entities
          </h3>
          <p className="text-base sm:text-lg text-slate-600 leading-relaxed">
            Use our volume calculator to estimate monthly investment based on automated compliance checks, monitored legal entities, connected systems, and team seats.
          </p>

          {/* Pricing Navigation Mode Pills */}
          <div className="mt-8 flex items-center justify-center gap-2 flex-wrap bg-slate-100 p-1.5 rounded-2xl max-w-4xl mx-auto border border-slate-200">
            <button
              onClick={() => setPricingMode('calculator')}
              className={`px-4 py-2.5 rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 cursor-pointer ${pricingMode === 'calculator' ? 'bg-indigo-600 text-white shadow-md' : 'text-slate-600 hover:text-slate-900'}`}
            >
              <Calculator className="w-3.5 h-3.5" />
              <span>Volume & Entity Calculator</span>
            </button>
            <button
              onClick={() => setPricingMode('standard')}
              className={`px-4 py-2.5 rounded-xl text-xs font-bold transition-all cursor-pointer ${pricingMode === 'standard' ? 'bg-indigo-600 text-white shadow-md' : 'text-slate-600 hover:text-slate-900'}`}
            >
              Standard Plans
            </button>
            <button
              onClick={() => setPricingMode('one-time')}
              className={`px-4 py-2.5 rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 cursor-pointer ${pricingMode === 'one-time' ? 'bg-indigo-600 text-white shadow-md' : 'text-slate-600 hover:text-slate-900'}`}
            >
              <ShieldCheck className="w-3.5 h-3.5 text-amber-300" />
              <span>CaaS One-Time Enterprise</span>
            </button>
            <button
              onClick={() => setPricingMode('curator')}
              className={`px-4 py-2.5 rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 cursor-pointer ${pricingMode === 'curator' ? 'bg-indigo-600 text-white shadow-md' : 'text-slate-600 hover:text-slate-900'}`}
            >
              <Sliders className="w-3.5 h-3.5" />
              <span>Full Plan Curator</span>
            </button>
            <button
              onClick={() => setPricingMode('verticals')}
              className={`px-4 py-2.5 rounded-xl text-xs font-bold transition-all cursor-pointer ${pricingMode === 'verticals' ? 'bg-indigo-600 text-white shadow-md' : 'text-slate-600 hover:text-slate-900'}`}
            >
              Industry Add-Ons
            </button>
          </div>

          {/* Monthly vs Annual Toggle */}
          <div className="flex items-center justify-center gap-4 mt-8">
            <span className={`text-sm ${!isYearly ? 'text-slate-900 font-bold' : 'text-slate-500'}`}>Monthly Billing</span>
            <button
              onClick={() => setIsYearly(!isYearly)}
              className="w-12 h-6 bg-slate-200 rounded-full relative transition-colors cursor-pointer"
            >
              <div className={`absolute top-1 left-1 w-4 h-4 bg-white rounded-full transition-transform ${isYearly ? 'translate-x-6' : ''}`} />
            </button>
            <span className={`text-sm ${isYearly ? 'text-slate-900 font-bold' : 'text-slate-500'}`}>
              Annual Billing <span className="text-emerald-600 font-bold ml-1">(-20% Discount)</span>
            </span>
          </div>
        </div>

        {/* --- VIEW: Volume & Entity Cost Calculator --- */}
        {pricingMode === 'calculator' && (
          <div className="max-w-5xl mx-auto bg-slate-900 text-white p-6 sm:p-10 rounded-[2.5rem] shadow-2xl border border-slate-800">
            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between border-b border-slate-800 pb-6 mb-8 gap-4">
              <div className="flex items-center gap-3">
                <div className="p-3 bg-indigo-500/20 border border-indigo-500/30 rounded-2xl text-indigo-400">
                  <Calculator className="w-6 h-6" />
                </div>
                <div>
                  <h4 className="text-xl font-black text-white">Compliance Volume & Entity Estimator</h4>
                  <p className="text-xs text-slate-400">Adjust volume sliders to see estimated monthly cost and recommended tier instantly.</p>
                </div>
              </div>
              <div className="px-3.5 py-1.5 bg-indigo-500/10 text-indigo-300 border border-indigo-500/30 rounded-full text-xs font-mono font-bold flex items-center gap-2">
                <Activity className="w-3.5 h-3.5 text-indigo-400" />
                <span>Live Cost Calculator</span>
              </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
              {/* Left Column: Interactive Volume Sliders */}
              <div className="lg:col-span-7 space-y-6">
                
                {/* 1. Compliance Checks / Scans Volume */}
                <div className="bg-slate-950 p-5 rounded-2xl border border-slate-800 space-y-3 relative">
                  <div className="flex justify-between items-start text-xs font-bold">
                    <div className="flex items-center gap-2">
                      <Activity className="w-4 h-4 text-indigo-400" />
                      <span className="text-slate-200">Automated Compliance Checks / Month</span>
                      
                      {/* Tooltip trigger */}
                      <div className="relative inline-block">
                        <button
                          type="button"
                          onMouseEnter={() => setActiveTooltip('checks')}
                          onMouseLeave={() => setActiveTooltip(null)}
                          onClick={() => setActiveTooltip(activeTooltip === 'checks' ? null : 'checks')}
                          className="p-1 text-slate-400 hover:text-indigo-400 focus:outline-none cursor-pointer transition-colors"
                          title="View Tier Cost Efficiency"
                        >
                          <HelpCircle className="w-3.5 h-3.5" />
                        </button>

                        <AnimatePresence>
                          {activeTooltip === 'checks' && (
                            <motion.div
                              initial={{ opacity: 0, y: 5, scale: 0.95 }}
                              animate={{ opacity: 1, y: 0, scale: 1 }}
                              exit={{ opacity: 0, y: 5, scale: 0.95 }}
                              className="absolute left-0 top-6 z-50 w-72 sm:w-80 p-4 bg-slate-900 border border-indigo-500/40 rounded-2xl shadow-2xl text-[11px] text-slate-200 space-y-2 pointer-events-none"
                            >
                              <div className="flex items-center justify-between text-indigo-300 font-bold border-b border-slate-800 pb-1.5">
                                <span className="flex items-center gap-1.5">
                                  <Zap className="w-3.5 h-3.5 text-indigo-400" />
                                  Check Volume Cost Efficiency
                                </span>
                                <span className="px-1.5 py-0.5 bg-indigo-500/20 text-indigo-300 rounded text-[9px] font-mono">
                                  ~€{(calculatorEstimate.finalMonthlyPrice / checksVolume).toFixed(3)}/check
                                </span>
                              </div>
                              <p className="text-slate-300 leading-normal">
                                Higher volumes unlock drastically lower per-check unit costs:
                              </p>
                              <ul className="space-y-1 text-slate-400 font-mono text-[10px]">
                                <li className="flex justify-between">
                                  <span>• Starter (2k checks):</span>
                                  <span className="text-slate-300">~€0.029 / check</span>
                                </li>
                                <li className="flex justify-between text-indigo-300 font-bold">
                                  <span>• Pro Tier (15k bundled):</span>
                                  <span>~€0.012 / check (58% off)</span>
                                </li>
                                <li className="flex justify-between text-emerald-400 font-bold">
                                  <span>• Enterprise (50k+ bundled):</span>
                                  <span>~€0.005 / check (82% off)</span>
                                </li>
                              </ul>
                            </motion.div>
                          )}
                        </AnimatePresence>
                      </div>
                    </div>

                    <div className="text-right">
                      <span className="text-indigo-400 font-mono text-sm block">{checksVolume.toLocaleString()} Checks</span>
                      <span className="text-[10px] text-indigo-300/80 font-mono font-normal">
                        ~€{(calculatorEstimate.finalMonthlyPrice / checksVolume).toFixed(3)} / check
                      </span>
                    </div>
                  </div>

                  <input
                    type="range"
                    min={1000}
                    max={250000}
                    step={1000}
                    value={checksVolume}
                    onChange={(e) => setChecksVolume(parseInt(e.target.value))}
                    className="w-full accent-indigo-500 cursor-pointer"
                  />
                  <div className="flex justify-between text-[10px] text-slate-400">
                    <span>1,000 / mo</span>
                    <span>50,000 / mo</span>
                    <span>250,000 / mo</span>
                  </div>

                  {/* Tier Efficiency Benefit Callout Badge */}
                  <div className="pt-2 flex items-center justify-between border-t border-slate-900 text-[11px]">
                    <span className="text-slate-400">Includes real-time GDPR, DORA, NIS2, and AI Act policy runs.</span>
                    <span className="px-2 py-0.5 bg-indigo-500/10 text-indigo-300 border border-indigo-500/20 rounded-md font-bold shrink-0 text-[10px] flex items-center gap-1">
                      <Zap className="w-3 h-3 text-indigo-400" />
                      {checksVolume < 20000 ? 'Pro tier unlocks 58% check savings' : 'Enterprise efficiency active'}
                    </span>
                  </div>
                </div>

                {/* 2. Legal Entities / Subsidiaries */}
                <div className="bg-slate-950 p-5 rounded-2xl border border-slate-800 space-y-3 relative">
                  <div className="flex justify-between items-start text-xs font-bold">
                    <div className="flex items-center gap-2">
                      <Building2 className="w-4 h-4 text-emerald-400" />
                      <span className="text-slate-200">Monitored Legal Entities / Subsidiaries</span>

                      {/* Tooltip trigger */}
                      <div className="relative inline-block">
                        <button
                          type="button"
                          onMouseEnter={() => setActiveTooltip('entities')}
                          onMouseLeave={() => setActiveTooltip(null)}
                          onClick={() => setActiveTooltip(activeTooltip === 'entities' ? null : 'entities')}
                          className="p-1 text-slate-400 hover:text-emerald-400 focus:outline-none cursor-pointer transition-colors"
                          title="View Multi-Entity Savings"
                        >
                          <HelpCircle className="w-3.5 h-3.5" />
                        </button>

                        <AnimatePresence>
                          {activeTooltip === 'entities' && (
                            <motion.div
                              initial={{ opacity: 0, y: 5, scale: 0.95 }}
                              animate={{ opacity: 1, y: 0, scale: 1 }}
                              exit={{ opacity: 0, y: 5, scale: 0.95 }}
                              className="absolute left-0 top-6 z-50 w-72 sm:w-80 p-4 bg-slate-900 border border-emerald-500/40 rounded-2xl shadow-2xl text-[11px] text-slate-200 space-y-2 pointer-events-none"
                            >
                              <div className="flex items-center justify-between text-emerald-300 font-bold border-b border-slate-800 pb-1.5">
                                <span className="flex items-center gap-1.5">
                                  <Building2 className="w-3.5 h-3.5 text-emerald-400" />
                                  Multi-Entity Pooling Savings
                                </span>
                                <span className="px-1.5 py-0.5 bg-emerald-500/20 text-emerald-300 rounded text-[9px] font-mono">
                                  Save up to €450/mo
                                </span>
                              </div>
                              <p className="text-slate-300 leading-normal">
                                Higher tiers bundle free entity slots with multi-jurisdiction data isolation:
                              </p>
                              <ul className="space-y-1 text-slate-400 font-mono text-[10px]">
                                <li className="flex justify-between">
                                  <span>• Starter Tier:</span>
                                  <span>1 entity included</span>
                                </li>
                                <li className="flex justify-between text-emerald-300 font-bold">
                                  <span>• Pro Tier:</span>
                                  <span>3 entities bundled (€90/mo savings)</span>
                                </li>
                                <li className="flex justify-between text-cyan-300 font-bold">
                                  <span>• Enterprise Tier:</span>
                                  <span>10 entities bundled (€405/mo savings)</span>
                                </li>
                              </ul>
                            </motion.div>
                          )}
                        </AnimatePresence>
                      </div>
                    </div>

                    <div className="text-right">
                      <span className="text-emerald-400 font-mono text-sm block">{entitiesCount} Entities</span>
                      <span className="text-[10px] text-emerald-300/80 font-mono font-normal">
                        {entitiesCount > 3 ? 'Multi-entity pooling rate' : 'Standard entity rate'}
                      </span>
                    </div>
                  </div>

                  <input
                    type="range"
                    min={1}
                    max={50}
                    step={1}
                    value={entitiesCount}
                    onChange={(e) => setEntitiesCount(parseInt(e.target.value))}
                    className="w-full accent-emerald-500 cursor-pointer"
                  />
                  <div className="flex justify-between text-[10px] text-slate-400">
                    <span>1 Entity</span>
                    <span>10 Entities</span>
                    <span>50 Entities</span>
                  </div>

                  {/* Tier Efficiency Benefit Callout Badge */}
                  <div className="pt-2 flex items-center justify-between border-t border-slate-900 text-[11px]">
                    <span className="text-slate-400">Multi-entity isolation & regional data residency.</span>
                    <span className="px-2 py-0.5 bg-emerald-500/10 text-emerald-300 border border-emerald-500/20 rounded-md font-bold shrink-0 text-[10px] flex items-center gap-1">
                      <ShieldCheck className="w-3 h-3 text-emerald-400" />
                      {entitiesCount <= 3 ? 'Pro bundles 3 entities free' : 'Enterprise multi-entity discount active'}
                    </span>
                  </div>
                </div>

                {/* 3. Connected Assets & IT Infrastructure */}
                <div className="bg-slate-950 p-5 rounded-2xl border border-slate-800 space-y-3 relative">
                  <div className="flex justify-between items-start text-xs font-bold">
                    <div className="flex items-center gap-2">
                      <Layers3 className="w-4 h-4 text-cyan-400" />
                      <span className="text-slate-200">Connected Assets & Infrastructure Systems</span>

                      {/* Tooltip trigger */}
                      <div className="relative inline-block">
                        <button
                          type="button"
                          onMouseEnter={() => setActiveTooltip('assets')}
                          onMouseLeave={() => setActiveTooltip(null)}
                          onClick={() => setActiveTooltip(activeTooltip === 'assets' ? null : 'assets')}
                          className="p-1 text-slate-400 hover:text-cyan-400 focus:outline-none cursor-pointer transition-colors"
                          title="View Connector Bundle Benefits"
                        >
                          <HelpCircle className="w-3.5 h-3.5" />
                        </button>

                        <AnimatePresence>
                          {activeTooltip === 'assets' && (
                            <motion.div
                              initial={{ opacity: 0, y: 5, scale: 0.95 }}
                              animate={{ opacity: 1, y: 0, scale: 1 }}
                              exit={{ opacity: 0, y: 5, scale: 0.95 }}
                              className="absolute left-0 top-6 z-50 w-72 sm:w-80 p-4 bg-slate-900 border border-cyan-500/40 rounded-2xl shadow-2xl text-[11px] text-slate-200 space-y-2 pointer-events-none"
                            >
                              <div className="flex items-center justify-between text-cyan-300 font-bold border-b border-slate-800 pb-1.5">
                                <span className="flex items-center gap-1.5">
                                  <Layers3 className="w-3.5 h-3.5 text-cyan-400" />
                                  Connector Bundle Efficiency
                                </span>
                                <span className="px-1.5 py-0.5 bg-cyan-500/20 text-cyan-300 rounded text-[9px] font-mono">
                                  Save up to €450/mo
                                </span>
                              </div>
                              <p className="text-slate-300 leading-normal">
                                Connect cloud enclaves, databases, and AI models with bundled connectors:
                              </p>
                              <ul className="space-y-1 text-slate-400 font-mono text-[10px]">
                                <li className="flex justify-between">
                                  <span>• Starter Tier:</span>
                                  <span>5 assets included</span>
                                </li>
                                <li className="flex justify-between text-cyan-300 font-bold">
                                  <span>• Pro Tier:</span>
                                  <span>20 assets bundled (€150/mo savings)</span>
                                </li>
                                <li className="flex justify-between text-indigo-300 font-bold">
                                  <span>• Enterprise Tier:</span>
                                  <span>50 assets bundled (€450/mo savings)</span>
                                </li>
                              </ul>
                            </motion.div>
                          )}
                        </AnimatePresence>
                      </div>
                    </div>

                    <div className="text-right">
                      <span className="text-cyan-400 font-mono text-sm block">{assetsCount} Assets</span>
                      <span className="text-[10px] text-cyan-300/80 font-mono font-normal">
                        {assetsCount > 20 ? 'Enterprise connector bundle' : 'Pro connector rate'}
                      </span>
                    </div>
                  </div>

                  <input
                    type="range"
                    min={1}
                    max={100}
                    step={1}
                    value={assetsCount}
                    onChange={(e) => setAssetsCount(parseInt(e.target.value))}
                    className="w-full accent-cyan-500 cursor-pointer"
                  />
                  
                  {/* Tier Efficiency Benefit Callout Badge */}
                  <div className="pt-2 flex items-center justify-between border-t border-slate-900 text-[11px]">
                    <span className="text-slate-400">Cloud enclaves, databases, LLM endpoints & SaaS.</span>
                    <span className="px-2 py-0.5 bg-cyan-500/10 text-cyan-300 border border-cyan-500/20 rounded-md font-bold shrink-0 text-[10px] flex items-center gap-1">
                      <Cpu className="w-3 h-3 text-cyan-400" />
                      {assetsCount <= 5 ? 'Pro bundles 20 assets free' : 'Bulk connector discount active'}
                    </span>
                  </div>
                </div>

                {/* 4. Team Seats */}
                <div className="bg-slate-950 p-5 rounded-2xl border border-slate-800 space-y-3 relative">
                  <div className="flex justify-between items-start text-xs font-bold">
                    <div className="flex items-center gap-2">
                      <ShieldCheck className="w-4 h-4 text-amber-400" />
                      <span className="text-slate-200">Compliance, Risk & Audit Team Seats</span>

                      {/* Tooltip trigger */}
                      <div className="relative inline-block">
                        <button
                          type="button"
                          onMouseEnter={() => setActiveTooltip('seats')}
                          onMouseLeave={() => setActiveTooltip(null)}
                          onClick={() => setActiveTooltip(activeTooltip === 'seats' ? null : 'seats')}
                          className="p-1 text-slate-400 hover:text-amber-400 focus:outline-none cursor-pointer transition-colors"
                          title="View Team Seat Savings"
                        >
                          <HelpCircle className="w-3.5 h-3.5" />
                        </button>

                        <AnimatePresence>
                          {activeTooltip === 'seats' && (
                            <motion.div
                              initial={{ opacity: 0, y: 5, scale: 0.95 }}
                              animate={{ opacity: 1, y: 0, scale: 1 }}
                              exit={{ opacity: 0, y: 5, scale: 0.95 }}
                              className="absolute left-0 top-6 z-50 w-72 sm:w-80 p-4 bg-slate-900 border border-amber-500/40 rounded-2xl shadow-2xl text-[11px] text-slate-200 space-y-2 pointer-events-none"
                            >
                              <div className="flex items-center justify-between text-amber-300 font-bold border-b border-slate-800 pb-1.5">
                                <span className="flex items-center gap-1.5">
                                  <ShieldCheck className="w-3.5 h-3.5 text-amber-400" />
                                  Seat Consolidation Benefits
                                </span>
                                <span className="px-1.5 py-0.5 bg-amber-500/20 text-amber-300 rounded text-[9px] font-mono">
                                  Save up to €330/mo
                                </span>
                              </div>
                              <p className="text-slate-300 leading-normal">
                                Expand your compliance team without individual seat bloat:
                              </p>
                              <ul className="space-y-1 text-slate-400 font-mono text-[10px]">
                                <li className="flex justify-between">
                                  <span>• Starter Tier:</span>
                                  <span>3 seats included</span>
                                </li>
                                <li className="flex justify-between text-amber-300 font-bold">
                                  <span>• Pro Tier:</span>
                                  <span>10 seats bundled (€105/mo savings)</span>
                                </li>
                                <li className="flex justify-between text-emerald-400 font-bold">
                                  <span>• Enterprise Tier:</span>
                                  <span>25 seats bundled (€330/mo savings)</span>
                                </li>
                              </ul>
                            </motion.div>
                          )}
                        </AnimatePresence>
                      </div>
                    </div>

                    <div className="text-right">
                      <span className="text-amber-400 font-mono text-sm block">{teamSeats} Seats</span>
                      <span className="text-[10px] text-amber-300/80 font-mono font-normal">
                        {teamSeats > 10 ? 'Enterprise seat pool' : 'Pro seat pool'}
                      </span>
                    </div>
                  </div>

                  <input
                    type="range"
                    min={1}
                    max={100}
                    step={1}
                    value={teamSeats}
                    onChange={(e) => setTeamSeats(parseInt(e.target.value))}
                    className="w-full accent-amber-500 cursor-pointer"
                  />
                  
                  {/* Tier Efficiency Benefit Callout Badge */}
                  <div className="pt-2 flex items-center justify-between border-t border-slate-900 text-[11px]">
                    <span className="text-slate-400">CISO, DPO, auditor & legal reviewer accounts.</span>
                    <span className="px-2 py-0.5 bg-amber-500/10 text-amber-300 border border-amber-500/20 rounded-md font-bold shrink-0 text-[10px] flex items-center gap-1">
                      <Lock className="w-3 h-3 text-amber-400" />
                      {teamSeats <= 3 ? 'Pro bundles 10 seats free' : 'Seat consolidation discount active'}
                    </span>
                  </div>
                </div>

              </div>

              {/* Right Column: Estimated Price & Recommended Tier */}
              <div className="lg:col-span-5 bg-slate-950 p-6 rounded-3xl border border-slate-800 flex flex-col justify-between space-y-6">
                <div className="space-y-5">
                  <div className="flex items-center justify-between border-b border-slate-800 pb-3">
                    <span className="text-xs font-black uppercase tracking-wider text-slate-400">Recommended Plan</span>
                    <span className="px-3 py-1 bg-indigo-500/20 text-indigo-300 border border-indigo-500/30 rounded-full text-xs font-black uppercase">
                      {calculatorEstimate.recommendedTier} Plan
                    </span>
                  </div>

                  <div className="space-y-2.5 text-xs text-slate-400">
                    <div className="flex justify-between">
                      <span>Base Plan Rate ({calculatorEstimate.recommendedTier}):</span>
                      <span className="font-mono text-white">€{calculatorEstimate.basePrice}/mo</span>
                    </div>
                    <div className="flex justify-between">
                      <span>Checks Volume ({checksVolume.toLocaleString()}/mo):</span>
                      <span className="font-mono text-white">+€{calculatorEstimate.checksCost}/mo</span>
                    </div>
                    <div className="flex justify-between">
                      <span>Monitored Entities ({entitiesCount}):</span>
                      <span className="font-mono text-white">+€{calculatorEstimate.entitiesCost}/mo</span>
                    </div>
                    <div className="flex justify-between">
                      <span>Assets ({assetsCount}) & Seats ({teamSeats}):</span>
                      <span className="font-mono text-white">+€{calculatorEstimate.assetsCost + calculatorEstimate.seatsCost}/mo</span>
                    </div>

                    {isYearly && (
                      <div className="flex justify-between text-emerald-400 font-bold pt-2 border-t border-slate-800">
                        <span>Annual Billing Discount (-20%):</span>
                        <span className="font-mono">-€{calculatorEstimate.discountAmount}/mo</span>
                      </div>
                    )}
                  </div>

                  <div className="pt-4 border-t border-slate-800 space-y-1">
                    <div className="text-[10px] font-bold uppercase tracking-wider text-slate-400">Estimated Monthly Cost</div>
                    <div className="text-5xl font-black text-white font-mono tracking-tight">
                      €{calculatorEstimate.finalMonthlyPrice}
                      <span className="text-xs font-normal text-slate-400 ml-1.5">/month</span>
                    </div>
                    <p className="text-[11px] text-slate-400 pt-1">
                      Annual total: €{calculatorEstimate.annualTotal.toLocaleString()}/year. Billed {isYearly ? 'annually' : 'monthly'}.
                    </p>
                  </div>
                </div>

                <div className="space-y-3 pt-4 border-t border-slate-800">
                  <button
                    onClick={() => setPricingMode('curator')}
                    className="w-full py-3.5 bg-indigo-600 hover:bg-indigo-500 text-white rounded-xl text-xs font-bold uppercase tracking-wider shadow-lg transition-all flex items-center justify-center gap-2 cursor-pointer"
                  >
                    <span>Proceed with {calculatorEstimate.recommendedTier} Plan</span>
                    <ArrowRight className="w-4 h-4" />
                  </button>
                  <p className="text-[10px] text-center text-slate-500">
                    No credit card required for 14-day trial. Custom enterprise SLAs available.
                  </p>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* --- VIEW 1: Standard Plans --- */}
        {pricingMode === 'standard' && (
          <div className="grid lg:grid-cols-3 gap-6 sm:gap-8 max-w-7xl mx-auto">
            {standardPlans.map((plan, idx) => (
              <motion.div
                key={idx}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.4, delay: idx * 0.1 }}
                className={`p-8 rounded-[2rem] border ${plan.popular ? 'border-indigo-600 ring-4 ring-indigo-50 shadow-xl bg-gradient-to-b from-indigo-50/30 to-white' : 'border-slate-200 bg-white shadow-sm'} flex flex-col justify-between`}
              >
                <div>
                  <div className="flex items-center justify-between mb-4">
                    <h4 className="text-xl font-black text-slate-900">{plan.name}</h4>
                    {plan.popular && (
                      <span className="px-3 py-1 bg-indigo-600 text-white text-[10px] font-black uppercase tracking-wider rounded-full">
                        Most Popular
                      </span>
                    )}
                  </div>

                  <div className="flex items-baseline gap-1 mb-4">
                    <span className="text-4xl font-black text-slate-900">
                      {typeof plan.price === 'number' ? `€${plan.price}` : plan.price}
                    </span>
                    {typeof plan.price === 'number' && (
                      <span className="text-slate-500 text-sm font-semibold">/mo</span>
                    )}
                  </div>

                  <p className="text-slate-600 text-sm leading-relaxed mb-8">
                    {plan.description}
                  </p>

                  <div className="space-y-3.5 mb-10">
                    {plan.features.map((feature, fIdx) => (
                      <div key={fIdx} className="flex items-start gap-3 text-xs sm:text-sm text-slate-700">
                        <Check className="w-4 h-4 text-indigo-600 shrink-0 mt-0.5" />
                        <span className="font-medium">{feature}</span>
                      </div>
                    ))}
                  </div>
                </div>

                <button
                  onClick={() => setPricingMode('curator')}
                  className={`w-full py-4 rounded-2xl font-bold text-xs tracking-wider uppercase transition-all cursor-pointer ${plan.popular ? 'bg-indigo-600 text-white hover:bg-indigo-700 shadow-lg shadow-indigo-200' : 'bg-slate-900 text-white hover:bg-slate-800'}`}
                >
                  {plan.cta}
                </button>
              </motion.div>
            ))}
          </div>
        )}

        {/* --- VIEW 2: Interactive Plan Curator (Custom Plan Calculator) --- */}
        {pricingMode === 'curator' && (
          <div className="max-w-5xl mx-auto bg-slate-900 text-white p-6 sm:p-10 rounded-[2.5rem] shadow-2xl border border-slate-800">
            <div className="flex items-center justify-between border-b border-slate-800 pb-6 mb-8">
              <div className="flex items-center gap-3">
                <div className="p-3 bg-indigo-500/20 border border-indigo-500/30 rounded-2xl text-indigo-400">
                  <Sliders className="w-6 h-6" />
                </div>
                <div>
                  <h4 className="text-xl font-black text-white">Custom Compliance Plan Curator</h4>
                  <p className="text-xs text-slate-400">Curate your precise node volume, user count, regulatory scope, and security add-ons.</p>
                </div>
              </div>
              <div className="hidden sm:block text-right">
                <span className="px-3 py-1 bg-emerald-500/20 text-emerald-300 border border-emerald-500/30 rounded-full text-[10px] font-black uppercase tracking-wider">
                  Live Price Algorithm
                </span>
              </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
              {/* Left Column: Configuration Controls */}
              <div className="lg:col-span-7 space-y-6">
                
                {/* 1. Monitored Systems Slider */}
                <div className="bg-slate-950 p-5 rounded-2xl border border-slate-800 space-y-3">
                  <div className="flex justify-between items-center text-xs font-bold">
                    <span className="text-slate-300">Connected Systems / Monitored Assets</span>
                    <span className="text-indigo-400 font-mono text-sm">{nodesCount} Systems</span>
                  </div>
                  <input
                    type="range"
                    min={1}
                    max={100}
                    value={nodesCount}
                    onChange={(e) => setNodesCount(parseInt(e.target.value))}
                    className="w-full accent-indigo-500 cursor-pointer"
                  />
                  <p className="text-[11px] text-slate-400">First 5 systems included in baseline rate (€12/mo per extra system).</p>
                </div>

                {/* 2. Team Seats Slider */}
                <div className="bg-slate-950 p-5 rounded-2xl border border-slate-800 space-y-3">
                  <div className="flex justify-between items-center text-xs font-bold">
                    <span className="text-slate-300">Compliance & Audit Team Seats</span>
                    <span className="text-indigo-400 font-mono text-sm">{seatsCount} Seats</span>
                  </div>
                  <input
                    type="range"
                    min={1}
                    max={150}
                    value={seatsCount}
                    onChange={(e) => setSeatsCount(parseInt(e.target.value))}
                    className="w-full accent-indigo-500 cursor-pointer"
                  />
                  <p className="text-[11px] text-slate-400">First 5 seats included in baseline rate (€18/mo per extra seat).</p>
                </div>

                {/* 3. Regulatory Framework Selector */}
                <div className="bg-slate-950 p-5 rounded-2xl border border-slate-800 space-y-3">
                  <span className="block text-xs font-bold text-slate-300">Active Regulatory Frameworks</span>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                    {frameworkOptions.map((fw) => {
                      const isSelected = selectedFrameworks.includes(fw.id);
                      return (
                        <button
                          key={fw.id}
                          type="button"
                          onClick={() => toggleFramework(fw.id)}
                          className={`p-3 rounded-xl text-left border transition-all flex items-center justify-between cursor-pointer ${isSelected ? 'bg-indigo-600/20 border-indigo-500 text-white' : 'bg-slate-900 border-slate-800 text-slate-400 hover:text-slate-200'}`}
                        >
                          <div>
                            <div className="text-xs font-bold">{fw.label}</div>
                            <div className="text-[10px] text-slate-400">{fw.desc}</div>
                          </div>
                          {isSelected && <CheckCircle2 className="w-4 h-4 text-indigo-400 shrink-0" />}
                        </button>
                      );
                    })}
                  </div>
                </div>

                {/* 4. Specialized Add-Ons */}
                <div className="bg-slate-950 p-5 rounded-2xl border border-slate-800 space-y-3">
                  <span className="block text-xs font-bold text-slate-300">Specialized Security & CaaS Add-Ons</span>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                    {addonOptions.map((addon) => {
                      const isSelected = selectedAddons.includes(addon.id);
                      return (
                        <button
                          key={addon.id}
                          type="button"
                          onClick={() => toggleAddon(addon.id)}
                          className={`p-3 rounded-xl text-left border transition-all flex items-center justify-between cursor-pointer ${isSelected ? 'bg-emerald-600/20 border-emerald-500 text-white' : 'bg-slate-900 border-slate-800 text-slate-400 hover:text-slate-200'}`}
                        >
                          <div>
                            <div className="text-xs font-bold">{addon.label}</div>
                            <div className="text-[10px] text-emerald-400 font-mono">+€{addon.price}/mo</div>
                          </div>
                          {isSelected && <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />}
                        </button>
                      );
                    })}
                  </div>
                </div>

              </div>

              {/* Right Column: Live Calculation Breakdown Panel */}
              <div className="lg:col-span-5 bg-slate-950 p-6 rounded-3xl border border-slate-800 flex flex-col justify-between space-y-6">
                <div className="space-y-4">
                  <h5 className="text-sm font-black uppercase tracking-wider text-indigo-400 border-b border-slate-800 pb-3">
                    Curated Quote Summary
                  </h5>

                  <div className="space-y-2.5 text-xs">
                    <div className="flex justify-between text-slate-400">
                      <span>Base Platform Rate:</span>
                      <span className="font-mono text-white">€{curatorCalculatedPrice.base}/mo</span>
                    </div>
                    <div className="flex justify-between text-slate-400">
                      <span>Monitored Assets ({nodesCount} nodes):</span>
                      <span className="font-mono text-white">+€{curatorCalculatedPrice.nodesCost}/mo</span>
                    </div>
                    <div className="flex justify-between text-slate-400">
                      <span>Team Seats ({seatsCount} users):</span>
                      <span className="font-mono text-white">+€{curatorCalculatedPrice.seatsCost}/mo</span>
                    </div>
                    <div className="flex justify-between text-slate-400">
                      <span>Additional Frameworks:</span>
                      <span className="font-mono text-white">+€{curatorCalculatedPrice.frameworksCost}/mo</span>
                    </div>
                    <div className="flex justify-between text-slate-400">
                      <span>Security & CaaS Add-Ons:</span>
                      <span className="font-mono text-white">+€{curatorCalculatedPrice.addonsCost}/mo</span>
                    </div>

                    {isYearly && (
                      <div className="flex justify-between text-emerald-400 font-bold pt-2 border-t border-slate-800">
                        <span>Annual Commitment Discount (-20%):</span>
                        <span className="font-mono">-€{curatorCalculatedPrice.discountAmount}/mo</span>
                      </div>
                    )}
                  </div>

                  <div className="pt-4 border-t border-slate-800 space-y-1">
                    <div className="text-[10px] font-bold uppercase tracking-wider text-slate-400">Estimated Monthly Total</div>
                    <div className="text-4xl font-black text-white font-mono">
                      €{curatorCalculatedPrice.finalMonthly}
                      <span className="text-xs font-normal text-slate-400 ml-1">/month</span>
                    </div>
                    <p className="text-[11px] text-slate-400">
                      Annual commitment: €{curatorCalculatedPrice.annualCommitment}/year. Billed {isYearly ? 'annually' : 'monthly'}.
                    </p>
                  </div>
                </div>

                {/* Form to submit and lock in curated quote */}
                <form onSubmit={handleCurateQuote} className="space-y-3 pt-4 border-t border-slate-800">
                  <input
                    type="text"
                    required
                    placeholder="Organization Name"
                    value={companyName}
                    onChange={(e) => setCompanyName(e.target.value)}
                    className="w-full px-3.5 py-2.5 bg-slate-900 border border-slate-800 rounded-xl text-xs text-white placeholder-slate-500 focus:outline-none focus:border-indigo-500"
                  />
                  <input
                    type="email"
                    required
                    placeholder="Work Email Address"
                    value={contactEmail}
                    onChange={(e) => setContactEmail(e.target.value)}
                    className="w-full px-3.5 py-2.5 bg-slate-900 border border-slate-800 rounded-xl text-xs text-white placeholder-slate-500 focus:outline-none focus:border-indigo-500"
                  />

                  <button
                    type="submit"
                    disabled={isCuratingLoading}
                    className="w-full py-3.5 bg-indigo-600 hover:bg-indigo-500 text-white rounded-xl text-xs font-bold uppercase tracking-wider shadow-lg transition-all flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50"
                  >
                    <Send className="w-4 h-4" />
                    <span>{isCuratingLoading ? 'Curating Quote...' : 'Lock In Curated Plan & Request Quote'}</span>
                  </button>
                </form>
              </div>
            </div>
          </div>
        )}

        {/* --- VIEW: CaaS Enterprise One-Time Perpetual Pricing --- */}
        {pricingMode === 'one-time' && (
          <div className="space-y-10 max-w-7xl mx-auto">
            <div className="text-center max-w-2xl mx-auto">
              <span className="px-3 py-1 bg-amber-50 text-amber-700 border border-amber-200 rounded-full text-[11px] font-bold uppercase tracking-wider">
                Perpetual Licenses & One-Time Audits
              </span>
              <h4 className="text-2xl sm:text-3xl font-black text-slate-900 mt-2 mb-3">
                CaaS Enterprise One-Time Pricing
              </h4>
              <p className="text-xs sm:text-sm text-slate-600 leading-relaxed">
                For large enterprises, government organizations, and defense contractors requiring permanent engine source code escrow, air-gapped sovereign deployment, or one-time compliance health audits.
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
              {oneTimeEnterpriseLicenses.map((plan) => (
                <div
                  key={plan.id}
                  className={`bg-white rounded-[2.5rem] p-8 border flex flex-col justify-between transition-all relative ${
                    plan.popular
                      ? 'border-indigo-500 shadow-2xl ring-2 ring-indigo-500/20'
                      : 'border-slate-200 shadow-md hover:border-indigo-300'
                  }`}
                >
                  {plan.popular && (
                    <div className="absolute -top-3.5 left-1/2 -translate-x-1/2 px-4 py-1 bg-gradient-to-r from-indigo-600 to-purple-600 text-white text-[10px] font-extrabold uppercase tracking-wider rounded-full shadow-md flex items-center gap-1.5">
                      <Sparkles className="w-3 h-3 text-amber-300" />
                      <span>Most Popular Perpetual</span>
                    </div>
                  )}

                  <div>
                    <div className="flex items-center justify-between mb-4">
                      <span className="px-3 py-1 bg-slate-100 text-slate-800 text-[10px] font-bold uppercase tracking-wider rounded-lg border border-slate-200">
                        {plan.badge}
                      </span>
                      <ShieldCheck className="w-5 h-5 text-indigo-600" />
                    </div>

                    <h5 className="text-xl font-black text-slate-900 mb-2">{plan.title}</h5>
                    <p className="text-xs text-slate-600 leading-relaxed mb-6">{plan.description}</p>

                    <div className="mb-8 p-4 bg-slate-50 rounded-2xl border border-slate-100">
                      <div className="text-3xl font-black text-slate-900 font-mono tracking-tight">
                        {plan.price}
                      </div>
                      <span className="text-[11px] font-bold text-slate-500 uppercase tracking-wider">{plan.unit} • No recurring subscription</span>
                    </div>

                    <div className="space-y-3 mb-8">
                      {plan.features.map((feat, fIdx) => (
                        <div key={fIdx} className="flex items-start gap-2.5 text-xs text-slate-700">
                          <Check className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
                          <span className="font-medium">{feat}</span>
                        </div>
                      ))}
                    </div>
                  </div>

                  <div className="space-y-2.5">
                    <button
                      onClick={() => {
                        setCheckoutItem({
                          id: plan.id,
                          name: plan.title,
                          type: 'SUBSCRIPTION',
                          priceEur: plan.numericPriceEur,
                          period: 'one-time',
                          description: plan.description,
                          features: plan.features,
                          category: 'CaaS Enterprise One-Time License'
                        });
                        setIsCheckoutOpen(true);
                      }}
                      className="w-full py-3.5 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl text-xs font-bold uppercase tracking-wider shadow-lg transition-all flex items-center justify-center gap-2 cursor-pointer"
                    >
                      <CreditCard className="w-4 h-4" />
                      <span>Checkout Perpetual License</span>
                    </button>
                    
                    <button
                      onClick={() => {
                        alert(`Requesting formal enterprise proposal for ${plan.title} (${plan.price}). Our executive legal engineering team will reach out immediately.`);
                      }}
                      className="w-full py-2.5 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xl text-xs font-bold transition-all cursor-pointer flex items-center justify-center gap-1.5"
                    >
                      <FileText className="w-3.5 h-3.5" />
                      <span>Request Executive Proposal</span>
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* --- VIEW: Industry Verticals & CaaS Add-Ons --- */}
        {pricingMode === 'verticals' && (
          <div className="space-y-8 max-w-7xl mx-auto">
            <div className="text-center max-w-2xl mx-auto">
              <span className="px-3 py-1 bg-indigo-50 text-indigo-700 border border-indigo-200 rounded-full text-[11px] font-bold uppercase tracking-wider">
                Specialized Regulatory Modules
              </span>
              <h4 className="text-2xl sm:text-3xl font-black text-slate-900 mt-2 mb-2">
                All Industry Add-On Pricing
              </h4>
              <p className="text-xs sm:text-sm text-slate-600 leading-relaxed">
                Modular compliance extensions tailored for high-stakes industries, sovereign data boundaries, children protection, and zero-knowledge regulator channels.
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {verticalAddons.map((item) => (
                <div
                  key={item.id}
                  className="bg-white p-7 rounded-[2.5rem] border border-slate-200 shadow-sm flex flex-col justify-between hover:border-indigo-300 transition-all hover:shadow-md"
                >
                  <div>
                    <div className="flex items-center justify-between mb-3">
                      <span className="px-2.5 py-1 bg-slate-100 text-slate-800 text-[10px] font-bold uppercase tracking-wider rounded-md border border-slate-200">
                        {item.badge}
                      </span>
                      <div className="text-right">
                        <span className="text-2xl font-black text-indigo-600 font-mono">
                          {item.price}
                        </span>
                        <span className="text-xs text-slate-500 font-medium block">{item.unit}</span>
                      </div>
                    </div>

                    <h4 className="text-lg font-black text-slate-900 mb-2">{item.title}</h4>
                    <p className="text-xs text-slate-600 leading-relaxed mb-6">{item.description}</p>

                    <div className="space-y-2.5 mb-8">
                      {item.features.map((feat, fIdx) => (
                        <div key={fIdx} className="flex items-start gap-2.5 text-xs text-slate-700">
                          <Check className="w-3.5 h-3.5 text-indigo-600 shrink-0 mt-0.5" />
                          <span>{feat}</span>
                        </div>
                      ))}
                    </div>
                  </div>

                  <div className="space-y-2">
                    <button
                      onClick={() => {
                        setCheckoutItem({
                          id: item.id,
                          name: item.title,
                          type: 'ADDON',
                          priceEur: item.numericPriceEur,
                          period: isYearly ? 'year' : 'month',
                          description: item.description,
                          features: item.features,
                          category: 'Industry Add-On'
                        });
                        setIsCheckoutOpen(true);
                      }}
                      className="w-full py-3 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl text-xs font-bold transition-all shadow-md cursor-pointer flex items-center justify-center gap-2"
                    >
                      <CreditCard className="w-3.5 h-3.5" />
                      <span>Purchase Add-On ({item.price})</span>
                    </button>

                    <button
                      onClick={() => {
                        if (!selectedAddons.includes(item.id)) {
                          setSelectedAddons([...selectedAddons, item.id]);
                        }
                        setPricingMode('curator');
                      }}
                      className="w-full py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xl text-xs font-bold transition-all cursor-pointer text-center"
                    >
                      Add to Curated Plan Builder
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

      </div>

      {/* --- STRIPE CHECKOUT MODAL --- */}
      <StripeCheckoutModal
        isOpen={isCheckoutOpen}
        onClose={() => setIsCheckoutOpen(false)}
        item={checkoutItem}
      />

      {/* --- CURATED QUOTE CONFIRMATION MODAL --- */}
      <AnimatePresence>
        {showQuoteModal && curatedQuote && (
          <div className="fixed inset-0 z-[9999] bg-slate-950/80 backdrop-blur-sm flex items-center justify-center p-4">
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="bg-white text-slate-900 max-w-xl w-full p-8 rounded-3xl shadow-2xl border border-slate-200 relative overflow-hidden"
            >
              <div className="flex items-center justify-between border-b border-slate-100 pb-4 mb-6">
                <div className="flex items-center gap-3">
                  <div className="p-2.5 bg-emerald-50 text-emerald-600 rounded-xl border border-emerald-200">
                    <ShieldCheck className="w-6 h-6" />
                  </div>
                  <div>
                    <h4 className="text-lg font-black text-slate-900">Curated Plan Quote Generated</h4>
                    <span className="text-xs font-mono text-indigo-600 font-bold">{curatedQuote.quoteId}</span>
                  </div>
                </div>
                <button
                  onClick={() => setShowQuoteModal(false)}
                  className="text-slate-400 hover:text-slate-600 text-sm font-bold cursor-pointer"
                >
                  ✕
                </button>
              </div>

              <div className="space-y-4 text-xs">
                <div className="p-4 bg-slate-50 rounded-2xl border border-slate-100 space-y-2">
                  <div className="flex justify-between">
                    <span className="text-slate-500 font-semibold">Organization:</span>
                    <span className="font-bold text-slate-900">{curatedQuote.companyName}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-slate-500 font-semibold">Contact Email:</span>
                    <span className="font-mono text-slate-900">{curatedQuote.contactEmail || 'Not specified'}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-slate-500 font-semibold">Monitored Assets & Seats:</span>
                    <span className="font-mono text-slate-900">{curatedQuote.configuration.nodes} Nodes / {curatedQuote.configuration.seats} Seats</span>
                  </div>
                </div>

                <div className="p-4 bg-slate-900 text-white rounded-2xl space-y-2">
                  <div className="flex justify-between text-slate-400">
                    <span>Monthly Baseline + Add-Ons:</span>
                    <span className="font-mono text-slate-200">€{curatedQuote.breakdown.subtotalMonthly}/mo</span>
                  </div>
                  <div className="flex justify-between text-emerald-400 font-bold">
                    <span>Final Calculated Rate:</span>
                    <span className="font-mono text-lg text-emerald-300">€{curatedQuote.breakdown.finalMonthlyPrice}/month</span>
                  </div>
                  <div className="text-[10px] text-slate-400 text-right">
                    Annual Commitment: €{curatedQuote.breakdown.totalAnnualCommitment}/year
                  </div>
                </div>
              </div>

              <div className="mt-8 flex items-center justify-end gap-3">
                <button
                  onClick={() => setShowQuoteModal(false)}
                  className="px-5 py-2.5 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xl text-xs font-bold transition-all cursor-pointer"
                >
                  Close
                </button>
                <button
                  onClick={() => {
                    alert(`Official quote ${curatedQuote.quoteId} locked in! Our CaaS account team will reach out to ${curatedQuote.contactEmail || 'you'} within 2 hours.`);
                    setShowQuoteModal(false);
                  }}
                  className="px-6 py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl text-xs font-bold shadow-lg transition-all flex items-center gap-2 cursor-pointer"
                >
                  <CheckCircle2 className="w-4 h-4" />
                  <span>Lock In Quote & Proceed</span>
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

    </section>
  );
};
