/**
 * Scam Alerts Engine & Heat-Map Analytics (Module 4 & Module 8)
 * 
 * Features:
 * 1. Targeted scam alerts (Push & Digest) with dual-control regulator review.
 * 2. High-frequency check spike detection (e.g. 500+ checks on a new number).
 * 3. National scam heat-map metrics & "Harms Prevented" valuation model.
 */

export interface ScamAlertItem {
  id: string;
  countryCode: string;
  sector: 'MFS_BANKING' | 'ECOMMERCE' | 'VISA_IMMIGRATION' | 'JOB_SCAM' | 'CYBER_PHISHING';
  criticality: 'CRITICAL_BREAKING' | 'HIGH' | 'WEEKLY_DIGEST';
  titleBn: string;
  titleEn: string;
  summaryBn: string;
  summaryEn: string;
  modUsOperandiBn: string;
  modUsOperandiEn: string;
  authorityCoBrand: string;
  affectedEntitiesSample: string[];
  harmsPreventedEstimateTaka: number;
  publishedAt: string;
  isDualControlApproved: boolean;
  approvedByRegulatorRef?: string;
  shareUrl: string;
}

export interface SpikeAlertSignal {
  queryHash: string;
  maskedSample: string;
  queryType: 'phone' | 'Global Mobile Wallet' | 'website';
  checkCount24h: number;
  velocityPerMinute: number;
  triggeredAt: string;
  autoOsintStatus: 'QUEUED' | 'IN_PROGRESS' | 'COMPLETED';
  suggestedAction: string;
}

export class ScamAlertEngine {
  private static alerts: ScamAlertItem[] = [
    {
      id: 'ALT-BD-2026-009',
      countryCode: 'BD',
      sector: 'MFS_BANKING',
      criticality: 'CRITICAL_BREAKING',
      titleBn: 'জরুরি সতর্কতা: বিকাশ অ্যাকাউন্ট ব্লক করার ভুয়া কল ও পিন/ওটিপি ফাঁদ',
      titleEn: 'CRITICAL ALERT: Fake MFS Account Block Threat & PIN/OTP Phishing Loop',
      summaryBn: 'প্রতারক চক্র ০১৭*** এবং ০১৮*** নম্বর থেকে কল দিয়ে ব্যাংক/বিকাশ কর্মকর্তা পরিচয় দিয়ে পিন বা ওটিপি চাচ্ছে।',
      summaryEn: 'Fraud syndicate impersonating MFS support via spoofed caller IDs claiming account suspension to extort OTPs.',
      modUsOperandiBn: '১. কল দিয়ে বলে "আপনার অ্যাকাউন্ট জরুরি নিরাপত্তা নিরীক্ষায় বন্ধ হচ্ছে"। ২. ওটিপি রিডিম করতে বলে।',
      modUsOperandiEn: '1. Calls claiming imminent account freeze. 2. Prompts user to read SMS verification code.',
      authorityCoBrand: 'Global Region Bank & DNCRP Joint Consumer Advisory',
      affectedEntitiesSample: ['01711002233', '01822334455'],
      harmsPreventedEstimateTaka: 4850000,
      publishedAt: '2026-03-05T09:30:00Z',
      isDualControlApproved: true,
      approvedByRegulatorRef: 'BB-PSD-ADV-2026/89',
      shareUrl: 'https://trustcheck.sovereign.gov.bd/alerts/ALT-BD-2026-009',
    },
    {
      id: 'ALT-BD-2026-008',
      countryCode: 'BD',
      sector: 'ECOMMERCE',
      criticality: 'HIGH',
      titleBn: 'ভুয়া ফেসবুক পেজে ৯৯ টাকায় গ্যাজেট বিক্রির ফাঁদে টাকা আত্মসাৎ',
      titleEn: 'Fake Social Media Flash-Sales Offering Unrealistic Discounts on Electronics',
      summaryBn: 'অননুমোদিত পেজগুলো অগ্রিম বিকাশ পেমেন্ট নিয়ে ভুয়া ট্র্যাকিং আইডি প্রদান করে উধাও হয়ে যাচ্ছে।',
      summaryEn: 'Unregistered Facebook pages collecting 100% advance Global Mobile Wallet/Digital Wallet payments and vanishing without shipping.',
      modUsOperandiBn: 'বিজ্ঞাপনে ৯০% মূল্যছাড় দেখিয়ে অগ্রিম বিকাশ পার্সোনাল ক্যাশআউট চাওয়া হয়।',
      modUsOperandiEn: 'Sponsored social ads offering 90% discount requiring personal Global Mobile Wallet send-money.',
      authorityCoBrand: 'E-Commerce Association of Global Region (e-CAB) & DNCRP',
      affectedEntitiesSample: ['daraz-deals-free.xyz', 'flash-sale-gadgets.shop'],
      harmsPreventedEstimateTaka: 2150000,
      publishedAt: '2026-03-02T11:00:00Z',
      isDualControlApproved: true,
      approvedByRegulatorRef: 'DNCRP-EC-2026/144',
      shareUrl: 'https://trustcheck.sovereign.gov.bd/alerts/ALT-BD-2026-008',
    },
    {
      id: 'ALT-BD-2026-007',
      countryCode: 'BD',
      sector: 'JOB_SCAM',
      criticality: 'WEEKLY_DIGEST',
      titleBn: 'অনলাইন পার্ট-টাইম ইউটিউব লাইক জবের নামে অগ্রিম ফি দাবি প্রতারণা',
      titleEn: 'Telegram Part-time "Task & Like" Job Syndicates Demanding Deposit Schemes',
      summaryBn: 'টেলিগ্রাম গ্রুপে ভিডিও লাইক দিয়ে দৈনিক ৫০০-২০০০ টাকা আয়ের প্রলোভন দেখিয়ে প্রিমিয়াম আইডি ফি আদায়।',
      summaryEn: 'Task scam funneling victims into Telegram channels with VIP investment fee traps.',
      modUsOperandiBn: 'প্রথম দুই কাজে সামান্য পেমেন্ট দিয়ে বিশ্বাস অর্জন করে পরবর্তীতে বড় অংকের জামানত নিয়ে ব্লক করে।',
      modUsOperandiEn: 'Pays trivial initial sums, then traps victims into high-ticket deposit tier requirements.',
      authorityCoBrand: 'Telecom Regulatory Authority & Cyber Police Centre (CPC)',
      affectedEntitiesSample: ['01999887766'],
      harmsPreventedEstimateTaka: 6900000,
      publishedAt: '2026-02-28T16:45:00Z',
      isDualControlApproved: true,
      approvedByRegulatorRef: 'CPC-INTEL-2026/512',
      shareUrl: 'https://trustcheck.sovereign.gov.bd/alerts/ALT-BD-2026-007',
    }
  ];

