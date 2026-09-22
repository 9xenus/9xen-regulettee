/**
 * Trust Verdict Engine (Module 2: Trust Check)
 * 
 * Implements strict legal-approved verdict templates, multi-layer verification hierarchy,
 * edge caching, due process appeal wiring, and share-card payload generation.
 * 
 * CORE PRINCIPLE:
 * LLM NEVER drafts public accusations or defamatory text. Verdict copy is strictly deterministic
 * and scoped to authority-reviewed reports and cryptographic proofs.
 */

import crypto from 'crypto';
import { appDeviceSecurityManager, AppCheckRecord } from './TrustCheckArchitecture';

export type VerdictTier = 'FLAGGED' | 'WARNED' | 'VERIFIED' | 'UNKNOWN';

export interface VerdictEvidenceSummary {
  confirmedReportCount: number;
  unconfirmedComplaintCount: number;
  primaryAuthorityName: string;
  enforcementRef?: string;
  category: string;
  firstReportedAt?: string;
  lastReportedAt?: string;
  trustBadgeNumber?: string;
  registrationNumber?: string;
}

export interface TrustVerdict {
  verdictId: string;
  tier: VerdictTier;
  queryType: 'phone' | 'wallet' | 'website' | 'qr' | 'name';
  maskedQuery: string;
  queryHash: string;
  headline: string;
  body: string;
  actionGuidance: string;
  evidence: VerdictEvidenceSummary;
  appealUrl: string;
  verifiedAt: string;
  verdictSignature: string; // HMAC-SHA256 of verdict tuple
  shareCard: {
    title: string;
    subtitle: string;
    badgeColor: 'rose' | 'amber' | 'emerald' | 'slate';
    qrVerifyUrl: string;
  };
}

export class TrustVerdictEngine {
  private static cache: Map<string, { verdict: TrustVerdict; cachedAt: number }> = new Map();
  private static CACHE_TTL_MS = 1000 * 60 * 15; // 15-minute edge cache
  private static checkHistory: AppCheckRecord[] = [];

  /**
   * Pre-computed dataset of known entities, flagged numbers, verified Trust Badge holders, etc.
   */
  private static KNOWN_ENTITIES: Record<string, {
    tier: VerdictTier;
    category: string;
    entityName?: string;
    confirmedReports?: number;
    unconfirmedComplaints?: number;
    authority: string;
    enforcementRef?: string;
    badgeNo?: string;
    regNo?: string;
  }> = {
    // Flagged Scammer Numbers / Links (Sample Pilot Data for BD & Global)
    '01711002233': {
      tier: 'FLAGGED',
      category: 'Fake MFS Cash-Back Scam',
      confirmedReports: 14,
      unconfirmedComplaints: 28,
      authority: 'Global Region National Consumer Rights Protection (DNCRP)',
      enforcementRef: 'DNCRP-ENF-2026-904',
    },
    '01822334455': {
      tier: 'FLAGGED',
      category: 'Unauthorized Visa Processing Agent',
      confirmedReports: 9,
      unconfirmedComplaints: 17,
      authority: 'Telecom Regulatory Authority Telecom Vigilance & Law Enforcement',
      enforcementRef: 'Telecom Regulatory Authority-FRAUD-8812',
    },
    'daraz-deals-free.xyz': {
      tier: 'FLAGGED',
      category: 'Brand Phishing / Fake E-commerce',
      confirmedReports: 31,
      unconfirmedComplaints: 64,
      authority: 'National Cyber Security Agency & DNCRP',
      enforcementRef: 'NCSA-PHISH-2026-44',
    },
    '01999887766': {
      tier: 'WARNED',
      category: 'Unverified Social Media Shop',
      confirmedReports: 0,
      unconfirmedComplaints: 6,
      authority: 'Consumer Grievance Intake Stream',
      enforcementRef: 'GRV-TRIAGE-PENDING',
    },
    'flash-sale-gadgets.shop': {
      tier: 'WARNED',
      category: 'Delayed Delivery & Non-Refund Complaints',
      confirmedReports: 0,
      unconfirmedComplaints: 8,
      authority: 'Consumer Protection Advisory Registry',
    },
    // Verified Trust Badge Merchants
    '01700112233': {
      tier: 'VERIFIED',
      category: 'Verified Licensed Merchant',
      entityName: 'Apex Healthtech Solutions Ltd.',
      authority: 'Ministry of Commerce & Registrar of Joint Stock Companies',
      badgeNo: 'TB-BD-2026-98101',
      regNo: 'RJSC-C-88912',
    },
    'chaldal.com': {
      tier: 'VERIFIED',
      category: 'Official E-Commerce Enterprise',
      entityName: 'Chaldal Limited',
      authority: 'ECAB & Digital Commerce Registry',
      badgeNo: 'TB-BD-2026-00012',
      regNo: 'RJSC-C-54910',
    },
    'Global Mobile Wallet-merchant-1982': {
      tier: 'VERIFIED',
      category: 'Verified Digital Payment Merchant',
      entityName: 'Brotecs Cloud Technologies',
      authority: 'Global Region Bank Regulated MFS Partner',
      badgeNo: 'TB-BD-2026-44192',
    }
  };

