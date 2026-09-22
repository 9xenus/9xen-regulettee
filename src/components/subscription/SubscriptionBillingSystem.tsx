import React, { useState } from 'react';
import { 
  CreditCard, 
  CheckCircle2, 
  Zap, 
  ShieldCheck, 
  Scale, 
  Building2, 
  UserCheck, 
  Download, 
  Plus, 
  Minus, 
  DollarSign, 
  Settings, 
  Layers, 
  Lock, 
  FileText, 
  Calendar, 
  ChevronRight, 
  Sparkles, 
  AlertTriangle, 
  RefreshCw, 
  Sliders, 
  Check, 
  XCircle, 
  Copy, 
  ArrowRight,
  ShieldAlert,
  Users,
  Award,
  HelpCircle,
  Clock
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';

interface SubscriptionBillingSystemProps {
  locale: 'bn' | 'en';
  showToast: (message: string, type?: 'success' | 'warning' | 'info' | 'error') => void;
}

export type ActorRole = 'CLIENT' | 'LAWYER' | 'REGULATOR';
export type Currency = 'USD' | 'USD';
export type BillingCycle = 'MONTHLY' | 'ANNUAL';

export interface PlanTier {
  id: string;
  role: ActorRole;
  nameEn: string;
  nameBn: string;
  badgeEn: string;
  badgeBn: string;
  priceMonthlyBdt: number;
  priceMonthlyUsd: number;
  popular?: boolean;
  recommendedRoleEn: string;
  recommendedRoleBn: string;
  featuresEn: string[];
  featuresBn: string[];
  seatAllowance: number;
  maxEvidenceExportsMonth: number;
  slaHours: number;
  colorTheme: 'emerald' | 'indigo' | 'purple' | 'amber' | 'rose';
}

export interface LayerAddon {
  id: string;
  nameEn: string;
  nameBn: string;
  descEn: string;
  descBn: string;
  monthlyBdt: number;
  monthlyUsd: number;
  forRoles: ActorRole[];
  icon: string;
}

export interface BillingInvoice {
  id: string;
  invoiceNo: string;
  date: string;
  actorRole: ActorRole;
  planName: string;
  amountBdt: number;
  amountUsd: number;
  vatBdt: number;
  status: 'PAID' | 'PROCESSING' | 'PENDING';
  paymentMethod: string;
  pdfUrl?: string;
}

export const SubscriptionBillingSystem: React.FC<SubscriptionBillingSystemProps> = ({
  locale,
  showToast,
}) => {
  // Primary State Controls
  const [selectedRole, setSelectedRole] = useState<ActorRole>('CLIENT');
  const [currency, setCurrency] = useState<Currency>('USD');
  const [billingCycle, setBillingCycle] = useState<BillingCycle>('MONTHLY');
  const [activePlanId, setActivePlanId] = useState<string>('client_family');
  const [selectedAddons, setSelectedAddons] = useState<string[]>(['addon_zk_affidavit']);
  
  // Custom Seat Slider State
  const [lawyerSeats, setLawyerSeats] = useState<number>(5);
  const [inspectorSeats, setInspectorSeats] = useState<number>(10);

  // Billing History & Payment Methods
  const [paymentMethod, setPaymentMethod] = useState<'Global Mobile Wallet' | 'Digital Wallet' | 'CARD' | 'BANK_RTGS'>('Global Mobile Wallet');
  const [isAutoRenew, setIsAutoRenew] = useState<boolean>(true);
  const [showAddPaymentModal, setShowAddPaymentModal] = useState<boolean>(false);
  const [showInvoiceModal, setShowInvoiceModal] = useState<BillingInvoice | null>(null);

  // Sample Billing Invoices History
  const [invoices, setInvoices] = useState<BillingInvoice[]>([
    {
      id: 'INV-2026-0891',
      invoiceNo: 'TC-NBR-2026-8819',
      date: '2026-09-01',
      actorRole: 'LAWYER',
      planName: 'Law Firm Chamber Pro',
      amountBdt: 14999,
      amountUsd: 149.99,
      vatBdt: 2250,
      status: 'PAID',
      paymentMethod: 'Global Mobile Wallet Corporate Auto-Pay',
    },
    {
      id: 'INV-2026-0712',
      invoiceNo: 'TC-NBR-2026-7210',
      date: '2026-08-01',
      actorRole: 'LAWYER',
      planName: 'Law Firm Chamber Pro',
      amountBdt: 14999,
      amountUsd: 149.99,
      vatBdt: 2250,
      status: 'PAID',
      paymentMethod: 'Global Mobile Wallet Corporate Auto-Pay',
    },
    {
      id: 'INV-2026-0544',
      invoiceNo: 'TC-NBR-2026-5129',
      date: '2026-07-01',
      actorRole: 'CLIENT',
      planName: 'Family Defense Plus',
      amountBdt: 299,
      amountUsd: 2.99,
      vatBdt: 45,
      status: 'PAID',
      paymentMethod: 'Digital Wallet Gateway Direct',
    },
  ]);

  // Defined Plans Database for All 3 Layers
  const plansDatabase: PlanTier[] = [
    // CLIENT LAYER
    {
      id: 'client_free',
      role: 'CLIENT',
      nameEn: 'Citizen Shield (Free)',
      nameBn: 'নাগরিক প্রটেকশন (ফ্রি)',
      badgeEn: 'Basic Citizen Access',
      badgeBn: 'সাধারণ ব্যবহারকারী',
      priceMonthlyBdt: 0,
      priceMonthlyUsd: 0,
      recommendedRoleEn: 'Individual Citizens & Students',
      recommendedRoleBn: 'সাধারণ সাধারণ নাগরিক ও শিক্ষার্থী',
      featuresEn: [
        '10 Real-time Trust Checks / Month',
        'Community Scam Alerts Access',
        'Basic Scam School Lessons & Badges',
        '60-Second Grievance Reporting',
        'Standard Community Verdict Engine'
      ],
      featuresBn: [
        'মাসে ১০টি রিয়েল-টাইম ট্রাস্ট চেক',
        'কমিউনিটি স্ক্যাম সতর্কবার্তা অ্যাক্সেস',
        'স্ক্যাম স্কুলের প্রাথমিক লেসন ও ব্যাজ',
        '৬০-সেকেন্ডে ডিজিটাল অভিযোগ জমা',
        'সাধারণ ট্রাস্ট ভার্ডিক্ট ইঞ্জিন'
      ],
      seatAllowance: 1,
      maxEvidenceExportsMonth: 2,
      slaHours: 48,
      colorTheme: 'emerald'
    },
    {
      id: 'client_family',
      role: 'CLIENT',
      nameEn: 'Family Defense Plus',
      nameBn: 'ফ্যামিলি ডিফেন্স প্লাস',
      badgeEn: 'Most Popular for Families',
      badgeBn: 'পরিবারের জন্য জনপ্রিয়',
      priceMonthlyBdt: 299,
      priceMonthlyUsd: 2.99,
      popular: true,
      recommendedRoleEn: 'Families, Seniors & Households',
      recommendedRoleBn: 'পরিবার ও প্রবীণ নাগরিকদের জন্য',
      featuresEn: [
        '100 Trust Checks / Month across 5 Household Phones',
        'Automatic MFS Phishing Call & SMS Interceptor',
        'Encrypted Evidence Vault (5GB Storage)',
        'Priority Dispute Resolution Ticket Escalation',
        'Personalized Family Risk Score Dashboard'
      ],
      featuresBn: [
        '৫টি ফোনের জন্য মাসে ১০০টি ট্রাস্ট চেক',
        'অটোমেটিক বিকাশ/নগদ ফিশিং কল ও এসএমএস ইন্টারসেপ্টর',
        'এনক্রিপ্টেড এভিডেন্স ভল্ট (৫ জিবি স্টোরেজ)',
        'অগ্রাধিকার ভিত্তিতে অভিযোগ নিরসন ট্র্যাকিং',
        'ব্যক্তিগত ফ্যামিলি রিস্ক স্কোর ড্যাশবোর্ড'
      ],
      seatAllowance: 5,
      maxEvidenceExportsMonth: 15,
      slaHours: 24,
      colorTheme: 'indigo'
    },
    {
      id: 'client_sme',
      role: 'CLIENT',
      nameEn: 'SME Merchant Shield',
      nameBn: 'এসএমই মার্চেন্ট শিল্ড',
      badgeEn: 'E-commerce & Business',
      badgeBn: 'ই-কমার্স ও মার্চেন্ট',
      priceMonthlyBdt: 1499,
      priceMonthlyUsd: 14.99,
      recommendedRoleEn: 'F-Commerce & Retail Merchants',
      recommendedRoleBn: 'অনলাইন শপ ও ফেস বুক মার্চেন্ট',
      featuresEn: [
        'Unlimited Buyer & Vendor Verification Checks',
        'Official Cryptographic Trust Badge ID with QR',
        'Fake Cash-on-Delivery (COD) Order Risk Shield',
        'Direct Merchant Fraud Dispute Appeals',
        'Dedicated Merchant Support Liaison'
      ],
      featuresBn: [
        'আনলিমিটেড ক্রেতা ও ভেন্ডর যাচাইকরণ',
        'অফিসিয়াল ক্রিপ্টোগ্রাফিক ট্রাস্ট ব্যাজ আইডি ও কিউআর',
        'ফেক ক্যাশ-অন-ডেলিভারি (COD) অর্ডার প্রতিরোধ',
        'মার্চেন্ট প্রতারণা আপিল সরাসরি জমা',
        'ডেডিকেটেড মার্চেন্ট সাপোর্ট লাইজন'
      ],
      seatAllowance: 10,
      maxEvidenceExportsMonth: 50,
      slaHours: 12,
      colorTheme: 'purple'
    },

    // LAWYER LAYER
    {
      id: 'lawyer_solo',
      role: 'LAWYER',
      nameEn: 'Advocate Counsel Solo',
      nameBn: 'অ্যাডভোকেট একক প্র্যাকটিস',
      badgeEn: 'Legal Practitioner Tier',
      badgeBn: 'একক আইনজীবীদের জন্য',
      priceMonthlyBdt: 4999,
      priceMonthlyUsd: 49.99,
      recommendedRoleEn: 'High Court & District Advocates',
      recommendedRoleBn: 'জেলা ও হাইকোর্ট জজশিপ আইনজীবী',
      featuresEn: [
        '20 Certified Court Evidence Exports / Month',
        'Cryptographic ZK Affidavit Signing & Timestamping',
        'DNCRP & Telecom Regulatory Authority Fraud Incident Database Lookup',
        'Client Litigation Case Tracking Portal',
        'Official Cyber Crime Evidence Dossier Builder'
      ],
      featuresBn: [
        'মাসে ২০টি সার্টিফাইড কোর্ট এভিডেন্স এক্সপোর্ট',
        'ক্রিপ্টোগ্রাফিক ZK হলফনামা ও টাইমস্ট্যাম্পিং',
        'ভোক্তা অধিকার ও বিটিআরসি মামলা ডেটাবেস অনুসন্ধান',
        'ক্লায়েন্ট ডিজিটাল লিটিগেশন ট্র্যাকিং পোর্টাল',
        'অফিসিয়াল সাইবার ক্রাইম প্রমাণপত্র ডসিয়ার বিল্ডার'
      ],
      seatAllowance: 1,
      maxEvidenceExportsMonth: 20,
      slaHours: 8,
      colorTheme: 'purple'
    },
    {
      id: 'lawyer_firm',
      role: 'LAWYER',
      nameEn: 'Law Firm Chamber Pro',
      nameBn: "ল' ফার্ম চেম্বার প্রো",
      badgeEn: 'Recommended Law Chambers',
      badgeBn: 'চেম্বারের জন্য সেরা পছন্দ',
      priceMonthlyBdt: 14999,
      priceMonthlyUsd: 149.99,
      popular: true,
      recommendedRoleEn: 'Medium-Large Legal Practice Chambers',
      recommendedRoleBn: 'মাঝারি ও বড় আইনি চেম্বার',
      featuresEn: [
        '5 Lawyer Seats included (Expandable)',
        'Unlimited Certified Court Evidence Exports',
        'Direct CID & PBI Digital Forensic Report Sync',
        'Courtroom Representation Client Marketplace',
        'Multi-Lawyer Shared Case Vault & Audit Ledger'
      ],
      featuresBn: [
        '৫ জন আইনজীবীর সিট অন্তর্ভুক্ত (সম্প্রসারণযোগ্য)',
        'আনলিমিটেড সার্টিফাইড কোর্ট এভিডেন্স এক্সপোর্ট',
        'সিআইডি ও পিবিআই ডিজিটাল ফরেনসিক রিপোর্ট সিঙ্ক',
        'কোর্টরুম রিপ্রেজেন্টেশন ক্লায়েন্ট মার্কেটপ্লেস',
        'মাল্টি-আইনজীবী শেয়ার্ড কেস ভল্ট ও অডিট লেজার'
      ],
      seatAllowance: 5,
      maxEvidenceExportsMonth: 9999,
      slaHours: 4,
      colorTheme: 'indigo'
    },
    {
      id: 'lawyer_bar',
      role: 'LAWYER',
      nameEn: 'Bar Association Corporate',
      nameBn: 'বার অ্যাসোসিয়েশন কর্পোরেট',
      badgeEn: 'Enterprise Legal Suite',
      badgeBn: 'বৃহৎ কর্পোরেট বার ইউনিট',
      priceMonthlyBdt: 39999,
      priceMonthlyUsd: 399.99,
      recommendedRoleEn: 'Bar Associations & Legal Corporations',
      recommendedRoleBn: 'বার অ্যাসোসিয়েশন ও কর্পোরেট লিগ্যাল সেল',
      featuresEn: [
        '25 Advocate Seats included + Dedicated SLA',
        'Direct API Access for Automated Case Filing',
        'Supreme Court & High Court Division Legal Prep AI',
        'Bulk Client Fraud Incident Bulk Discovery',
        'White-Labeled Legal Verification Badges'
      ],
      featuresBn: [
        '২৫ জন আইনজীবীর সিট + ডেডিকেটেড SLA',
        'অটোমেটেড কেস ফাইলিংয়ের জন্য সরাসরি API অ্যাক্সেস',
        'সুপ্রিম কোর্ট ও হাইকোর্ট লিগ্যাল প্রেপ AI সহকারী',
        'একসাথে একাধিক ক্লায়েন্ট ফ্রড বাল্ক অনুসন্ধানে সুবিধা',
        'হোয়াইট-লেবেলযুক্ত লিগ্যাল ভেরিফিকেশন ব্যাজ'
      ],
      seatAllowance: 25,
      maxEvidenceExportsMonth: 99999,
      slaHours: 1,
      colorTheme: 'amber'
    },

    // REGULATOR COMMISSION LAYER
    {
      id: 'regulator_district',
      role: 'REGULATOR',
      nameEn: 'District Inspector Seat',
      nameBn: 'জেলা পরিদর্শক কমান্ড',
      badgeEn: 'Enforcement Field Unit',
      badgeBn: 'ফিল্ড এনফোর্সমেন্ট ইউনিট',
      priceMonthlyBdt: 25000,
      priceMonthlyUsd: 250.00,
      recommendedRoleEn: 'District DNCRP & Telecom Regulatory Authority Inspectors',
      recommendedRoleBn: 'জেলা ভোক্তা অধিকার ও বিটিআরসি পরিদর্শক',
      featuresEn: [
        '5 Inspector Seats for District Field Operations',
        'Geo-fenced Real-Time Fraud Spike Heatmap Radar',
        'Instant MFS Emergency Account Suspension Trigger',
        'Citizen Grievance Docket Automated Assignment',
        'Mobile Field Inspector Digital Inspection App'
      ],
      featuresBn: [
        'জেলা ফিল্ড অপারেশনের জন্য ৫টি ইন্সপেক্টর সিট',
        'জিও-ফেন্সড রিয়েল-টাইম ফ্রড স্পাইক হিটম্যাপ রাডার',
        'ইনস্ট্যান্ট বিকাশ/নগদ অ্যাকাউন্ট স্থগিতের সরাসরি রিকোয়েস্ট',
        'নাগরিক ডকেট স্বয়ংক্রিয় অ্যাসাইনমেন্ট ব্যবস্থা',
        'মোবাইল ফিল্ড ইন্সপেক্টর ডিজিটাল ইন্সপেকশন অ্যাপ'
      ],
      seatAllowance: 5,
      maxEvidenceExportsMonth: 1000,
      slaHours: 2,
      colorTheme: 'indigo'
    },
    {
      id: 'regulator_commission',
      role: 'REGULATOR',
      nameEn: 'National Enforcement Division',
      nameBn: 'জাতীয় প্রয়োগকারী কমিশন বিভাগ',
      badgeEn: 'Sovereign Regulatory Apex',
      badgeBn: 'জাতীয় নিয়ন্ত্রক কমিশন',
      priceMonthlyBdt: 95000,
      priceMonthlyUsd: 950.00,
      popular: true,
      recommendedRoleEn: 'Telecom Regulatory Authority, BFIU, CID & Central Regulators',
      recommendedRoleBn: 'বিটিআরসি, বিএফআইইউ, সিআইডি ও কেন্দ্রীয় নিয়ন্ত্রক',
      featuresEn: [
        '25 Officer & Analyst Commission Seats',
        'Direct MFS API Takedown & Fund Freeze Directives',
        'Telecommunication IMSI & SIM Suspension Gateway',
        'Cross-Agency Fraud Syndicate Graph Intelligence',
        'Automated Executive Telecom Regulatory Authority/BFIU Audit Reporting'
      ],
      featuresBn: [
        '২৫ জন অফিসার ও অ্যানালিস্ট কমিশন সিট',
        'সরাসরি MFS অ্যাকাউন্ট তহবিল স্থগিতকরণ নির্দেশিকা',
        'টেলিকমিউনিকেশন IMSI ও সিম ব্লকিং গেটওয়ে',
        'ক্রস-এজেন্সি ফ্রড সিন্ডিকেট গ্রাফ ইন্টেলিজেন্স',
        'স্বয়ংক্রিয় এক্সিকিউটিভ বিটিআরসি/বিএফআইইউ অডিট রিপোর্টিং'
      ],
      seatAllowance: 25,
      maxEvidenceExportsMonth: 50000,
      slaHours: 0.5,
      colorTheme: 'rose'
    },
    {
      id: 'regulator_sovereign',
      role: 'REGULATOR',
      nameEn: 'Sovereign RegTech Apex',
      nameBn: 'সারভৌম রেগটেক অ্যাপেক্স কমান্ড',
      badgeEn: 'Ministry & Sovereign Command',
      badgeBn: 'মন্ত্রণালয় ও জাতীয় রেগটেক',
      priceMonthlyBdt: 250000,
      priceMonthlyUsd: 2500.00,
      recommendedRoleEn: 'Ministry of Telecom, ICT & Global Region Bank',
      recommendedRoleBn: 'ডাক ও টেলিযোগাযোগ মন্ত্রণালয়, তথ্যপ্রযুক্তি বিভাগ ও বাংলাদেশ ব্যাংক',
      featuresEn: [
        'Unlimited Agency Seats & Multi-Ministry Nodes',
        'Full RegTech Engine API Interoperability',
        'Real-time AML / TBML Transaction Surveillance Sync',
        'Quantum-Safe Sovereign Ledger Audit Trail',
        '24/7 Dedicated Cyber Security Operations Center (SOC)'
      ],
      featuresBn: [
        'আনলিমিটেড এজেন্সি সিট ও বহু-মন্ত্রণালয় নোড',
        'সম্পূর্ণ রেগটেক ইঞ্জিন API আন্তঃক্রিয়াশীলতা',
        'রিয়েল-টাইম মানি লন্ডারিং পর্যবেক্ষণ সিঙ্ক',
        'কোয়ান্টাম-সেফ সার্বভৌম লেজার অডিট ট্রেইল',
        '২৪/৭ ডেডিকেটেড সাইবার সিকিউরিটি অপারেশন্স সেন্টার (SOC)'
      ],
      seatAllowance: 999,
      maxEvidenceExportsMonth: 999999,
      slaHours: 0.25,
      colorTheme: 'purple'
    }
  ];

  // Available Addons for Customization
  const layerAddonsDatabase: LayerAddon[] = [
    {
      id: 'addon_mfs_freeze',
      nameEn: 'Real-Time MFS Immediate Freeze Directives API',
      nameBn: 'রিয়েল-টাইম এমএফএস তহবিল ফ্রিজ নির্দেশিকা API',
      descEn: 'Connect direct webhooks with Global Mobile Wallet, Digital Wallet, and MFS Wallet to halt money flow during active scam reports.',
      descBn: 'সক্রিয় প্রতারণা রিপোর্টের সময় টাকা লেনদেন থামাতে বিকাশ, নগদ ও রকেটের সাথে সরাসরি ওয়েবহুক সংযোগ।',
      monthlyBdt: 2500,
      monthlyUsd: 25.00,
      forRoles: ['LAWYER', 'REGULATOR'],
      icon: 'Zap'
    },
    {
      id: 'addon_zk_affidavit',
      nameEn: 'Cryptographic ZK Affidavit & Evidence Signer',
      nameBn: 'ক্রিপ্টোগ্রাফিক ZK হলফনামা ও কোর্ট এভিডেন্স সাইনার',
      descEn: 'Stamp digital evidence with zero-knowledge cryptographic validity accepted in District & High Courts.',
      descBn: 'আদালতে গ্রহণযোগ্য জিরো-নলেজ ক্রিপ্টোগ্রাফিক সীল ও টাইমস্ট্যাম্প যুক্ত কোর্ট এভিডেন্স প্রস্তুতকরণ।',
      monthlyBdt: 1200,
      monthlyUsd: 12.00,
      forRoles: ['CLIENT', 'LAWYER', 'REGULATOR'],
      icon: 'Lock'
    },
    {
      id: 'addon_ai_legal_brief',
      nameEn: 'AI Legal Brief & Affidavit Drafter Assistant',
      nameBn: 'AI লিগ্যাল ব্রিফ ও হলফনামা খসড়া সহকারী',
      descEn: 'Automatically generate Global Region Penal Code & Cyber Security Act complaints from victim voice notes.',
      descBn: 'ভিকটিমের ভয়েস ও মেসেজ থেকে দণ্ডবিধি ও সাইবার নিরাপত্তা আইনের অভিযোগপত্রের ড্রাফট তৈরি।',
      monthlyBdt: 1800,
      monthlyUsd: 18.00,
      forRoles: ['LAWYER'],
      icon: 'Sparkles'
    },
    {
      id: 'addon_geo_radar',
      nameEn: 'Cell Tower Triangulation & Geo-fenced Threat Radar',
      nameBn: 'সেল টাওয়ার ট্রায়াঙ্গুলেশন ও জিও-ফেন্সড থ্রেট রাডার',
      descEn: 'Map exact tower clusters associated with active scam caller networks across Global Region.',
      descBn: 'বাংলাদেশের বিভিন্ন প্রান্তে সক্রিয় স্ক্যামার নেটওয়ার্কের টাওয়ার লোকেশন ম্যাপ ও ক্লাস্টার ট্র্যাকিং।',
      monthlyBdt: 8500,
      monthlyUsd: 85.00,
      forRoles: ['REGULATOR'],
      icon: 'ShieldAlert'
    }
  ];

  // Filter plans for selected role
  const currentRolePlans = plansDatabase.filter(p => p.role === selectedRole);
  const activePlan = plansDatabase.find(p => p.id === activePlanId) || currentRolePlans[0];

  // Calculate pricing breakdown
  const calculateTotal = () => {
    let basePrice = currency === 'USD' ? activePlan.priceMonthlyBdt : activePlan.priceMonthlyUsd;
    if (billingCycle === 'ANNUAL') {
      basePrice = basePrice * 12 * 0.8; // 20% discount on annual
    }

    // Add seats extra calculation
    let extraSeatCost = 0;
    if (selectedRole === 'LAWYER' && lawyerSeats > activePlan.seatAllowance) {
      const extraCount = lawyerSeats - activePlan.seatAllowance;
      const seatPrice = currency === 'USD' ? 800 : 8;
      extraSeatCost = extraCount * seatPrice * (billingCycle === 'ANNUAL' ? 12 * 0.8 : 1);
    } else if (selectedRole === 'REGULATOR' && inspectorSeats > activePlan.seatAllowance) {
      const extraCount = inspectorSeats - activePlan.seatAllowance;
      const seatPrice = currency === 'USD' ? 3500 : 35;
      extraSeatCost = extraCount * seatPrice * (billingCycle === 'ANNUAL' ? 12 * 0.8 : 1);
    }

    // Addons cost
    let addonsCost = 0;
    selectedAddons.forEach(addonId => {
      const addon = layerAddonsDatabase.find(a => a.id === addonId);
      if (addon) {
        const cost = currency === 'USD' ? addon.monthlyBdt : addon.monthlyUsd;
        addonsCost += cost * (billingCycle === 'ANNUAL' ? 12 * 0.8 : 1);
      }
    });

    const subtotal = basePrice + extraSeatCost + addonsCost;
    const vat = subtotal * 0.15; // 15% NBR VAT
    const grandTotal = subtotal + vat;

    return { subtotal, vat, grandTotal };
  };

  const { subtotal, vat, grandTotal } = calculateTotal();

  const handleToggleAddon = (addonId: string) => {
    if (selectedAddons.includes(addonId)) {
      setSelectedAddons(prev => prev.filter(id => id !== addonId));
      showToast(locale === 'bn' ? 'অ্যাড-অন সরিয়ে নেওয়া হয়েছে।' : 'Addon removed.', 'info');
    } else {
      setSelectedAddons(prev => [...prev, addonId]);
      showToast(locale === 'bn' ? 'নতুন অ্যাড-অন যুক্ত হয়েছে!' : 'New addon added!', 'success');
    }
  };

  const handleUpgradePlan = (plan: PlanTier) => {
    setActivePlanId(plan.id);
    showToast(
      locale === 'bn'
        ? `🎉 সফলভাবে '${plan.nameBn}' প্ল্যানে পরিবর্তন করা হয়েছে!`
        : `🎉 Switched subscription to '${plan.nameEn}'!`,
      'success'
    );
  };

  const handleSavePaymentMethod = () => {
    setShowAddPaymentModal(false);
    showToast(
      locale === 'bn'
        ? '💳 নতুন পেমেন্ট মেথড কনফিগার করা হয়েছে!'
        : '💳 Payment method updated successfully!',
      'success'
    );
  };

  return (
    <div className="space-y-6">
      
      {/* HEADER HERO BANNER & ROLE SWITCHER */}
      <div className="relative overflow-hidden rounded-3xl bg-slate-900 text-white p-6 sm:p-8 border border-slate-800 shadow-2xl">
        <div className="absolute top-0 right-0 w-96 h-96 bg-indigo-500/10 rounded-full blur-3xl pointer-events-none"></div>
        <div className="absolute bottom-0 left-0 w-80 h-80 bg-emerald-500/10 rounded-full blur-3xl pointer-events-none"></div>

        <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div className="space-y-2">
            <div className="inline-flex items-center space-x-2 px-3 py-1 rounded-full bg-indigo-500/20 border border-indigo-500/40 text-indigo-300 text-xs font-mono font-bold">
              <Layers className="w-3.5 h-3.5" />
              <span>{locale === 'bn' ? 'মাল্টি-লেয়ার সাবস্ক্রিপশন ও বিলিং' : 'Multi-Layer Subscription & Billing Core'}</span>
            </div>
            <h2 className="text-2xl sm:text-3xl font-black text-white tracking-tight">
              {locale === 'bn' ? 'সাবস্ক্রিপশন ও বিলিং সিস্টেম' : 'RegTech Subscription & Billing Engine'}
            </h2>
            <p className="text-xs sm:text-sm text-slate-300 max-w-xl leading-relaxed">
              {locale === 'bn'
                ? 'নাগরিক, আইনজীবী এবং নিয়ন্ত্রক কমিশনের জন্য উপযোগী মাল্টি-লেয়ার প্ল্যান বেছে নিন। রিয়েল-টাইম বিলিং, ট্যাক্স ইনভয়েস এবং অ্যাড-অন সিট কনফিগার করুন।'
                : 'Configure tailored tier layers for Citizens, Legal Advocates, and Regulatory Commissions. Manage live billing, NBR compliant tax invoices, and seats.'}
            </p>
          </div>

          {/* Currency & Billing Cycle Toggles */}
          <div className="flex flex-wrap items-center gap-3 shrink-0">
            {/* Currency Switcher */}
            <div className="bg-slate-800/90 p-1 rounded-2xl border border-slate-700 flex items-center space-x-1">
              <button
                type="button"
                onClick={() => setCurrency('USD')}
                className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                  currency === 'USD'
                    ? 'bg-emerald-600 text-white shadow-md'
                    : 'text-slate-400 hover:text-white'
                }`}
              >
                ৳ USD
              </button>
              <button
                type="button"
                onClick={() => setCurrency('USD')}
                className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                  currency === 'USD'
                    ? 'bg-indigo-600 text-white shadow-md'
                    : 'text-slate-400 hover:text-white'
                }`}
              >
                $ USD
              </button>
            </div>

            {/* Billing Cycle Switcher */}
            <div className="bg-slate-800/90 p-1 rounded-2xl border border-slate-700 flex items-center space-x-1">
              <button
                type="button"
                onClick={() => setBillingCycle('MONTHLY')}
                className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                  billingCycle === 'MONTHLY'
                    ? 'bg-purple-600 text-white shadow-md'
                    : 'text-slate-400 hover:text-white'
                }`}
              >
                {locale === 'bn' ? 'মাসিক' : 'Monthly'}
              </button>
              <button
                type="button"
                onClick={() => setBillingCycle('ANNUAL')}
                className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer relative ${
                  billingCycle === 'ANNUAL'
                    ? 'bg-emerald-600 text-white shadow-md'
                    : 'text-slate-400 hover:text-white'
                }`}
              >
                <span>{locale === 'bn' ? 'বার্ষিক (-২০%)' : 'Annual (-20%)'}</span>
              </button>
            </div>
          </div>
        </div>

        {/* THREE ACTOR ROLES TAB SELECTOR */}
        <div className="grid grid-cols-3 gap-2 sm:gap-3 pt-6 mt-6 border-t border-slate-800">
          
          {/* CLIENT ROLE */}
          <button
            type="button"
            onClick={() => {
              setSelectedRole('CLIENT');
              setActivePlanId('client_family');
            }}
            className={`p-3 sm:p-4 rounded-2xl border transition-all text-left cursor-pointer flex flex-col justify-between ${
              selectedRole === 'CLIENT'
                ? 'bg-emerald-950/80 border-emerald-500 text-white shadow-lg shadow-emerald-500/10'
                : 'bg-slate-800/50 border-slate-700/80 text-slate-400 hover:border-slate-600'
            }`}
          >
            <div className="flex items-center justify-between mb-1">
              <span className="p-2 rounded-xl bg-emerald-500/20 text-emerald-400">
                <Users className="w-4 h-4 sm:w-5 sm:h-5" />
              </span>
              {selectedRole === 'CLIENT' && (
                <span className="w-2 h-2 rounded-full bg-emerald-400 animate-ping"></span>
              )}
            </div>
            <div>
              <span className="text-[10px] font-mono uppercase tracking-wider text-emerald-400 block font-bold">
                {locale === 'bn' ? 'প্রথম লেয়ার' : 'Layer 1: Individual'}
              </span>
              <h3 className="text-xs sm:text-sm font-bold text-white">
                {locale === 'bn' ? '📱 ক্লায়েন্ট ও নাগরিক' : '📱 Citizen & SME'}
              </h3>
            </div>
          </button>

          {/* LAWYER ROLE */}
          <button
            type="button"
            onClick={() => {
              setSelectedRole('LAWYER');
              setActivePlanId('lawyer_firm');
            }}
            className={`p-3 sm:p-4 rounded-2xl border transition-all text-left cursor-pointer flex flex-col justify-between ${
              selectedRole === 'LAWYER'
                ? 'bg-indigo-950/80 border-indigo-500 text-white shadow-lg shadow-indigo-500/10'
                : 'bg-slate-800/50 border-slate-700/80 text-slate-400 hover:border-slate-600'
            }`}
          >
            <div className="flex items-center justify-between mb-1">
              <span className="p-2 rounded-xl bg-indigo-500/20 text-indigo-400">
                <Scale className="w-4 h-4 sm:w-5 sm:h-5" />
              </span>
              {selectedRole === 'LAWYER' && (
                <span className="w-2 h-2 rounded-full bg-indigo-400 animate-ping"></span>
              )}
            </div>
            <div>
              <span className="text-[10px] font-mono uppercase tracking-wider text-indigo-400 block font-bold">
                {locale === 'bn' ? 'দ্বিতীয় লেয়ার' : 'Layer 2: Legal Practice'}
              </span>
              <h3 className="text-xs sm:text-sm font-bold text-white">
                {locale === 'bn' ? '⚖️ আইনজীবী ও ল চেম্বার' : '⚖️ Lawyer & Advocates'}
              </h3>
            </div>
          </button>

          {/* REGULATOR ROLE */}
          <button
            type="button"
            onClick={() => {
              setSelectedRole('REGULATOR');
              setActivePlanId('regulator_commission');
            }}
            className={`p-3 sm:p-4 rounded-2xl border transition-all text-left cursor-pointer flex flex-col justify-between ${
              selectedRole === 'REGULATOR'
                ? 'bg-rose-950/80 border-rose-500 text-white shadow-lg shadow-rose-500/10'
                : 'bg-slate-800/50 border-slate-700/80 text-slate-400 hover:border-slate-600'
            }`}
          >
            <div className="flex items-center justify-between mb-1">
              <span className="p-2 rounded-xl bg-rose-500/20 text-rose-400">
                <Building2 className="w-4 h-4 sm:w-5 sm:h-5" />
              </span>
              {selectedRole === 'REGULATOR' && (
                <span className="w-2 h-2 rounded-full bg-rose-400 animate-ping"></span>
              )}
            </div>
            <div>
              <span className="text-[10px] font-mono uppercase tracking-wider text-rose-400 block font-bold">
                {locale === 'bn' ? 'তৃতীয় লেয়ার' : 'Layer 3: Sovereign Control'}
              </span>
              <h3 className="text-xs sm:text-sm font-bold text-white">
                {locale === 'bn' ? '🏛️ নিয়ন্ত্রক কমিশন' : '🏛️ Regulator Commission'}
              </h3>
            </div>
          </button>

        </div>
      </div>

      {/* ACTIVE SUBSCRIPTION OVERVIEW DASHBOARD CARD */}
      <div className="bg-white dark:bg-slate-900 rounded-3xl p-5 sm:p-6 border border-slate-200 dark:border-slate-800 shadow-xs space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-100 dark:border-slate-800 pb-4">
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 rounded-2xl bg-indigo-100 dark:bg-indigo-950 text-indigo-600 dark:text-indigo-400 flex items-center justify-center font-bold">
              <Zap className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center space-x-2">
                <h3 className="text-sm sm:text-base font-black text-slate-900 dark:text-white">
                  {locale === 'bn' ? activePlan.nameBn : activePlan.nameEn}
                </h3>
                <span className="px-2.5 py-0.5 rounded-full text-[10px] font-mono font-bold bg-emerald-100 dark:bg-emerald-950/80 text-emerald-700 dark:text-emerald-400 border border-emerald-300 dark:border-emerald-800 flex items-center gap-1">
                  <CheckCircle2 className="w-3 h-3 text-emerald-500" />
                  <span>{locale === 'bn' ? 'সক্রিয় অ্যাকাউন্ট' : 'ACTIVE SUBSCRIPTION'}</span>
                </span>
              </div>
              <p className="text-xs text-slate-500 dark:text-slate-400">
                {locale === 'bn' ? activePlan.recommendedRoleBn : activePlan.recommendedRoleEn}
              </p>
            </div>
          </div>

          <div className="flex items-center space-x-3">
            <button
              type="button"
              onClick={() => setIsAutoRenew(prev => !prev)}
              className={`px-3 py-1.5 rounded-xl text-xs font-bold border transition-all cursor-pointer flex items-center space-x-1.5 ${
                isAutoRenew
                  ? 'bg-emerald-50 dark:bg-emerald-950/50 border-emerald-300 dark:border-emerald-800 text-emerald-700 dark:text-emerald-300'
                  : 'bg-slate-100 dark:bg-slate-800 border-slate-200 dark:border-slate-700 text-slate-500'
              }`}
            >
              <RefreshCw className={`w-3.5 h-3.5 ${isAutoRenew ? 'animate-spin' : ''}`} />
              <span>
                {isAutoRenew
                  ? (locale === 'bn' ? 'অটো-রিনিউয়াল চালু' : 'Auto-Renew ON')
                  : (locale === 'bn' ? 'অটো-রিনিউয়াল বন্ধ' : 'Auto-Renew OFF')}
              </span>
            </button>
          </div>
        </div>

        {/* METRICS & SEATS USAGE BAR */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 pt-1">
          <div className="p-3.5 rounded-2xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200/80 dark:border-slate-700/80">
            <span className="text-[10px] font-mono font-bold text-slate-400 uppercase block">
              {locale === 'bn' ? 'মাসিক মূল্য' : 'Monthly Cost'}
            </span>
            <span className="text-base sm:text-lg font-black text-slate-900 dark:text-white">
              {currency === 'USD' ? `৳${activePlan.priceMonthlyBdt.toLocaleString()}` : `$${activePlan.priceMonthlyUsd}`}
            </span>
            <span className="text-[10px] text-slate-400 block font-medium">
              {billingCycle === 'ANNUAL' ? (locale === 'bn' ? 'বার্ষিক চার্জ' : 'Billed Annually') : (locale === 'bn' ? 'মাসিক চার্জ' : 'Billed Monthly')}
            </span>
          </div>

          <div className="p-3.5 rounded-2xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200/80 dark:border-slate-700/80">
            <span className="text-[10px] font-mono font-bold text-slate-400 uppercase block">
              {locale === 'bn' ? 'অ্যাকাউন্ট সিট বরাদ্দ' : 'Seat Allowance'}
            </span>
            <span className="text-base sm:text-lg font-black text-indigo-600 dark:text-indigo-400">
              {selectedRole === 'LAWYER' ? lawyerSeats : selectedRole === 'REGULATOR' ? inspectorSeats : activePlan.seatAllowance} {locale === 'bn' ? 'জন' : 'Seats'}
            </span>
            <span className="text-[10px] text-slate-400 block font-medium">
              {locale === 'bn' ? 'সক্রিয় ব্যবহারকারী' : 'Active Seat Access'}
            </span>
          </div>

          <div className="p-3.5 rounded-2xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200/80 dark:border-slate-700/80">
            <span className="text-[10px] font-mono font-bold text-slate-400 uppercase block">
              {locale === 'bn' ? 'কোর্ট এভিডেন্স এক্সপোর্ট' : 'Evidence Exports'}
            </span>
            <span className="text-base sm:text-lg font-black text-emerald-600 dark:text-emerald-400">
              {activePlan.maxEvidenceExportsMonth >= 9999 ? 'UNLIMITED' : `${activePlan.maxEvidenceExportsMonth} / mo`}
            </span>
            <span className="text-[10px] text-slate-400 block font-medium">
              {locale === 'bn' ? 'সার্টিফাইড কোর্ট ফাইল' : 'Court Certification'}
            </span>
          </div>

          <div className="p-3.5 rounded-2xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200/80 dark:border-slate-700/80">
            <span className="text-[10px] font-mono font-bold text-slate-400 uppercase block">
              {locale === 'bn' ? 'পরবর্তী রিনিউয়াল তারিখ' : 'Next Billing Date'}
            </span>
            <span className="text-base sm:text-lg font-black text-purple-600 dark:text-purple-400 font-mono">
              2026-10-01
            </span>
            <span className="text-[10px] text-slate-400 block font-medium">
              SLA: {activePlan.slaHours} {locale === 'bn' ? 'ঘণ্টা রেসপন্স' : 'Hours SLA'}
            </span>
          </div>
        </div>
      </div>

      {/* PLAN SELECTION TIERS GRID FOR SELECTED ROLE */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <h3 className="text-base font-black text-slate-900 dark:text-white flex items-center gap-2">
            <Award className="w-5 h-5 text-indigo-500" />
            <span>
              {selectedRole === 'CLIENT' && (locale === 'bn' ? 'নাগরিক ও পরিবার সুরক্ষার প্ল্যানসমূহ' : 'Citizen & Family Protection Plans')}
              {selectedRole === 'LAWYER' && (locale === 'bn' ? 'আইনজীবী ও ল চেম্বারের লিগ্যাল প্ল্যানসমূহ' : 'Lawyer & Advocates Practice Plans')}
              {selectedRole === 'REGULATOR' && (locale === 'bn' ? 'নিয়ন্ত্রক কমিশন ও সরকারি এনফোর্সমেন্ট প্ল্যানসমূহ' : 'Regulatory Commission & Inspector Plans')}
            </span>
          </h3>
          <span className="text-xs text-slate-500 font-mono font-bold">
            {currency === 'USD' ? 'মুদ্রা: ৳ USD' : 'Currency: $ USD'}
          </span>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
          {currentRolePlans.map((plan) => {
            const isCurrent = plan.id === activePlanId;
            const price = currency === 'USD' ? plan.priceMonthlyBdt : plan.priceMonthlyUsd;
            const formattedPrice = billingCycle === 'ANNUAL'
              ? Math.round(price * 0.8)
              : price;

            return (
              <motion.div
                key={plan.id}
                whileHover={{ y: -4 }}
                className={`rounded-3xl p-6 border transition-all flex flex-col justify-between relative ${
                  isCurrent
                    ? 'bg-slate-900 text-white border-indigo-500 ring-2 ring-indigo-500/30 shadow-xl'
                    : plan.popular
                    ? 'bg-white dark:bg-slate-900 text-slate-900 dark:text-white border-indigo-300 dark:border-indigo-700 shadow-md'
                    : 'bg-white dark:bg-slate-900 text-slate-900 dark:text-white border-slate-200 dark:border-slate-800'
                }`}
              >
                {/* Popular Badge */}
                {plan.popular && (
                  <div className="absolute -top-3 left-1/2 -translate-x-1/2 px-3 py-0.5 rounded-full bg-gradient-to-r from-indigo-500 to-purple-600 text-white text-[10px] font-mono font-bold uppercase tracking-wider shadow-md">
                    {locale === 'bn' ? 'সর্বাধিক জনপ্রিয়' : 'MOST POPULAR TIER'}
                  </div>
                )}

                <div className="space-y-4">
                  {/* Plan Title & Badge */}
                  <div>
                    <span className="text-[10px] font-mono font-bold uppercase tracking-wider text-indigo-500 block">
                      {locale === 'bn' ? plan.badgeBn : plan.badgeEn}
                    </span>
                    <h4 className="text-lg font-black tracking-tight mt-0.5">
                      {locale === 'bn' ? plan.nameBn : plan.nameEn}
                    </h4>
                  </div>

                  {/* Pricing Display */}
                  <div className="border-y border-slate-100 dark:border-slate-800/80 py-3">
                    <div className="flex items-baseline space-x-1">
                      <span className="text-2xl sm:text-3xl font-black">
                        {currency === 'USD' ? `৳${formattedPrice.toLocaleString()}` : `$${formattedPrice}`}
                      </span>
                      <span className="text-xs text-slate-400 font-bold">
                        / {locale === 'bn' ? 'মাস' : 'month'}
                      </span>
                    </div>
                    {billingCycle === 'ANNUAL' && (
                      <span className="text-[10px] font-bold text-emerald-500 block mt-0.5">
                        {locale === 'bn' ? 'মাসে ২০% সাশ্রয় (বার্ষিক বিলিং)' : '20% saved with annual subscription'}
                      </span>
                    )}
                  </div>

                  {/* Feature Checklist */}
                  <ul className="space-y-2 text-xs">
                    {(locale === 'bn' ? plan.featuresBn : plan.featuresEn).map((feat, idx) => (
                      <li key={idx} className="flex items-start space-x-2">
                        <CheckCircle2 className="w-4 h-4 text-emerald-500 shrink-0 mt-0.5" />
                        <span className="text-slate-600 dark:text-slate-300 leading-snug">{feat}</span>
                      </li>
                    ))}
                  </ul>
                </div>

                {/* Upgrade Button */}
                <div className="pt-6 mt-4">
                  <button
                    type="button"
                    onClick={() => handleUpgradePlan(plan)}
                    className={`w-full py-3 rounded-2xl font-bold text-xs flex items-center justify-center space-x-1.5 transition-all cursor-pointer shadow-md ${
                      isCurrent
                        ? 'bg-emerald-600 hover:bg-emerald-700 text-white'
                        : 'bg-indigo-600 hover:bg-indigo-700 text-white'
                    }`}
                  >
                    <span>
                      {isCurrent
                        ? (locale === 'bn' ? 'সক্রিয় প্ল্যান' : 'Current Active Plan')
                        : (locale === 'bn' ? 'প্ল্যানে আপগ্রেড করুন' : 'Upgrade to Plan')}
                    </span>
                    {!isCurrent && <ChevronRight className="w-4 h-4" />}
                  </button>
                </div>
              </motion.div>
            );
          })}
        </div>
      </div>

      {/* SEATS & CAPACITY CONFIGURATION PANEL (LAWYER / REGULATOR) */}
      {(selectedRole === 'LAWYER' || selectedRole === 'REGULATOR') && (
        <div className="bg-white dark:bg-slate-900 rounded-3xl p-5 sm:p-6 border border-slate-200 dark:border-slate-800 shadow-xs space-y-4">
          <div className="flex items-center justify-between border-b border-slate-100 dark:border-slate-800 pb-3">
            <div className="flex items-center space-x-2.5">
              <div className="w-9 h-9 rounded-xl bg-purple-100 dark:bg-purple-950 text-purple-600 dark:text-purple-400 flex items-center justify-center font-bold">
                <Sliders className="w-5 h-5" />
              </div>
              <div>
                <h3 className="text-sm sm:text-base font-black text-slate-900 dark:text-white">
                  {selectedRole === 'LAWYER'
                    ? (locale === 'bn' ? 'অ্যাডভোকেট ও আইনজীবী সিট কনফিগারেশন' : 'Advocate & Lawyer Seats Allocation')
                    : (locale === 'bn' ? 'নিয়ন্ত্রক পরিদর্শক কমিশন সিট কনফিগারেশন' : 'Regulator Inspector Commission Seats')}
                </h3>
                <p className="text-xs text-slate-500">
                  {locale === 'bn' ? 'চেম্বারের টিম মেম্বার অথবা ফিল্ড পরিদর্শকদের সংখ্যা অনুযায়ী কাস্টমাইজ করুন' : 'Dynamically customize active team member seats for your chamber or agency.'}
                </p>
              </div>
            </div>
            <span className="text-xs font-mono font-bold text-purple-600 dark:text-purple-400 bg-purple-50 dark:bg-purple-950/80 px-2.5 py-1 rounded-lg border border-purple-200 dark:border-purple-800">
              {selectedRole === 'LAWYER' ? `${lawyerSeats} Advocates` : `${inspectorSeats} Inspectors`}
            </span>
          </div>

          <div className="space-y-3 pt-2">
            <div className="flex items-center justify-between text-xs font-bold text-slate-700 dark:text-slate-300">
              <span>{locale === 'bn' ? 'সিটের সংখ্যা নির্বাচন করুন:' : 'Adjust Active Seat Count:'}</span>
              <span>
                {selectedRole === 'LAWYER'
                  ? `৳800 / extra advocate seat`
                  : `৳3,500 / extra inspector seat`}
              </span>
            </div>

            <div className="flex items-center space-x-4">
              <button
                type="button"
                onClick={() => {
                  if (selectedRole === 'LAWYER') setLawyerSeats(prev => Math.max(1, prev - 1));
                  if (selectedRole === 'REGULATOR') setInspectorSeats(prev => Math.max(1, prev - 1));
                }}
                className="p-2.5 rounded-xl bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-200 transition-colors cursor-pointer"
              >
                <Minus className="w-4 h-4" />
              </button>

              <input
                type="range"
                min="1"
                max="50"
                value={selectedRole === 'LAWYER' ? lawyerSeats : inspectorSeats}
                onChange={(e) => {
                  const val = parseInt(e.target.value) || 1;
                  if (selectedRole === 'LAWYER') setLawyerSeats(val);
                  if (selectedRole === 'REGULATOR') setInspectorSeats(val);
                }}
                className="flex-1 accent-indigo-600 cursor-pointer h-2 bg-slate-200 dark:bg-slate-700 rounded-lg"
              />

              <button
                type="button"
                onClick={() => {
                  if (selectedRole === 'LAWYER') setLawyerSeats(prev => prev + 1);
                  if (selectedRole === 'REGULATOR') setInspectorSeats(prev => prev + 1);
                }}
                className="p-2.5 rounded-xl bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-200 transition-colors cursor-pointer"
              >
                <Plus className="w-4 h-4" />
              </button>
            </div>
          </div>
        </div>
      )}

      {/* LAYER ADD-ON MODULES SELECTION */}
      <div className="bg-white dark:bg-slate-900 rounded-3xl p-5 sm:p-6 border border-slate-200 dark:border-slate-800 shadow-xs space-y-4">
        <div className="flex items-center justify-between border-b border-slate-100 dark:border-slate-800 pb-3">
          <div className="flex items-center space-x-2.5">
            <div className="w-9 h-9 rounded-xl bg-amber-100 dark:bg-amber-950 text-amber-600 dark:text-amber-400 flex items-center justify-center font-bold">
              <Sparkles className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-sm sm:text-base font-black text-slate-900 dark:text-white">
                {locale === 'bn' ? 'স্পেশালাইজড রেগটেক অ্যাড-অন মডিউল' : 'Specialized RegTech Add-on Modules'}
              </h3>
              <p className="text-xs text-slate-500">
                {locale === 'bn' ? 'আপনার অ্যাকাউন্টে বিশেষ সুবিধা ও অটোমেশন সংযোগ করতে নির্বাচন করুন' : 'Enable specialized API triggers, court signers, and threat telemetry.'}
              </p>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          {layerAddonsDatabase.map((addon) => {
            const isSelected = selectedAddons.includes(addon.id);
            const addonPrice = currency === 'USD' ? addon.monthlyBdt : addon.monthlyUsd;

            return (
              <div
                key={addon.id}
                onClick={() => handleToggleAddon(addon.id)}
                className={`p-4 rounded-2xl border transition-all cursor-pointer flex items-start space-x-3 ${
                  isSelected
                    ? 'bg-indigo-50/80 dark:bg-indigo-950/50 border-indigo-500 shadow-xs'
                    : 'bg-slate-50/50 dark:bg-slate-800/40 border-slate-200/80 dark:border-slate-700/80 hover:border-slate-300 dark:hover:border-slate-600'
                }`}
              >
                <div className={`w-5 h-5 rounded-md border flex items-center justify-center shrink-0 mt-0.5 ${
                  isSelected
                    ? 'bg-indigo-600 border-indigo-600 text-white'
                    : 'bg-white dark:bg-slate-800 border-slate-300 dark:border-slate-600'
                }`}>
                  {isSelected && <Check className="w-3.5 h-3.5" />}
                </div>

                <div className="flex-1 min-w-0">
                  <div className="flex items-center justify-between gap-2 mb-1">
                    <h4 className="text-xs font-bold text-slate-900 dark:text-white truncate">
                      {locale === 'bn' ? addon.nameBn : addon.nameEn}
                    </h4>
                    <span className="text-xs font-mono font-bold text-indigo-600 dark:text-indigo-400 shrink-0">
                      +{currency === 'USD' ? `৳${addonPrice}` : `$${addonPrice}`}/mo
                    </span>
                  </div>
                  <p className="text-[11px] text-slate-500 dark:text-slate-400 leading-snug line-clamp-2">
                    {locale === 'bn' ? addon.descBn : addon.descEn}
                  </p>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* BILLING SUMMARY & PAYMENT GATEWAY MANAGEMENT */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-5">
        
        {/* PAYMENT METHODS & GATEWAY CONFIG */}
        <div className="lg:col-span-2 bg-white dark:bg-slate-900 rounded-3xl p-5 sm:p-6 border border-slate-200 dark:border-slate-800 shadow-xs space-y-4">
          <div className="flex items-center justify-between border-b border-slate-100 dark:border-slate-800 pb-3">
            <div className="flex items-center space-x-2.5">
              <div className="w-9 h-9 rounded-xl bg-emerald-100 dark:bg-emerald-950 text-emerald-600 dark:text-emerald-400 flex items-center justify-center font-bold">
                <CreditCard className="w-5 h-5" />
              </div>
              <div>
                <h3 className="text-sm sm:text-base font-black text-slate-900 dark:text-white">
                  {locale === 'bn' ? 'পেমেন্ট মেথড ও রেগটেক গেটওয়ে' : 'Payment Method & RegTech Gateway'}
                </h3>
                <p className="text-xs text-slate-500">
                  {locale === 'bn' ? 'বাংলাদেশে স্থানীয় এমএফএস অথবা কর্পোরেট ব্যাংক ট্র্যান্সফার নির্বাচন করুন' : 'Supported payment channels: Global Mobile Wallet Auto-Pay, Digital Wallet, Visa/Mastercard, RTGS Bank Wire'}
                </p>
              </div>
            </div>

            <button
              type="button"
              onClick={() => setShowAddPaymentModal(true)}
              className="px-3 py-1.5 rounded-xl bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 text-xs font-bold text-slate-700 dark:text-slate-200 transition-colors cursor-pointer flex items-center space-x-1"
            >
              <Plus className="w-3.5 h-3.5" />
              <span>{locale === 'bn' ? 'নতুন পেমেন্ট যুক্ত' : 'Add Channel'}</span>
            </button>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
            
            {/* Global Mobile Wallet */}
            <button
              type="button"
              onClick={() => setPaymentMethod('Global Mobile Wallet')}
              className={`p-3.5 rounded-2xl border text-left transition-all cursor-pointer flex flex-col justify-between ${
                paymentMethod === 'Global Mobile Wallet'
                  ? 'bg-rose-50 dark:bg-rose-950/50 border-rose-500 ring-2 ring-rose-500/20'
                  : 'bg-slate-50/50 dark:bg-slate-800/40 border-slate-200/80 dark:border-slate-700/80'
              }`}
            >
              <span className="text-xs font-black text-rose-600 dark:text-rose-400 block">
                Global Mobile Wallet
              </span>
              <span className="text-[10px] text-slate-500 font-medium block mt-1">
                Corporate Auto-Pay
              </span>
            </button>

            {/* Digital Wallet */}
            <button
              type="button"
              onClick={() => setPaymentMethod('Digital Wallet')}
              className={`p-3.5 rounded-2xl border text-left transition-all cursor-pointer flex flex-col justify-between ${
                paymentMethod === 'Digital Wallet'
                  ? 'bg-amber-50 dark:bg-amber-950/50 border-amber-500 ring-2 ring-amber-500/20'
                  : 'bg-slate-50/50 dark:bg-slate-800/40 border-slate-200/80 dark:border-slate-700/80'
              }`}
            >
              <span className="text-xs font-black text-amber-600 dark:text-amber-400 block">
                Digital Wallet
              </span>
              <span className="text-[10px] text-slate-500 font-medium block mt-1">
                Direct Merchant Gateway
              </span>
            </button>

            {/* CARD */}
            <button
              type="button"
              onClick={() => setPaymentMethod('CARD')}
              className={`p-3.5 rounded-2xl border text-left transition-all cursor-pointer flex flex-col justify-between ${
                paymentMethod === 'CARD'
                  ? 'bg-indigo-50 dark:bg-indigo-950/50 border-indigo-500 ring-2 ring-indigo-500/20'
                  : 'bg-slate-50/50 dark:bg-slate-800/40 border-slate-200/80 dark:border-slate-700/80'
              }`}
            >
              <span className="text-xs font-black text-indigo-600 dark:text-indigo-400 block">
                Visa / Mastercard
              </span>
              <span className="text-[10px] text-slate-500 font-medium block mt-1">
                Corporate Credit/Debit
              </span>
            </button>

            {/* BANK RTGS */}
            <button
              type="button"
              onClick={() => setPaymentMethod('BANK_RTGS')}
              className={`p-3.5 rounded-2xl border text-left transition-all cursor-pointer flex flex-col justify-between ${
                paymentMethod === 'BANK_RTGS'
                  ? 'bg-teal-50 dark:bg-teal-950/50 border-teal-500 ring-2 ring-teal-500/20'
                  : 'bg-slate-50/50 dark:bg-slate-800/40 border-slate-200/80 dark:border-slate-700/80'
              }`}
            >
              <span className="text-xs font-black text-teal-600 dark:text-teal-400 block">
                BB RTGS Wire
              </span>
              <span className="text-[10px] text-slate-500 font-medium block mt-1">
                Bank Invoice Voucher
              </span>
            </button>

          </div>

          {/* INVOICE HISTORY TABLE */}
          <div className="pt-3">
            <h4 className="text-xs font-bold text-slate-700 dark:text-slate-300 uppercase tracking-wider mb-2 flex items-center justify-between">
              <span>{locale === 'bn' ? 'সাম্প্রতিক ট্যাক্স ইনভয়েস ইতিহাস (NBR Compliant)' : 'Recent Tax Invoices & Payment History'}</span>
              <span className="text-[10px] font-mono text-slate-400">VAT BIN: 004819283-0101</span>
            </h4>

            <div className="overflow-x-auto rounded-2xl border border-slate-200 dark:border-slate-800">
              <table className="w-full text-left border-collapse text-xs">
                <thead>
                  <tr className="bg-slate-50 dark:bg-slate-800/80 border-b border-slate-200 dark:border-slate-800 text-[10px] font-mono uppercase text-slate-400">
                    <th className="p-3">{locale === 'bn' ? 'ইনভয়েস নং' : 'Invoice #'}</th>
                    <th className="p-3">{locale === 'bn' ? 'তারিখ' : 'Date'}</th>
                    <th className="p-3">{locale === 'bn' ? 'প্ল্যান' : 'Plan Name'}</th>
                    <th className="p-3">{locale === 'bn' ? 'মূল্য (ভ্যাটসহ)' : 'Amount (incl VAT)'}</th>
                    <th className="p-3">{locale === 'bn' ? 'স্ট্যাটাস' : 'Status'}</th>
                    <th className="p-3 text-right">{locale === 'bn' ? 'ইনভয়েস ডাওনলোড' : 'Download PDF'}</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 dark:divide-slate-800/60 font-medium">
                  {invoices.map((inv) => (
                    <tr key={inv.id} className="hover:bg-slate-50/50 dark:hover:bg-slate-800/30 transition-colors">
                      <td className="p-3 font-mono font-bold text-indigo-600 dark:text-indigo-400">{inv.invoiceNo}</td>
                      <td className="p-3 text-slate-500">{inv.date}</td>
                      <td className="p-3 text-slate-900 dark:text-slate-200 font-bold">{inv.planName}</td>
                      <td className="p-3 font-mono font-bold text-slate-800 dark:text-slate-100">
                        ৳{(inv.amountBdt + inv.vatBdt).toLocaleString()}
                      </td>
                      <td className="p-3">
                        <span className="px-2 py-0.5 rounded-md text-[10px] font-mono font-bold bg-emerald-100 text-emerald-700 dark:bg-emerald-950/80 dark:text-emerald-400 border border-emerald-300 dark:border-emerald-800">
                          {inv.status}
                        </span>
                      </td>
                      <td className="p-3 text-right">
                        <button
                          type="button"
                          onClick={() => setShowInvoiceModal(inv)}
                          className="px-2.5 py-1 rounded-lg bg-indigo-50 dark:bg-indigo-950 hover:bg-indigo-100 text-indigo-600 dark:text-indigo-300 font-bold text-[11px] transition-colors cursor-pointer inline-flex items-center gap-1"
                        >
                          <Download className="w-3 h-3" />
                          <span>Receipt</span>
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>

        {/* ORDER SUMMARY CHECKOUT CARD */}
        <div className="bg-slate-900 text-white rounded-3xl p-6 border border-slate-800 shadow-xl flex flex-col justify-between space-y-6">
          <div className="space-y-4">
            <div className="flex items-center justify-between border-b border-slate-800 pb-3">
              <h3 className="text-base font-black text-white flex items-center gap-2">
                <FileText className="w-5 h-5 text-indigo-400" />
                <span>{locale === 'bn' ? 'বিলিং সারসংক্ষেপ' : 'Checkout Summary'}</span>
              </h3>
              <span className="text-[10px] font-mono font-bold text-emerald-400 bg-emerald-950/80 px-2 py-0.5 rounded-md border border-emerald-800">
                {billingCycle}
              </span>
            </div>

            <div className="space-y-2.5 text-xs">
              <div className="flex justify-between text-slate-300">
                <span>{activePlan.nameEn}</span>
                <span className="font-mono font-bold">
                  {currency === 'USD' ? `৳${(currency === 'USD' ? activePlan.priceMonthlyBdt : activePlan.priceMonthlyUsd).toLocaleString()}` : `$${activePlan.priceMonthlyUsd}`}
                </span>
              </div>

              {selectedAddons.length > 0 && (
                <div className="space-y-1 pt-1 border-t border-slate-800">
                  <span className="text-[10px] font-mono font-bold text-slate-400 uppercase">Selected Add-ons ({selectedAddons.length})</span>
                  {selectedAddons.map(id => {
                    const addon = layerAddonsDatabase.find(a => a.id === id);
                    if (!addon) return null;
                    const price = currency === 'USD' ? addon.monthlyBdt : addon.monthlyUsd;
                    return (
                      <div key={id} className="flex justify-between text-slate-400 text-[11px]">
                        <span className="truncate max-w-[170px]">{addon.nameEn}</span>
                        <span className="font-mono">+{currency === 'USD' ? `৳${price}` : `$${price}`}</span>
                      </div>
                    );
                  })}
                </div>
              )}

              <div className="pt-2 border-t border-slate-800 space-y-1.5">
                <div className="flex justify-between text-slate-400">
                  <span>Subtotal</span>
                  <span className="font-mono">{currency === 'USD' ? `৳${Math.round(subtotal).toLocaleString()}` : `$${subtotal.toFixed(2)}`}</span>
                </div>
                <div className="flex justify-between text-slate-400">
                  <span>NBR Standard VAT (15%)</span>
                  <span className="font-mono">{currency === 'USD' ? `৳${Math.round(vat).toLocaleString()}` : `$${vat.toFixed(2)}`}</span>
                </div>
              </div>

              <div className="pt-3 border-t border-slate-700 flex justify-between items-baseline">
                <span className="text-sm font-black text-white">Grand Total Due:</span>
                <span className="text-xl font-black text-emerald-400 font-mono">
                  {currency === 'USD' ? `৳${Math.round(grandTotal).toLocaleString()}` : `$${grandTotal.toFixed(2)}`}
                </span>
              </div>
            </div>
          </div>

          <button
            type="button"
            onClick={() => {
              showToast(
                locale === 'bn'
                  ? `🎉 পেমেন্ট সফলভাবে সম্পন্ন হয়েছে! আপনার '${activePlan.nameBn}' অ্যাকাউন্ট সক্রিয় করা হল।`
                  : `🎉 Payment successful! Active plan updated to '${activePlan.nameEn}'.`,
                'success'
              );
            }}
            className="w-full py-3.5 rounded-2xl bg-gradient-to-r from-emerald-500 to-teal-600 hover:from-emerald-600 hover:to-teal-700 text-slate-950 font-black text-sm shadow-xl shadow-emerald-500/20 transition-all cursor-pointer flex items-center justify-center space-x-2"
          >
            <ShieldCheck className="w-5 h-5" />
            <span>{locale === 'bn' ? 'সাবস্ক্রিপশন কনফার্ম করুন' : 'Confirm Subscription Payment'}</span>
          </button>
        </div>

      </div>

      {/* INVOICE PREVIEW MODAL */}
      <AnimatePresence>
        {showInvoiceModal && (
          <div className="fixed inset-0 z-50 bg-slate-950/80 backdrop-blur-md flex items-center justify-center p-4">
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="bg-white dark:bg-slate-900 rounded-3xl p-6 max-w-lg w-full border border-slate-200 dark:border-slate-800 shadow-2xl space-y-5 text-left"
            >
              <div className="flex items-center justify-between border-b border-slate-100 dark:border-slate-800 pb-3">
                <div className="flex items-center space-x-2">
                  <div className="w-8 h-8 rounded-xl bg-emerald-500 text-white flex items-center justify-center font-bold">
                    <ShieldCheck className="w-5 h-5" />
                  </div>
                  <div>
                    <h3 className="text-sm font-black text-slate-900 dark:text-white">
                      OFFICIAL TAX INVOICE RECEIPT
                    </h3>
                    <span className="text-[10px] font-mono text-slate-400">NBR RegTech BIN: 004819283-0101</span>
                  </div>
                </div>
                <button
                  type="button"
                  onClick={() => setShowInvoiceModal(null)}
                  className="p-1 rounded-lg text-slate-400 hover:text-white cursor-pointer"
                >
                  <XCircle className="w-5 h-5" />
                </button>
              </div>

              <div className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700 space-y-3 font-mono text-xs text-slate-700 dark:text-slate-300">
                <div className="flex justify-between">
                  <span>Invoice Reference:</span>
                  <span className="font-bold text-indigo-600 dark:text-indigo-400">{showInvoiceModal.invoiceNo}</span>
                </div>
                <div className="flex justify-between">
                  <span>Date Issued:</span>
                  <span>{showInvoiceModal.date}</span>
                </div>
                <div className="flex justify-between">
                  <span>Plan Layer:</span>
                  <span className="font-bold">{showInvoiceModal.planName}</span>
                </div>
                <div className="flex justify-between">
                  <span>Payment Gateway:</span>
                  <span>{showInvoiceModal.paymentMethod}</span>
                </div>
                <div className="border-t border-slate-200 dark:border-slate-700 pt-2 flex justify-between text-slate-900 dark:text-white font-black text-sm">
                  <span>Total Paid (incl VAT):</span>
                  <span className="text-emerald-600 dark:text-emerald-400">৳{(showInvoiceModal.amountBdt + showInvoiceModal.vatBdt).toLocaleString()}</span>
                </div>
              </div>

              <div className="flex space-x-3">
                <button
                  type="button"
                  onClick={() => setShowInvoiceModal(null)}
                  className="flex-1 py-2.5 rounded-xl bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 font-bold text-xs"
                >
                  Close
                </button>
                <button
                  type="button"
                  onClick={() => {
                    showToast('🖼️ Official Tax Invoice PDF downloaded to local storage!', 'success');
                    setShowInvoiceModal(null);
                  }}
                  className="flex-1 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-xs flex items-center justify-center space-x-1"
                >
                  <Download className="w-3.5 h-3.5" />
                  <span>Download PDF Receipt</span>
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* ADD PAYMENT METHOD MODAL */}
      <AnimatePresence>
        {showAddPaymentModal && (
          <div className="fixed inset-0 z-50 bg-slate-950/80 backdrop-blur-md flex items-center justify-center p-4">
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="bg-white dark:bg-slate-900 rounded-3xl p-6 max-w-md w-full border border-slate-200 dark:border-slate-800 shadow-2xl space-y-4 text-left"
            >
              <div className="flex items-center justify-between border-b border-slate-100 dark:border-slate-800 pb-3">
                <h3 className="text-sm font-black text-slate-900 dark:text-white">
                  {locale === 'bn' ? 'নতুন পেমেন্ট মেথড যোগ করুন' : 'Add New RegTech Payment Gateway'}
                </h3>
                <button
                  type="button"
                  onClick={() => setShowAddPaymentModal(false)}
                  className="p-1 rounded-lg text-slate-400 hover:text-white cursor-pointer"
                >
                  <XCircle className="w-5 h-5" />
                </button>
              </div>

              <div className="space-y-3 text-xs">
                <div>
                  <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1">
                    {locale === 'bn' ? 'পেমেন্ট চ্যানেল বেছে নিন' : 'Payment Channel Type'}
                  </label>
                  <select className="w-full p-2.5 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 font-bold text-slate-800 dark:text-slate-200">
                    <option>Global Mobile Wallet Merchant Direct (Auto-Debit)</option>
                    <option>Digital Wallet Gateway API</option>
                    <option>Visa / Mastercard Corporate</option>
                    <option>Global Region Bank RTGS Bank Wire</option>
                  </select>
                </div>

                <div>
                  <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1">
                    {locale === 'bn' ? 'অ্যাকাউন্ট / কার্ড নম্বর' : 'Account Wallet / Card Number'}
                  </label>
                  <input
                    type="text"
                    placeholder="e.g. 01711000000 or 4111 2222 3333 4444"
                    className="w-full p-2.5 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 font-mono font-bold text-slate-800 dark:text-slate-200"
                  />
                </div>
              </div>

              <div className="flex space-x-3 pt-2">
                <button
                  type="button"
                  onClick={() => setShowAddPaymentModal(false)}
                  className="flex-1 py-2.5 rounded-xl bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 font-bold text-xs"
                >
                  Cancel
                </button>
                <button
                  type="button"
                  onClick={handleSavePaymentMethod}
                  className="flex-1 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs shadow-md"
                >
                  Save Gateway
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

    </div>
  );
};