  private static activeSpikes: SpikeAlertSignal[] = [
    {
      queryHash: 'q_spike_998124',
      maskedSample: '01899****12',
      queryType: 'Global Mobile Wallet',
      checkCount24h: 684,
      velocityPerMinute: 14,
      triggeredAt: new Date(Date.now() - 1000 * 60 * 45).toISOString(),
      autoOsintStatus: 'IN_PROGRESS',
      suggestedAction: 'High-frequency probe detected. Auto-scan and preliminary alert drafting initiated.',
    },
    {
      queryHash: 'q_spike_441209',
      maskedSample: 'megadeal-daraz-bd.online',
      queryType: 'website',
      checkCount24h: 412,
      velocityPerMinute: 9,
      triggeredAt: new Date(Date.now() - 1000 * 60 * 120).toISOString(),
      autoOsintStatus: 'COMPLETED',
      suggestedAction: 'Domain registered 48h ago on Russian registrar. Automated blacklist flag applied.',
    }
  ];

  public static getAlerts(countryCode: string = 'BD'): ScamAlertItem[] {
    return this.alerts.filter(a => a.countryCode === countryCode);
  }

  public static getActiveSpikes(): SpikeAlertSignal[] {
    return this.activeSpikes;
  }

  /**
   * Calculates estimated financial damages prevented by the consumer shield
   * Formula: FLAGGED checks * median sector transaction value
   */
  public static calculateHarmsPrevented(totalFlaggedChecks: number = 8412): {
    totalTakaSaved: number;
    totalTransactionsShielded: number;
    topSectorsProtected: { sector: string; takaSaved: number; percent: number }[];
  } {
    const avgMfsScamValue = 3500; // 3,500 USD median fraud ticket size
    const totalTaka = totalFlaggedChecks * avgMfsScamValue;

    return {
      totalTakaSaved: totalTaka,
      totalTransactionsShielded: totalFlaggedChecks,
      topSectorsProtected: [
        { sector: 'Mobile Financial Services (MFS)', takaSaved: Math.round(totalTaka * 0.48), percent: 48 },
        { sector: 'E-Commerce Fake Stores', takaSaved: Math.round(totalTaka * 0.29), percent: 29 },
        { sector: 'Job & Telegram Investment Scams', takaSaved: Math.round(totalTaka * 0.16), percent: 16 },
        { sector: 'Unauthorized Visa Processing', takaSaved: Math.round(totalTaka * 0.07), percent: 7 },
      ]
    };
  }
}