  /**
   * Main Check Evaluation Pipeline (<1.5s p95 target)
   */
  public static evaluateCheck(
    query: string,
    queryType: 'phone' | 'wallet' | 'website' | 'qr' | 'name',
    countryId: string = 'BD',
    deviceId: string = 'dev_guest_default',
    locale: 'bn' | 'en' | 'de' = 'bn'
  ): TrustVerdict {
    // 1. Validate device access & rate limits
    const access = appDeviceSecurityManager.checkDeviceAccess(deviceId);
    if (!access.allowed) {
      return this.composeRateLimitVerdict(query, queryType, access.reason || 'Rate limit reached.');
    }

    const cleanQuery = query.trim().toLowerCase().replace(/^(https?:\/\/)?(www\.)?/, '').replace(/\/$/, '');
    const queryHash = appDeviceSecurityManager.generateQueryHash(cleanQuery, countryId);

    // 2. Check Edge Cache
    const cached = this.cache.get(queryHash);
    if (cached && (Date.now() - cached.cachedAt) < this.CACHE_TTL_MS) {
      this.recordCheckHistory(deviceId, queryType, queryHash, cleanQuery, cached.verdict.tier, countryId);
      return cached.verdict;
    }

    // 3. Multi-Layer Resolution
    const match = this.lookupEntity(cleanQuery, countryId);

    let verdict: TrustVerdict;
    if (match) {
      verdict = this.composeVerdictFromMatch(cleanQuery, queryType, queryHash, match, locale, countryId);
    } else {
      verdict = this.composeUnknownVerdict(cleanQuery, queryType, queryHash, locale, countryId);
    }

    // 4. Cache & Log Stream
    this.cache.set(queryHash, { verdict, cachedAt: Date.now() });
    this.recordCheckHistory(deviceId, queryType, queryHash, cleanQuery, verdict.tier, countryId);

    return verdict;
  }

  private static lookupEntity(cleanQuery: string, countryId: string) {
    // Check direct normalized keys
    if (this.KNOWN_ENTITIES[cleanQuery]) {
      return this.KNOWN_ENTITIES[cleanQuery];
    }

    // Secondary phone matching (handling +880 or leading 0)
    const normalizedDigits = cleanQuery.replace(/[^0-9]/g, '');
    if (normalizedDigits.length >= 10) {
      const localNumber = normalizedDigits.startsWith('880') ? normalizedDigits.substring(2) : (normalizedDigits.startsWith('0') ? normalizedDigits : `0${normalizedDigits}`);
      if (this.KNOWN_ENTITIES[localNumber]) {
        return this.KNOWN_ENTITIES[localNumber];
      }
    }

    // Domain wildcard matching
    for (const [key, val] of Object.entries(this.KNOWN_ENTITIES)) {
      if (cleanQuery.includes(key) || key.includes(cleanQuery)) {
        return val;
      }
    }

    return null;
  }

  private static composeVerdictFromMatch(
    query: string,
    queryType: 'phone' | 'wallet' | 'website' | 'qr' | 'name',
    queryHash: string,
    match: typeof TrustVerdictEngine.KNOWN_ENTITIES[string],
    locale: string,
    countryId: string
  ): TrustVerdict {
    const masked = appDeviceSecurityManager.maskQuery(query, queryType);
    const now = new Date().toISOString();
    const verdictId = `VRD-${countryId}-${Date.now().toString(36).toUpperCase()}`;

    // Cryptographic signature of verdict for tamper-proof share cards
    const verdictSignature = crypto
      .createHmac('sha256', process.env.VERDICT_SIGNING_SECRET || (process.env.NODE_ENV === 'production' ? (() => { throw new Error('FATAL: VERDICT_SIGNING_SECRET must be set in production.'); })() : 'dev-only-verdict-secret-do-not-use-in-production'))
      .update(`${verdictId}:${match.tier}:${queryHash}:${now}`)
      .digest('hex');

    const appealUrl = `/appeal-portal?ref=${verdictId}&hash=${queryHash.substring(0, 12)}&entity=${encodeURIComponent(masked)}`;

    if (match.tier === 'FLAGGED') {
      const isBangla = locale === 'bn';
      return {
        verdictId,
        tier: 'FLAGGED',
        queryType,
        maskedQuery: masked,
        queryHash,
        headline: isBangla 
          ? `সতর্কতা: ${match.authority} কর্তৃক পর্যালোচিত প্রতারণার রেকর্ড পাওয়া গেছে`
          : `CAUTION: Linked to confirmed fraud reports reviewed by ${match.authority}`,
        body: isBangla
          ? `এই নম্বর/লিঙ্কটির বিরুদ্ধে ${match.confirmedReports || 1} টি নিশ্চিত অভিযোগ সরকারি তদন্তে রেকর্ডভুক্ত হয়েছে (${match.category})। কোন অগ্রিম অর্থ প্রদান করবেন না।`
          : `This recipient has ${match.confirmedReports || 1} confirmed grievance cases on record with regulatory oversight. High risk of non-delivery or financial loss. Do not pay.`,
        actionGuidance: isBangla
          ? 'এই অ্যাকাউন্টে টাকা পাঠাবেন না। আপনি যদি ইতোমধ্যে ভুক্তভোগী হয়ে থাকেন, তবে নিচের বাটন চেপে ৬০ সেকেন্ডে অভিযোগ দাখিল করুন।'
          : 'Do not transfer funds. If you have already sent payment, tap "Report Fraud" immediately to initiate automated regulatory dispute clearing.',
        evidence: {
          confirmedReportCount: match.confirmedReports || 1,
          unconfirmedComplaintCount: match.unconfirmedComplaints || 0,
          primaryAuthorityName: match.authority,
          enforcementRef: match.enforcementRef,
          category: match.category,
          lastReportedAt: '2026-03-01T14:20:00Z'
        },
        appealUrl,
        verifiedAt: now,
        verdictSignature,
        shareCard: {
          title: isBangla ? 'সতর্কতা: আর্থিক প্রতারণা রেকর্ড' : 'CAUTION: Fraud Record Confirmed',
          subtitle: `${masked} • ${match.authority}`,
          badgeColor: 'rose',
          qrVerifyUrl: `https://trustcheck.sovereign.gov.bd/v/${verdictId}`,
        }
      };
    }

    if (match.tier === 'WARNED') {
      const isBangla = locale === 'bn';
      return {
        verdictId,
        tier: 'WARNED',
        queryType,
        maskedQuery: masked,
        queryHash,
        headline: isBangla
          ? 'সতর্ক থাকুন: একাধিক অনিষ্পন্ন ভোক্তা অভিযোগ পর্যালোচনায় রয়েছে'
          : 'Exercise Caution: Multiple unconfirmed complaints currently under review',
        body: isBangla
          ? `এই অ্যাকাউন্টের বিরুদ্ধে ${match.unconfirmedComplaints || 3} টি সাম্প্রতিক ভোক্তা অভিযোগ দায়ের হয়েছে (${match.category})। সম্পূর্ণ যাচাই ছাড়া লেনদেন পরিহার করুন।`
          : `${match.unconfirmedComplaints || 3} recent consumer complaints have been received regarding ${match.category}. Official investigation in progress.`,
        actionGuidance: isBangla
          ? 'ক্যাশ অন ডেলিভারি (COD) নির্বাচন করুন এবং পণ্য হাতে পাওয়ার আগে পুরো মূল্য পরিশোধ থেকে বিরত থাকুন।'
          : 'Opt for Cash on Delivery (COD) and verify product provenance before completing payment.',
        evidence: {
          confirmedReportCount: 0,
          unconfirmedComplaintCount: match.unconfirmedComplaints || 3,
          primaryAuthorityName: match.authority,
          category: match.category,
        },
        appealUrl,
        verifiedAt: now,
        verdictSignature,
        shareCard: {
          title: isBangla ? 'সতর্কতা: পর্যালোচনাধীন অভিযোগ' : 'NOTICE: Complaints Under Review',
          subtitle: `${masked} • ${match.category}`,
          badgeColor: 'amber',
          qrVerifyUrl: `https://trustcheck.sovereign.gov.bd/v/${verdictId}`,
        }
      };
    }

    // VERIFIED TIER
    const isBangla = locale === 'bn';
    return {
      verdictId,
      tier: 'VERIFIED',
      queryType,
      maskedQuery: masked,
      queryHash,
      headline: isBangla
        ? 'বিশ্বস্ত ও নিবন্ধিত: বৈধ ট্রাস্ট ব্যাজ ও ক্লিয়ারেন্স বিদ্যমান'
        : 'VERIFIED: Official registered business with valid Trust Badge',
      body: isBangla
        ? `${match.entityName || 'প্রতিষ্ঠানটি'} সরকারি কর্তৃপক্ষ ও ট্রাস্ট নেটওয়ার্কে যথাযথভাবে নিবন্ধিত। কোন খোলা নিষেধাজ্ঞা বা প্রতারণার রেকর্ড নেই।`
        : `${match.entityName || 'The business'} is officially registered with verified enterprise credentials. No active sanctions or consumer complaints.`,
      actionGuidance: isBangla
        ? 'এই প্রতিষ্ঠানে নিরাপদভাবে পেমেন্ট করা যেতে পারে। লেনদেনের ট্রানজেকশন আইডি সংরক্ষণ করুন।'
        : 'Safe to proceed with authorized transactions. Retain your digital payment receipt for escrow protections.',
      evidence: {
        confirmedReportCount: 0,
        unconfirmedComplaintCount: 0,
        primaryAuthorityName: match.authority,
        category: match.category,
        trustBadgeNumber: match.badgeNo,
        registrationNumber: match.regNo,
      },
      appealUrl,
      verifiedAt: now,
      verdictSignature,
      shareCard: {
        title: isBangla ? 'যাচাইকৃত বিশ্বস্ত প্রতিষ্ঠান' : 'VERIFIED: Sovereign Trust Shield',
        subtitle: `${match.entityName || masked} • ${match.badgeNo || 'Active Badge'}`,
        badgeColor: 'emerald',
        qrVerifyUrl: `https://trustcheck.sovereign.gov.bd/v/${verdictId}`,
      }
    };
  }

  private static composeUnknownVerdict(
    query: string,
    queryType: 'phone' | 'wallet' | 'website' | 'qr' | 'name',
    queryHash: string,
    locale: string,
    countryId: string
  ): TrustVerdict {
    const masked = appDeviceSecurityManager.maskQuery(query, queryType);
    const now = new Date().toISOString();
    const verdictId = `VRD-${countryId}-${Date.now().toString(36).toUpperCase()}`;
    const isBangla = locale === 'bn';

    const verdictSignature = crypto
      .createHmac('sha256', process.env.VERDICT_SIGNING_SECRET || (process.env.NODE_ENV === 'production' ? (() => { throw new Error('FATAL: VERDICT_SIGNING_SECRET must be set in production.'); })() : 'dev-only-verdict-secret-do-not-use-in-production'))
      .update(`${verdictId}:UNKNOWN:${queryHash}:${now}`)
      .digest('hex');

    return {
      verdictId,
      tier: 'UNKNOWN',
      queryType,
      maskedQuery: masked,
      queryHash,
      headline: isBangla
        ? 'কোন পূর্ব রেকর্ড পাওয়া যায়নি: সতর্কতার সাথে লেনদেন করুন'
        : 'No Prior Record Found: Exercise standard caution',
      body: isBangla
        ? 'এই অ্যাকাউন্ট বা লিঙ্কটির পূর্বে কোন অভিযোগ বা ট্রাস্ট ব্যাজ নিবন্ধন রেকর্ড নেই। নতুন বা অপরিচিত মার্চেন্ট হলে বাড়তি সতর্কতা অবলম্বন করুন।'
        : 'No complaints or official Trust Badge registrations found on the national ledger. If this is a new online merchant, proceed with standard consumer caution.',
      actionGuidance: isBangla
        ? 'আপনি কি এই নম্বর বা লিঙ্ক থেকে কোন প্রতারণার সম্মুখীন হয়েছেন? প্রথম ব্যক্তি হিসেবে ৬০ সেকেন্ডে রিপোর্ট করে অন্য নাগরিকদের সুরক্ষিত রাখুন।'
        : 'Encountered suspicious behavior with this party? Tap "Report Fraud" to log the initial advisory for the community.',
      evidence: {
        confirmedReportCount: 0,
        unconfirmedComplaintCount: 0,
        primaryAuthorityName: 'National Trust Registry',
        category: 'Unindexed Counterparty',
      },
      appealUrl: `/appeal-portal?ref=${verdictId}`,
      verifiedAt: now,
      verdictSignature,
      shareCard: {
        title: isBangla ? 'অনিবন্ধিত তথ্য' : 'UNKNOWN: No Ledger Record',
        subtitle: `${masked} • Proceed with caution`,
        badgeColor: 'slate',
        qrVerifyUrl: `https://trustcheck.sovereign.gov.bd/v/${verdictId}`,
      }
    };
  }

  private static composeRateLimitVerdict(query: string, queryType: any, reason: string): TrustVerdict {
    return {
      verdictId: 'ERR-RATE-LIMIT',
      tier: 'UNKNOWN',
      queryType,
      maskedQuery: '******',
      queryHash: '00000000',
      headline: 'Search Limit Exceeded',
      body: reason,
      actionGuidance: 'Please wait a moment before initiating another trust verification request.',
      evidence: {
        confirmedReportCount: 0,
        unconfirmedComplaintCount: 0,
        primaryAuthorityName: 'Anti-Abuse Gateway',
        category: 'Throttled',
      },
      appealUrl: '#',
      verifiedAt: new Date().toISOString(),
      verdictSignature: 'BLOCKED',
      shareCard: {
        title: 'Throttled Request',
        subtitle: 'Rate limit active',
        badgeColor: 'slate',
        qrVerifyUrl: '#',
      }
    };
  }

  private static recordCheckHistory(
    deviceId: string,
    queryType: 'phone' | 'wallet' | 'website' | 'qr' | 'name',
    queryHash: string,
    rawQuery: string,
    verdictTier: VerdictTier,
    countryId: string
  ) {
    const rec: AppCheckRecord = {
      id: `chk_${Date.now()}_${Math.random().toString(36).substring(2, 6)}`,
      deviceId,
      queryType,
      queryHash,
      rawSampleSanitized: appDeviceSecurityManager.maskQuery(rawQuery, queryType),
      verdictRef: `VRD_${verdictTier}`,
      verdictTier,
      countryId,
      createdAt: new Date().toISOString(),
    };
    this.checkHistory.unshift(rec);
    if (this.checkHistory.length > 500) {
      this.checkHistory.pop();
    }
  }

  public static getLiveCheckStream(): AppCheckRecord[] {
    return [...this.checkHistory];
  }
}
