import React, { useState } from 'react';
import { 
  ShieldAlert, 
  CheckCircle2, 
  Clock, 
  PhoneCall, 
  Copy, 
  Check, 
  FileText, 
  ExternalLink, 
  ChevronDown, 
  ChevronUp, 
  AlertTriangle, 
  LifeBuoy, 
  Download, 
  ArrowRight,
  ShieldCheck,
  Siren,
  Building2,
  Lock,
  Zap,
  Sparkles,
  Edit3,
  Eraser,
  StickyNote,
  X,
  Type,
  Plus
} from 'lucide-react';
import { PDFAnnotation, RedactionMask } from '../../types';

export interface RemediationRoadmapProps {
  category: string;
  referenceCode: string;
  targetNumber?: string;
  description?: string;
  location?: { district: string; lat: number; lng: number };
  locale?: 'bn' | 'en';
  onDownloadPdf?: (annotations: PDFAnnotation[], redactionMasks: RedactionMask[]) => void;
}

export interface RoadmapStep {
  id: number;
  titleBn: string;
  titleEn: string;
  urgencyBn: string;
  urgencyEn: string;
  urgencyLevel: 'critical' | 'high' | 'medium' | 'followup';
  timeframeBn: string;
  timeframeEn: string;
  descBn: string;
  descEn: string;
  actionType: 'call' | 'copy' | 'template' | 'link';
  hotline?: string;
  hotlineLabel?: string;
  linkUrl?: string;
  badgeLabelBn?: string;
  badgeLabelEn?: string;
}

interface CategoryData {
  categoryNameBn: string;
  categoryNameEn: string;
  icon: string;
  recoveryEstimateBn: string;
  recoveryEstimateEn: string;
  steps: RoadmapStep[];
}

const ROADMAP_DATABASE: Record<string, CategoryData> = {
  'Fake MFS Cash-Back / OTP Call': {
    categoryNameBn: 'এমএফএস ক্যাশব্যাক / ওটিপি প্রলোভন প্রতারণা',
    categoryNameEn: 'Fake MFS Cash-Back / OTP Call Scam',
    icon: 'Smartphone',
    recoveryEstimateBn: 'তাৎক্ষণিক সংবেদনশীল সময়: ১৫ মিনিট থেকে ১ ঘণ্টা',
    recoveryEstimateEn: 'Critical Time Window: 15 Mins to 1 Hour',
    steps: [
      {
        id: 1,
        titleBn: 'এমএফএস হেল্পলাইনে ফোন দিয়ে অ্যাকাউন্ট ও পিন লক করুন',
        titleEn: 'Call MFS Helpline & Emergency Lock Wallet / Reset PIN',
        urgencyBn: 'জরুরি - ১৫ মিনিটের মধ্যে',
        urgencyEn: 'Critical - Within 15 Mins',
        urgencyLevel: 'critical',
        timeframeBn: 'তাৎক্ষণিক действие',
        timeframeEn: 'Immediate Action',
        descBn: 'অবিলম্ব আপনার বিকাশ (16247), নগদ (16167) বা রকেট (16216) হেল্পলাইনে ফোন দিয়ে আপনার ওয়ালেট সাময়িক লক করুন এবং ট্রানজেকশন আইডিসহ রিপোর্ট করুন।',
        descEn: 'Immediately contact your MFS customer care (Global Mobile Wallet 16247, Digital Wallet 16167, MFS Wallet 16216) to request a temporary lock on your wallet and issue a PIN reset.',
        actionType: 'call',
        hotline: '16247',
        hotlineLabel: 'Global Mobile Wallet Helpline 16247'
      },
      {
        id: 2,
        titleBn: 'প্রতারকের এমএফএস ওয়ালেট ফ্রিজ ও রিফান্ড নোটিশ পাঠাল',
        titleEn: 'Issue Fraudulent Wallet Freeze & Reversal Claim',
        urgencyBn: 'উচ্চ অগ্রাধিকার - ১ ঘণ্টার মধ্যে',
        urgencyEn: 'High Priority - Within 1 Hour',
        urgencyLevel: 'high',
        timeframeBn: '১ ঘণ্টার মধ্যে',
        timeframeEn: 'Within 1 Hour',
        descBn: 'ট্রাস্টচেক রেফারেন্স কোড ও লেনদেন আইডি (TrxID) সহ এমএফএস কাস্টমার কেয়ার সেন্টারে লিখিত অভিযোগ জমা দিয়ে প্রতারকের ওয়ালেটের ক্যাশ-আউট বন্ধের আবেদন করুন।',
        descEn: 'Submit your TrustCheck tracking ref and transaction ID (TrxID) to the MFS provider to initiate a fraud hold on the culprit’s wallet before cash-out.',
        actionType: 'template'
      },
      {
        id: 3,
        titleBn: 'সিআইডি সাইবার পুলিশ হেল্পলাইনে (16216) অভিযোগ দাখিল',
        titleEn: 'Lodge Cyber Crime Complaint with CID Police (16216)',
        urgencyBn: 'জরুরি আইনি পদক্ষেপ - ২৪ ঘণ্টার মধ্যে',
        urgencyEn: 'Statutory Step - Within 24 Hours',
        urgencyLevel: 'medium',
        timeframeBn: '২৪ ঘণ্টার মধ্যে',
        timeframeEn: 'Within 24 Hours',
        descBn: 'সিআইডি সাইবার পুলিশ সেন্টারে (+8801730336431 / 16216) অথবা জাতীয় জরুরি সেবা ৯৯৯ এ কল করে ডিজিটাল জালিয়াতির আনুষ্ঠানিক কেস ফাইল নম্বর নিন।',
        descEn: 'Contact CID Cyber Police Center or Global Region National Helpline 999 to log the digital MFS fraud into police cyber unit database.',
        actionType: 'call',
        hotline: '16216',
        hotlineLabel: 'CID Cyber Police 16216'
      },
      {
        id: 4,
        titleBn: 'সংযুক্ত ব্যাংক ও সিম কার্ডের নিরাপত্তা লকডাউন',
        titleEn: 'Bank & Linked SIM Card Security Lockdown',
        urgencyBn: 'ফলো-আপ - ২৪-৪৮ ঘণ্টার মধ্যে',
        urgencyEn: 'Follow-up - Within 24-48 Hours',
        urgencyLevel: 'followup',
        timeframeBn: '৪৮ ঘণ্টার মধ্যে',
        timeframeEn: 'Within 48 Hours',
        descBn: 'এমএফএস এর সাথে যে ব্যাংক অ্যাকাউন্ট বা ক্রেডিট কার্ড লিংক করা ছিল, সংশ্লিষ্ট ব্যাংকের কার্ড ডিভিজিটে ফোন করে লিংকড অটো-ডেবিট স্থগিত রাখুন।',
        descEn: 'Notify your bank fraud department to temporarily disable linked auto-debits or internet banking features connected to your compromised MFS SIM.',
        actionType: 'template'
      }
    ]
  },
  'Online Shop Advance Money Scam': {
    categoryNameBn: 'অনলাইন শপ অগ্রিম টাকা প্রতারণা',
    categoryNameEn: 'Online Shop Advance Payment Scam',
    icon: 'ShoppingBag',
    recoveryEstimateBn: 'তাৎক্ষণিক সংবেদনশীল সময়: ৩০ মিনিট থেকে ২ ঘণ্টা',
    recoveryEstimateEn: 'Critical Time Window: 30 Mins to 2 Hours',
    steps: [
      {
        id: 1,
        titleBn: 'পেমেন্ট গেটওয়ে বা এমএফএস মারফত পেমেন্ট হোল্ড আবেদন',
        titleEn: 'MFS / Payment Gateway Merchant Fraud Payment Hold',
        urgencyBn: 'জরুরি - ৩০ মিনিটের মধ্যে',
        urgencyEn: 'Critical - Within 30 Mins',
        urgencyLevel: 'critical',
        timeframeBn: '৩০ মিনিটের মধ্যে',
        timeframeEn: 'Within 30 Mins',
        descBn: 'অনলাইন পেজ বা মার্চেন্ট অ্যাকাউন্টে পাঠানো টাকার পেমেন্ট রসিদ এবং ট্রাস্টচেক ট্র্যাকিং রেফারেন্স দিয়ে এমএফএস মার্চেন্ট হেল্পডেস্কে পেমেন্ট পেআউট হোল্ড করতে বলুন।',
        descEn: 'Immediately contact the payment gateway or MFS merchant desk with your payment receipt and TrustCheck ref to request a fraud hold on merchant payout.',
        actionType: 'call',
        hotline: '16247',
        hotlineLabel: 'MFS Merchant Help 16247'
      },
      {
        id: 2,
        titleBn: 'ফেসবুক পেজ / ওয়েবসাইটের ডোমেইন টেকডাউন নোটিশ দাখিল',
        titleEn: 'Report Scammer Facebook Page / Website for Takedown',
        urgencyBn: 'উচ্চ অগ্রাধিকার - ১২ ঘণ্টার মধ্যে',
        urgencyEn: 'High Priority - Within 12 Hours',
        urgencyLevel: 'high',
        timeframeBn: '১২ ঘণ্টার মধ্যে',
        timeframeEn: 'Within 12 Hours',
        descBn: 'প্রতারক পেজের ইউআরএল এবং আপনার ট্রাস্টচেক রিপোর্ট লিংকটি বিটিআরসি ই-কমার্স সাইবার সেল এবং মেটা সাইবার প্যাট্রোলে ফিশিং/ফ্রড হিসেবে ফ্ল্যাগ করুন।',
        descEn: 'Submit the scammer’s Facebook page URL and TrustCheck report link to Telecom Regulatory Authority E-commerce Cyber Cell and Meta Anti-Fraud to trigger page takedown.',
        actionType: 'link',
        linkUrl: 'https://btrc.gov.bd'
      },
      {
        id: 3,
        titleBn: 'জাতীয় ভোক্তা-অধিকার সংরক্ষণ অধিদপ্তরে (DNCRP) অভিযোগ',
        titleEn: 'File Fraud Complaint with National Consumer Rights (16121)',
        urgencyBn: 'আইনি অধিকার - ৪৮ ঘণ্টার মধ্যে',
        urgencyEn: 'Consumer Law - Within 48 Hours',
        urgencyLevel: 'medium',
        timeframeBn: '৪৮ ঘণ্টার মধ্যে',
        timeframeEn: 'Within 48 Hours',
        descBn: 'জাতীয় ভোক্তা-অধিকার সংরক্ষণ অধিদপ্তরে (হটলাইন ১৬১২১ / ইমেইল ncrp@dncrp.gov.bd) ই-কমার্স জালিয়াতির আনুষ্ঠানিক ই-অভিযোগ দাখিল করুন।',
        descEn: 'Lodge an official consumer rights violation claim with DNCRP (Hotline: 16121 / email: ncrp@dncrp.gov.bd) referencing your payment proof.',
        actionType: 'call',
        hotline: '16121',
        hotlineLabel: 'Consumer Rights 16121'
      },
      {
        id: 4,
        titleBn: 'নিকটস্থ থানায় অনলাইন ই-জিডি (e-GD) দাখিল করুন',
        titleEn: 'File e-GD / General Diary at Local Police Station',
        urgencyBn: 'ফলো-আপ - ৩ দিনের মধ্যে',
        urgencyEn: 'Follow-up - Within 3 Days',
        urgencyLevel: 'followup',
        timeframeBn: '৩ দিনের মধ্যে',
        timeframeEn: 'Within 3 Days',
        descBn: 'অনলাইন জিডি পোর্টালে (gd.police.gov.bd) অথবা স্থানীয় থানায় গিয়ে পেজ লিংক, ফোন নম্বর ও ট্রানজেকশন আইডিসহ একটি জিডি করুন।',
        descEn: 'File an e-GD or physical General Diary at your nearest police station providing the fraudulent seller number, page link, and payment slip.',
        actionType: 'template'
      }
    ]
  },
  'Fake Overseas Job / Visa Trap': {
    categoryNameBn: 'ভুয়া বিদেশ যাত্রা / ভিসা ট্র্যাপ',
    categoryNameEn: 'Fake Overseas Job / Visa Fraud',
    icon: 'Briefcase',
    recoveryEstimateBn: 'তাৎক্ষণিক সংবেদনশীল সময়: ২ ঘণ্টা থেকে ২৪ ঘণ্টা',
    recoveryEstimateEn: 'Critical Time Window: 2 Hours to 24 Hours',
    steps: [
      {
        id: 1,
        titleBn: 'বিএমইটি (BMET) ও প্রবাসী কল্যাণ মন্ত্রণালয়ে মানবপাচার ফ্রড রিপোর্ট',
        titleEn: 'Report Unlicensed Recruiting Agency to BMET Helpline',
        urgencyBn: 'জরুরি - অবিলম্ব পদক্ষেপ',
        urgencyEn: 'Critical - Immediate Action',
        urgencyLevel: 'critical',
        timeframeBn: 'অবিলম্ব',
        timeframeEn: 'Immediate',
        descBn: 'জনশক্তি কর্মসংস্থান ও প্রশিক্ষণ ব্যুরো (BMET) এবং প্রবাসী কল্যাণ ব্যাংকের সাইবার কমপ্লেন সেলে অবৈধ আদম ব্যবসায়ী/দালালের তথ্য দিন।',
        descEn: 'Report the unlicensed overseas recruiting middleman/agency to Bureau of Manpower Employment and Training (BMET) grievance desk.',
        actionType: 'call',
        hotline: '16358',
        hotlineLabel: 'BMET Helpline 16358'
      },
      {
        id: 2,
        titleBn: 'ব্যাংক পে-অর্ডার / অ্যাকাউন্ট ফান্ড রিকল নোটিশ জেনারেট করুন',
        titleEn: 'Generate Bank Transfer Recall & Stop-Payment Notice',
        urgencyBn: 'উচ্চ অগ্রাধিকার - ২ ঘণ্টার মধ্যে',
        urgencyEn: 'High Priority - Within 2 Hours',
        urgencyLevel: 'high',
        timeframeBn: '২ ঘণ্টার মধ্যে',
        timeframeEn: 'Within 2 Hours',
        descBn: 'দালাল বা ভুয়া এজেন্সির ব্যাংক অ্যাকাউন্টে টাকা পাঠিয়ে থাকলে স্বশরীরে ব্যাংকে গিয়ে "ফান্ড রিকল ও ব্যাংক অ্যাকাউন্ট ফ্রিজ" এর জরুরি আবেদন দিন।',
        descEn: 'Request your bank to issue an urgent stop-payment or fund recall request for funds transferred into the fraudulent recruiter’s account.',
        actionType: 'template'
      },
      {
        id: 3,
        titleBn: 'সিআইডি মানব পাচার ও সাইবার ফ্রড ডিভিশনে মামলা ফাইল',
        titleEn: 'Lodge Human Trafficking & Visa Fraud Case with CID',
        urgencyBn: 'আইনি পদক্ষেপ - ২৪ ঘণ্টার মধ্যে',
        urgencyEn: 'Legal Action - Within 24 Hours',
        urgencyLevel: 'medium',
        timeframeBn: '২৪ ঘণ্টার মধ্যে',
        timeframeEn: 'Within 24 Hours',
        descBn: 'সিআইডি অর্গানাইজড ক্রাইম মানবপাচার উইংয়ে জালিয়াতি চক্রের বিরুদ্ধে ট্রাস্টচেক রিপোর্ট ও পাসপোর্ট ফটোকপিসহ আনুষ্ঠানিক অভিযোগ পত্র দাখিল করুন।',
        descEn: 'File a formal fraud complaint with the CID Organized Crime Human Trafficking Wing with your TrustCheck dossier and visa receipts.',
        actionType: 'call',
        hotline: '16216',
        hotlineLabel: 'CID Police 16216'
      }
    ]
  },
  'Telegram / YouTube Like Job': {
    categoryNameBn: 'টেলিগ্রাম / ইউটিউব লাইক জব ট্র্যাপ',
    categoryNameEn: 'Telegram / YouTube Task Scam',
    icon: 'MessageSquare',
    recoveryEstimateBn: 'তাৎক্ষণিক সংবেদনশীল সময়: ১ ঘণ্টা থেকে ১২ ঘণ্টা',
    recoveryEstimateEn: 'Critical Time Window: 1 Hour to 12 Hours',
    steps: [
      {
        id: 1,
        titleBn: 'গন্তব্য এমএফএস ওয়ালেট বা ক্রিপ্টো অ্যাড্রেস ফ্রিজ রিকোয়েস্ট',
        titleEn: 'Freeze Target MFS Agent / Crypto Wallet Address',
        urgencyBn: 'জরুরি - ১ ঘণ্টার মধ্যে',
        urgencyEn: 'Critical - Within 1 Hour',
        urgencyLevel: 'critical',
        timeframeBn: '১ ঘণ্টার মধ্যে',
        timeframeEn: 'Within 1 Hour',
        descBn: 'টেলিগ্রাম অ্যাডমিন যে বিকাশ/নগদ পার্সোনাল বা এজেন্ট নম্বরে রিচার্জ বা বিনিয়োগ নিয়েছে, সেই ওয়ালেটটিতে সাইবার ফ্রড ফ্ল্যাগ চালু করুন।',
        descEn: 'Report the destination MFS agent/personal wallet or Binance/TRC-20 crypto wallet used by the Telegram task admin to freeze further transfers.',
        actionType: 'call',
        hotline: '16247',
        hotlineLabel: 'MFS Helpline 16247'
      },
      {
        id: 2,
        titleBn: 'টেলিগ্রাম চ্যানেল ও গ্রুপের বিরুদ্ধে অ্যাবিউজ রিপোর্ট (abuse@telegram.org)',
        titleEn: 'File Telegram Channel Abuse Takedown Notice',
        urgencyBn: 'উচ্চ অগ্রাধিকার - ৬ ঘণ্টার মধ্যে',
        urgencyEn: 'High Priority - Within 6 Hours',
        urgencyLevel: 'high',
        timeframeBn: '৬ ঘণ্টার মধ্যে',
        timeframeEn: 'Within 6 Hours',
        descBn: 'টেলিগ্রাম চ্যানেল লিংক ও অ্যাডমিনের ইউজার আইডিসহ abuso@telegram.org এ স্ক্রিনশট ও ট্রাস্টচেক ট্র্যাকিং রেফারেন্স ইমেইল করুন।',
        descEn: 'Send a formal scam report with group link and admin User ID to Telegram Anti-Fraud Team (abuse@telegram.org) referencing your TrustCheck ID.',
        actionType: 'template'
      },
      {
        id: 3,
        titleBn: 'বিএফআইইউ (BFIU) সন্দেহজনক মানিলন্ডারিং রিপোর্ট (SAR)',
        titleEn: 'Submit Suspicious Activity Report (SAR) to BFIU',
        urgencyBn: 'আইনি রেকর্ড - ২৪ ঘণ্টার মধ্যে',
        urgencyEn: 'Legal Record - Within 24 Hours',
        urgencyLevel: 'medium',
        timeframeBn: '২৪ ঘণ্টার মধ্যে',
        timeframeEn: 'Within 24 Hours',
        descBn: 'বাংলাদেশ ফাইন্যান্সিয়াল ইন্টেলিজেন্স ইউনিটের (BFIU) অনলাইন পোর্টালে অননুমোদিত পঞ্জি ও টাস্ক স্কিমের আর্থিক তথ্য রিপোর্ট করুন।',
        descEn: 'Lodge a Suspicious Activity Report (SAR) with Global Region Financial Intelligence Unit (BFIU) regarding the illegal Ponzi task network.',
        actionType: 'link',
        linkUrl: 'https://www.bb.org.bd/bfiu'
      }
    ]
  },
  'Phishing Link / Website': {
    categoryNameBn: 'ফিশিং লিংক / ভুয়া ওয়েবসাইট',
    categoryNameEn: 'Phishing Link / Malicious Website',
    icon: 'Globe',
    recoveryEstimateBn: 'তাৎক্ষণিক সংবেদনশীল সময়: ১০ মিনিট থেকে ১ ঘণ্টা',
    recoveryEstimateEn: 'Critical Time Window: 10 Mins to 1 Hour',
    steps: [
      {
        id: 1,
        titleBn: 'সকল পাসওয়ার্ড পরিবর্তন ও একটিভ সেশন আউট করুন',
        titleEn: 'Reset Compromised Passwords & Revoke Active Sessions',
        urgencyBn: 'জরুরি - ১০ মিনিটের মধ্যে',
        urgencyEn: 'Critical - Within 10 Mins',
        urgencyLevel: 'critical',
        timeframeBn: '১০ মিনিটের মধ্যে',
        timeframeEn: 'Within 10 Mins',
        descBn: 'ফিশিং লিংকে যে ইমেইল বা ব্যাংকিং তথ্য ইনপুট দিয়েছিলেন, অবিলম্বে অন্য একটি নিরাপদ ডিভাইস থেকে সেটির পাসওয়ার্ড বদলে ২FA চালু করুন।',
        descEn: 'Immediately change passwords and enable Two-Factor Authentication (2FA) for email, Facebook, or banking apps accessed on that device.',
        actionType: 'template'
      },
      {
        id: 2,
        titleBn: 'বিটিআরসি (BD-CERT) ও গুগল সেফ ব্রাউজিংয়ে ডোমেইন ব্লকিং দাবি',
        titleEn: 'Report Phishing URL to Telecom Regulatory Authority (BD-CERT) & Google Safe Browsing',
        urgencyBn: 'উচ্চ অগ্রাধিকার - ১ ঘণ্টার মধ্যে',
        urgencyEn: 'High Priority - Within 1 Hour',
        urgencyLevel: 'high',
        timeframeBn: '১ ঘণ্টার মধ্যে',
        timeframeEn: 'Within 1 Hour',
        descBn: 'ক্ষতিকর ফিশিং লিংকটি বিটিআরসি সাইবার ইমার্জেন্সি রেসপন্স টিম (BD-CERT) এবং গুগল সেফ ব্রাউজিংয়ে জমা দিন যাতে ব্রাউজার সরাসরি ব্লক করে।',
        descEn: 'Submit the phishing URL to Telecom Regulatory Authority BD-CERT and Google Anti-Phishing database to trigger browser-wide red warning splash screens for citizens.',
        actionType: 'link',
        linkUrl: 'https://www.cirt.gov.bd'
      },
      {
        id: 3,
        titleBn: 'ডিভাইসে ক্ষতিকর এপিকে (APK) বা ম্যালওয়্যার স্ক্যান চালান',
        titleEn: 'Run Device Spyware & Malicious APK Security Scan',
        urgencyBn: 'নিরাপত্তা নিশ্চিতকরণ - ২ ঘণ্টার মধ্যে',
        urgencyEn: 'Device Safety - Within 2 Hours',
        urgencyLevel: 'medium',
        timeframeBn: '২ ঘণ্টার মধ্যে',
        timeframeEn: 'Within 2 Hours',
        descBn: 'লিংক থেকে কোন ভুয়া অ্যাপ ডাউনলোড হয়ে থাকলে আপনার অ্যান্ড্রয়েড ফোনে অ্যান্টিভাইরাস দিয়ে ডীপ স্ক্যান করুন এবং অপরিচিত এপিকে ডিলিট করুন।',
        descEn: 'Run a deep antivirus scan on your phone to identify and uninstall any background spyware or unauthorized APKs installed via the link.',
        actionType: 'template'
      }
    ]
  },
  'Courier Fake Tracking Charge': {
    categoryNameBn: 'কুরিয়ার পার্সেল ভুয়া চার্জ প্রতারণা',
    categoryNameEn: 'Courier Fake Parcel COD Scam',
    icon: 'Package',
    recoveryEstimateBn: 'তাৎক্ষণিক সংবেদনশীল সময়: ৩০ মিনিট থেকে ৩ ঘণ্টা',
    recoveryEstimateEn: 'Critical Time Window: 30 Mins to 3 Hours',
    steps: [
      {
        id: 1,
        titleBn: 'কুরিয়ার হেল্পলাইনে কল দিয়ে পেমেন্ট ডিসবার্সমেন্ট স্থগিত করুন',
        titleEn: 'Halt Courier Merchant Payment Disbursement Immediately',
        urgencyBn: 'জরুরি - ৩০ মিনিটের মধ্যে',
        urgencyEn: 'Critical - Within 30 Mins',
        urgencyLevel: 'critical',
        timeframeBn: '৩০ মিনিটের মধ্যে',
        timeframeEn: 'Within 30 Mins',
        descBn: 'কুরিয়ার সার্ভিসে (স্টিডফাস্ট/পেপারফ্লাই/পাঠাও/সুন্দরবন) ট্র্যাকিং আইডিসহ অবিলম্বে কল দিয়ে ভুয়া সেলারের মার্চেন্ট পেআউট হোল্ড করতে বলুন।',
        descEn: 'Call the courier helpline (e.g. Steadfast, Paperfly, Pathao, Sundarban) with parcel tracking ID to hold COD payout to fraudulent merchant.',
        actionType: 'call',
        hotline: '09610001000',
        hotlineLabel: 'Courier Fraud Cell'
      },
      {
        id: 2,
        titleBn: 'মার্চেন্ট অ্যাকাউন্ট ব্ল্যাকলিস্ট ও ট্রানজেকশন ফ্রিজ আবেদন',
        titleEn: 'Submit Merchant Blacklist Claim to Courier Headquarters',
        urgencyBn: 'উচ্চ অগ্রাধিকার - ২ ঘণ্টার মধ্যে',
        urgencyEn: 'High Priority - Within 2 Hours',
        urgencyLevel: 'high',
        timeframeBn: '২ ঘণ্টার মধ্যে',
        timeframeEn: 'Within 2 Hours',
        descBn: 'ভুয়া পার্সেলের ছবি ও ট্রাস্টচেক ট্র্যাকিং কোডসহ কুরিয়ারের ফ্রড সেকশনে মেইল পাঠান যাতে প্রতারক মার্চেন্টের সাথে তাদের চুক্তি বাতিল হয়।',
        descEn: 'Email photos of fraudulent parcel content and TrustCheck verification ref to courier fraud division to blacklist the merchant ID permanently.',
        actionType: 'template'
      },
      {
        id: 3,
        titleBn: 'ভোক্তা অধিকার (DNCRP) ও স্থানীয় থানায় জিডি দাখিল',
        titleEn: 'File Consumer Protection Violation Claim & Local GD',
        urgencyBn: 'আইনি ব্যবস্থা - ৪৮ ঘণ্টার মধ্যে',
        urgencyEn: 'Legal Action - Within 48 Hours',
        urgencyLevel: 'medium',
        timeframeBn: '৪৮ ঘণ্টার মধ্যে',
        timeframeEn: 'Within 48 Hours',
        descBn: 'অননুমোদিত সিওডি (COD) চার্জ আদায় এবং খালি বা ইট-বালি ভর্তি পার্সেল পাঠানোর অপরাধে ভোক্তা অধিকার দপ্তরে লিখিত অভিযোগ দিন।',
        descEn: 'Lodge a formal consumer rights complaint against the merchant for delivering fraudulent COD parcels and misrepresenting contents.',
        actionType: 'call',
        hotline: '16121',
        hotlineLabel: 'DNCRP Helpline 16121'
      }
    ]
  }
};

// Fallback category roadmap
const DEFAULT_ROADMAP: CategoryData = {
  categoryNameBn: 'সাইবার ও ডিজিটাল আর্থিক জালিয়াতি',
  categoryNameEn: 'General Cyber & Financial Scam',
  icon: 'ShieldAlert',
  recoveryEstimateBn: 'তাৎক্ষণিক সংবেদনশীল সময়: ১ ঘণ্টা থেকে ২৪ ঘণ্টা',
  recoveryEstimateEn: 'Critical Time Window: 1 Hour to 24 Hours',
  steps: [
    {
      id: 1,
      titleBn: 'জরুরি অ্যাকাউন্ট ও পেমেন্ট ওয়ালেট ফ্রিজ রিকোয়েস্ট',
      titleEn: 'Request Immediate Account & Payment Wallet Freeze',
      urgencyBn: 'জরুরি - ৩০ মিনিটের মধ্যে',
      urgencyEn: 'Critical - Within 30 Mins',
      urgencyLevel: 'critical',
      timeframeBn: '৩০ মিনিটের মধ্যে',
      timeframeEn: 'Within 30 Mins',
      descBn: 'সংশ্লিষ্ট এমএফএস বা ব্যাংক হেল্পলাইনে কল দিয়ে প্রতারণামূলক লেনদেনের টাকা ট্রান্সফার বন্ধের জন্য ট্রাস্টচেক ট্র্যাকিং কোডসহ দাবি জানান।',
      descEn: 'Contact your bank or MFS helpline immediately to log a transaction dispute and request a temporary hold on the destination account.',
      actionType: 'call',
      hotline: '16216',
      hotlineLabel: 'National Cyber Helpline 16216'
    },
    {
      id: 2,
      titleBn: 'সিআইডি সাইবার পুলিশ ও বিটিআরসি (100 / 999) রিপোর্ট',
      titleEn: 'File Incident Report with Cyber Police & Telecom Regulatory Authority (100 / 999)',
      urgencyBn: 'উচ্চ অগ্রাধিকার - ১২ ঘণ্টার মধ্যে',
      urgencyEn: 'High Priority - Within 12 Hours',
      urgencyLevel: 'high',
      timeframeBn: '১২ ঘণ্টার মধ্যে',
      timeframeEn: 'Within 12 Hours',
      descBn: 'জাতীয় জরুরি সেবা ৯৯৯ বা বিটিআরসি হেল্পলাইন ১০০ তে যোগাযোগ করে প্রতারকের ফোন নম্বর এবং ডিজিটাল লিংকটি ব্ল্যাকলিস্ট করুন।',
      descEn: 'Lodge a formal incident log with Telecom Regulatory Authority Helpline 100 or CID Police to blacklist the scammer number across national telecom operators.',
      actionType: 'call',
      hotline: '999',
      hotlineLabel: 'National Emergency 999'
    },
    {
      id: 3,
      titleBn: 'নিকটস্থ থানায় অনলাইন জিডি (e-GD) এবং আইনি অভিযোগ',
      titleEn: 'File General Diary (e-GD) at Nearest Police Station',
      urgencyBn: 'আইনি রেকর্ড - ৪৮ ঘণ্টার মধ্যে',
      urgencyEn: 'Legal Record - Within 48 Hours',
      urgencyLevel: 'medium',
      timeframeBn: '৪৮ ঘণ্টার মধ্যে',
      timeframeEn: 'Within 48 Hours',
      descBn: 'আপনার এলাকায় থানায় ই-জিডি সম্পন্ন করে ট্রাস্টচেক রিপোর্টের সার্টিফাইড প্রিন্ট কপি আবেদনের সাথে জমা দিন।',
      descEn: 'File an e-GD or physical General Diary at your local police station providing transaction screenshots and TrustCheck ref certificate.',
      actionType: 'template'
    }
  ]
};

export const RemediationRoadmap: React.FC<RemediationRoadmapProps> = ({
  category,
  referenceCode,
  targetNumber = 'N/A',
  description = 'Grievance incident logged',
  location,
  locale = 'bn',
  onDownloadPdf
}) => {
  const [completedSteps, setCompletedSteps] = useState<number[]>([]);
  const [expandedStep, setExpandedStep] = useState<number | null>(1);
  const [showDisputeModal, setShowDisputeModal] = useState(false);
  const [copiedTemplate, setCopiedTemplate] = useState(false);
  const [copiedHotline, setCopiedHotline] = useState<string | null>(null);

  // PDF Customization State
  const [redactTarget, setRedactTarget] = useState(false);
  const [customNote, setCustomNote] = useState('');

  // Match database entry
  const matchedData = ROADMAP_DATABASE[category] || DEFAULT_ROADMAP;
  const isBn = locale === 'bn';

  const totalSteps = matchedData.steps.length;
  const completedCount = completedSteps.length;
  const progressPercent = Math.round((completedCount / totalSteps) * 100);

  const toggleStepCompleted = (stepId: number, e: React.MouseEvent) => {
    e.stopPropagation();
    if (completedSteps.includes(stepId)) {
      setCompletedSteps(prev => prev.filter(id => id !== stepId));
    } else {
      setCompletedSteps(prev => [...prev, stepId]);
    }
  };

  // Generate standardized formal dispute text
  const generatedDisputeNotice = `=====================================================
[STATUTORY ASSET FREEZE & DISPUTE NOTICE]
=====================================================
Tracking Reference Code : ${referenceCode}
Grievance Category      : ${category}
Suspect Target Number   : ${targetNumber}
Date & Time Logged      : ${new Date().toLocaleString(isBn ? 'bn-BD' : 'en-US')}
Geo-Fenced Cluster      : ${location ? `${location.district} (${location.lat}°N, ${location.lng}°E)` : 'BD National Cluster'}

TO: Fraud Risk Management Unit / Customer Care / CID Cyber Police
SUBJECT: Urgent Request for Fraudulent Asset Hold & Account Lock

I am submitting an emergency fraud dispute regarding an unauthorized transaction or cyber trap.
Suspect Target Number/Account: ${targetNumber}
Grievance Brief: ${description}

STATUTORY DEMAND:
Under Global Region Bank Anti-Money Laundering Regulations and Telecom Regulatory Authority Cyber Security Guidelines, I request an immediate temporary hold / freeze on the suspect wallet/account to prevent asset dissipation.

Report Verified & Anchored in TrustCheck BD Regulatory Grievance Database:
Verification URL: https://trustcheck.bd/report/${referenceCode}

Requested Action:
1. Freeze destination wallet / account pending investigation.
2. Issue an official dispute token for law enforcement submission.
3. Share audit logs with CID Cyber Police Center.

Submitted by Victim via TrustCheck BD Citizen Grievance Portal
Ref: ${referenceCode}
=====================================================`;

  const handleCopyNotice = () => {
    navigator.clipboard.writeText(generatedDisputeNotice);
    setCopiedTemplate(true);
    setTimeout(() => setCopiedTemplate(false), 3000);
  };

  const handleCopyHotline = (hotline: string) => {
    navigator.clipboard.writeText(hotline);
    setCopiedHotline(hotline);
    setTimeout(() => setCopiedHotline(null), 2500);
  };

  const getUrgencyBadge = (level: string, labelBn: string, labelEn: string) => {
    switch (level) {
      case 'critical':
        return (
          <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-rose-500/10 text-rose-600 dark:text-rose-400 border border-rose-500/20 flex items-center gap-1 shrink-0 animate-pulse">
            <Siren className="w-3 h-3 text-rose-500" />
            {isBn ? labelBn : labelEn}
          </span>
        );
      case 'high':
        return (
          <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-amber-500/10 text-amber-700 dark:text-amber-400 border border-amber-500/20 flex items-center gap-1 shrink-0">
            <Clock className="w-3 h-3 text-amber-500" />
            {isBn ? labelBn : labelEn}
          </span>
        );
      case 'medium':
        return (
          <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-indigo-500/10 text-indigo-700 dark:text-indigo-400 border border-indigo-500/20 flex items-center gap-1 shrink-0">
            <ShieldCheck className="w-3 h-3 text-indigo-500" />
            {isBn ? labelBn : labelEn}
          </span>
        );
      default:
        return (
          <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-slate-500/10 text-slate-700 dark:text-slate-400 border border-slate-500/20 flex items-center gap-1 shrink-0">
            <FileText className="w-3 h-3 text-slate-500" />
            {isBn ? labelBn : labelEn}
          </span>
        );
    }
  };

  const handleFinalDownload = () => {
    const finalAnnotations: PDFAnnotation[] = [];
    const finalRedactions: RedactionMask[] = [];

    if (redactTarget) {
      // Suspect info section is around Y=75 in the PDF
      finalRedactions.push({ x: 60, y: 72, width: 60, height: 5, label: 'CONFIDENTIAL' });
    }

    if (customNote) {
      finalAnnotations.push({ 
        text: `Admin Note: ${customNote}`, 
        x: 20, 
        y: 250, 
        fontSize: 10, 
        color: 'blue',
        bold: true 
      });
    }

    if (onDownloadPdf) {
      onDownloadPdf(finalAnnotations, finalRedactions);
    }
  };

  return (
    <div className="w-full max-w-2xl mx-auto my-4 text-left space-y-4 font-sans">
      {/* HEADER CARD */}
      <div className="p-5 rounded-3xl bg-gradient-to-br from-slate-900 via-indigo-950 to-slate-900 text-white border border-indigo-500/30 shadow-xl relative overflow-hidden">
        {/* Background Accent Glow */}
        <div className="absolute top-0 right-0 w-48 h-48 bg-indigo-500/10 rounded-full blur-3xl pointer-events-none" />

        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-indigo-900/60">
          <div>
            <div className="flex items-center gap-2 mb-1">
              <span className="px-2.5 py-0.5 rounded-full text-[10px] font-mono font-bold bg-indigo-500/20 text-indigo-300 border border-indigo-500/30 flex items-center gap-1">
                <LifeBuoy className="w-3 h-3 text-indigo-400" />
                {isBn ? 'সম্পদ উদ্ধার ও রেমিডিয়েশন রোডম্যাপ' : 'Victim Asset Recovery Roadmap'}
              </span>
              <span className="px-2 py-0.5 rounded-md text-[10px] font-mono font-bold bg-amber-500/20 text-amber-300 border border-amber-500/30">
                Ref: {referenceCode}
              </span>
            </div>
            <h3 className="text-base font-black text-white flex items-center gap-2">
              <span>{isBn ? matchedData.categoryNameBn : matchedData.categoryNameEn}</span>
            </h3>
            <p className="text-xs text-indigo-200/80 mt-0.5 flex items-center gap-1 font-mono">
              <Clock className="w-3.5 h-3.5 text-amber-400 shrink-0" />
              <span>{isBn ? matchedData.recoveryEstimateBn : matchedData.recoveryEstimateEn}</span>
            </p>
          </div>

          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={() => setShowDisputeModal(true)}
              className="self-start sm:self-auto px-3.5 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-xs flex items-center gap-1.5 shadow-lg shadow-indigo-600/20 transition-all cursor-pointer border border-indigo-400/30 shrink-0"
            >
              <Zap className="w-3.5 h-3.5 text-amber-200 fill-amber-200" />
              <span>{isBn ? 'অভিযোগ নোটিশ টেমপ্লেট' : 'Dispute Notice Template'}</span>
            </button>

            <button
              type="button"
              onClick={handleFinalDownload}
              className="self-start sm:self-auto px-3.5 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs flex items-center gap-1.5 shadow-lg shadow-emerald-500/20 transition-all cursor-pointer border border-emerald-400/30 shrink-0"
            >
              <Download className="w-3.5 h-3.5" />
              <span>{isBn ? 'পিডিএফ রিপোর্ট' : 'Download PDF'}</span>
            </button>
          </div>
        </div>

        {/* PROGRESS TRACKER BAR */}
        <div className="mt-4 pt-1 space-y-2">
          <div className="flex items-center justify-between text-xs">
            <span className="font-bold text-slate-300 flex items-center gap-1.5">
              <CheckCircle2 className="w-4 h-4 text-emerald-400" />
              <span>{isBn ? 'উদ্ধার পদক্ষেপ অগ্রগতি' : 'Asset Recovery Progress'}</span>
              <span className="text-indigo-300 font-mono text-[11px]">
                ({completedCount}/{totalSteps} {isBn ? 'ধাপ সম্পন্ন' : 'Steps Complete'})
              </span>
            </span>
            <span className="font-mono font-black text-emerald-400 text-xs">
              {progressPercent}%
            </span>
          </div>

          <div className="w-full h-2.5 bg-slate-800 rounded-full overflow-hidden p-0.5 border border-indigo-900/50">
            <div
              className="h-full bg-gradient-to-r from-amber-400 via-indigo-400 to-emerald-400 rounded-full transition-all duration-500 shadow-sm"
              style={{ width: `${progressPercent}%` }}
            />
          </div>

          {completedCount === totalSteps && (
            <p className="text-[11px] text-emerald-300 font-bold flex items-center gap-1 pt-1 animate-pulse">
              <Sparkles className="w-3.5 h-3.5 text-emerald-400" />
              <span>
                {isBn 
                  ? 'অভিনন্দন! আপনি সকল সংবেদনশীল উদ্ধার পদক্ষেপ সম্পন্ন করেছেন।' 
                  : 'All critical asset recovery steps completed! Monitor reference status.'}
              </span>
            </p>
          )}
        </div>
      </div>

      {/* PDF CUSTOMIZATION LAYER */}
      <div className="p-4 rounded-2xl bg-indigo-50/50 dark:bg-indigo-950/20 border border-indigo-200 dark:border-indigo-800/60 space-y-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Edit3 className="w-4 h-4 text-indigo-600 dark:text-indigo-400" />
            <h4 className="text-xs font-bold text-slate-800 dark:text-slate-200 uppercase tracking-wider">
              {isBn ? 'পিডিএফ রিপোর্ট কাস্টমাইজেশন' : 'PDF Report Customization'}
            </h4>
          </div>
          <span className="px-2 py-0.5 rounded text-[9px] font-bold bg-indigo-100 dark:bg-indigo-900 text-indigo-700 dark:text-indigo-300 border border-indigo-200 dark:border-indigo-800">
            {isBn ? 'বেটা ফিচার' : 'BETA FEATURE'}
          </span>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div className="space-y-2">
            <label className="flex items-center gap-2 cursor-pointer group">
              <div 
                onClick={() => setRedactTarget(!redactTarget)}
                className={`w-10 h-5 rounded-full transition-all relative ${redactTarget ? 'bg-indigo-600' : 'bg-slate-300 dark:bg-slate-700'}`}
              >
                <div className={`absolute top-1 w-3 h-3 rounded-full bg-white transition-all ${redactTarget ? 'left-6' : 'left-1'}`} />
              </div>
              <span className="text-[11px] font-bold text-slate-700 dark:text-slate-300 flex items-center gap-1.5">
                <Eraser className="w-3.5 h-3.5 text-slate-400" />
                {isBn ? 'প্রতারকের নম্বর গোপন করুন (Redact)' : 'Redact Suspect Identifier'}
              </span>
            </label>
            <p className="text-[10px] text-slate-500 pl-12 leading-tight">
              {isBn ? 'নিরাপত্তার স্বার্থে প্রতারকের মোবাইল নম্বর বা ইউআরএল ব্ল্যাক আউট করা হবে।' : 'Suspect ID will be blacked out in the final PDF for privacy compliance.'}
            </p>
          </div>

          <div className="space-y-2">
            <div className="flex items-center gap-2">
              <StickyNote className="w-3.5 h-3.5 text-slate-400" />
              <span className="text-[11px] font-bold text-slate-700 dark:text-slate-300">
                {isBn ? 'কাস্টম নোট যোগ করুন' : 'Add Custom Annotation'}
              </span>
            </div>
            <div className="relative">
              <textarea
                value={customNote}
                onChange={(e) => setCustomNote(e.target.value)}
                placeholder={isBn ? 'তদন্তের জন্য অতিরিক্ত কোনো তথ্য এখানে লিখুন...' : 'Add any additional notes for investigators here...'}
                className="w-full px-3 py-2 rounded-xl bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-[11px] focus:ring-2 focus:ring-indigo-500 focus:outline-none min-h-[60px] resize-none"
              />
              {customNote && (
                <button 
                  onClick={() => setCustomNote('')}
                  className="absolute right-2 top-2 p-1 rounded-full hover:bg-slate-100 dark:hover:bg-slate-700 text-slate-400"
                >
                  <X className="w-3 h-3" />
                </button>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* ROADMAP STEPS LIST */}
      <div className="space-y-2.5">
        <div className="flex items-center justify-between text-xs px-1">
          <span className="font-bold text-slate-700 dark:text-slate-300 uppercase tracking-wider text-[11px]">
            {isBn ? 'করণীয় ক্রমানুসারে তালিকা' : 'Sequential Recovery Checklist'}
          </span>
          <span className="text-[10px] font-mono text-slate-500">
            {isBn ? 'ধাপগুলো সম্পন্ন হলে ট্রিকমার্ক দিন' : 'Check off completed steps'}
          </span>
        </div>

        {matchedData.steps.map((step, index) => {
          const isDone = completedSteps.includes(step.id);
          const isExpanded = expandedStep === step.id;

          return (
            <div
              key={step.id}
              className={`rounded-2xl border transition-all duration-200 overflow-hidden ${
                isDone
                  ? 'bg-emerald-50/60 dark:bg-emerald-950/20 border-emerald-300 dark:border-emerald-800/80'
                  : isExpanded
                  ? 'bg-white dark:bg-slate-900 border-indigo-300 dark:border-indigo-800 shadow-md ring-1 ring-indigo-500/20'
                  : 'bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-800 hover:border-slate-300 dark:hover:border-slate-700'
              }`}
            >
              {/* STEP HEADER */}
              <div
                onClick={() => setExpandedStep(isExpanded ? null : step.id)}
                className="p-3.5 flex items-start sm:items-center justify-between gap-3 cursor-pointer select-none"
              >
                <div className="flex items-start sm:items-center gap-3 min-w-0">
                  {/* Step Completion Checkbox */}
                  <button
                    type="button"
                    onClick={(e) => toggleStepCompleted(step.id, e)}
                    className={`w-6 h-6 rounded-lg flex items-center justify-center shrink-0 transition-all cursor-pointer ${
                      isDone
                        ? 'bg-emerald-600 text-white shadow-sm shadow-emerald-600/30'
                        : 'bg-slate-100 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 hover:border-indigo-500 text-transparent'
                    }`}
                    title={isBn ? 'সম্পন্ন চিহ্নিত করুন' : 'Mark Completed'}
                  >
                    <Check className="w-4 h-4 stroke-[3]" />
                  </button>

                  <div className="min-w-0">
                    <div className="flex items-center gap-2 flex-wrap">
                      <span className="text-[10px] font-mono font-black text-indigo-600 dark:text-indigo-400 uppercase tracking-widest">
                        {isBn ? `ধাপ ${index + 1}` : `STEP 0${index + 1}`}
                      </span>
                      {getUrgencyBadge(step.urgencyLevel, step.urgencyBn, step.urgencyEn)}
                    </div>
                    <h4
                      className={`text-xs sm:text-sm font-bold truncate mt-0.5 ${
                        isDone
                          ? 'line-through text-slate-500 dark:text-slate-400'
                          : 'text-slate-900 dark:text-slate-100'
                      }`}
                    >
                      {isBn ? step.titleBn : step.titleEn}
                    </h4>
                  </div>
                </div>

                <div className="flex items-center gap-2 shrink-0 pt-0.5 sm:pt-0">
                  <span className="text-[10px] font-mono font-bold text-slate-500 dark:text-slate-400 hidden sm:inline-block">
                    {isBn ? step.timeframeBn : step.timeframeEn}
                  </span>
                  {isExpanded ? (
                    <ChevronUp className="w-4 h-4 text-slate-400" />
                  ) : (
                    <ChevronDown className="w-4 h-4 text-slate-400" />
                  )}
                </div>
              </div>

              {/* STEP EXPANDED DETAILS */}
              {isExpanded && (
                <div className="px-4 pb-4 pt-1 border-t border-slate-100 dark:border-slate-800/80 bg-slate-50/50 dark:bg-slate-900/50 space-y-3">
                  <p className="text-xs text-slate-600 dark:text-slate-300 leading-relaxed">
                    {isBn ? step.descBn : step.descEn}
                  </p>

                  <div className="flex flex-wrap items-center gap-2 pt-1">
                    {step.actionType === 'call' && step.hotline && (
                      <a
                        href={`tel:${step.hotline}`}
                        className="px-3 py-1.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs flex items-center gap-1.5 shadow-md shadow-emerald-600/20 transition-all"
                      >
                        <PhoneCall className="w-3.5 h-3.5" />
                        <span>{step.hotlineLabel || `Dial ${step.hotline}`}</span>
                      </a>
                    )}

                    {step.hotline && (
                      <button
                        type="button"
                        onClick={() => handleCopyHotline(step.hotline!)}
                        className="px-3 py-1.5 rounded-xl bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-800 dark:text-slate-200 font-bold text-xs flex items-center gap-1.5 border border-slate-200 dark:border-slate-700 transition-all cursor-pointer"
                      >
                        {copiedHotline === step.hotline ? (
                          <>
                            <Check className="w-3.5 h-3.5 text-emerald-500" />
                            <span className="text-emerald-600 dark:text-emerald-400">
                              {isBn ? 'কপি হয়েছে' : 'Copied'}
                            </span>
                          </>
                        ) : (
                          <>
                            <Copy className="w-3.5 h-3.5" />
                            <span>{isBn ? `হটলাইন কপি (${step.hotline})` : `Copy ${step.hotline}`}</span>
                          </>
                        )}
                      </button>
                    )}

                    {step.actionType === 'template' && (
                      <button
                        type="button"
                        onClick={() => setShowDisputeModal(true)}
                        className="px-3 py-1.5 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-xs flex items-center gap-1.5 shadow-md shadow-indigo-600/20 transition-all cursor-pointer"
                      >
                        <FileText className="w-3.5 h-3.5" />
                        <span>{isBn ? 'নোটিশ কপি ও দেখুন' : 'View Dispute Draft'}</span>
                      </button>
                    )}

                    {step.linkUrl && (
                      <a
                        href={step.linkUrl}
                        target="_blank"
                        rel="noreferrer"
                        className="px-3 py-1.5 rounded-xl bg-slate-800 hover:bg-slate-900 text-white font-bold text-xs flex items-center gap-1.5 shadow-md transition-all"
                      >
                        <ExternalLink className="w-3.5 h-3.5 text-indigo-400" />
                        <span>{isBn ? 'অফিসিয়াল পোর্টাল খুলুন' : 'Open Official Portal'}</span>
                      </a>
                    )}

                    <button
                      type="button"
                      onClick={(e) => toggleStepCompleted(step.id, e)}
                      className={`px-3 py-1.5 rounded-xl font-bold text-xs flex items-center gap-1.5 border transition-all cursor-pointer ml-auto ${
                        isDone
                          ? 'bg-emerald-100 dark:bg-emerald-950/60 text-emerald-700 dark:text-emerald-300 border-emerald-300 dark:border-emerald-800'
                          : 'bg-white dark:bg-slate-800 text-slate-700 dark:text-slate-300 border-slate-200 dark:border-slate-700 hover:bg-slate-100 dark:hover:bg-slate-750'
                      }`}
                    >
                      <CheckCircle2 className={`w-3.5 h-3.5 ${isDone ? 'text-emerald-600' : 'text-slate-400'}`} />
                      <span>
                        {isDone
                          ? isBn ? 'ধাপ সম্পন্ন হয়েছে' : 'Step Completed'
                          : isBn ? 'সম্পন্ন চিহ্নিত করুন' : 'Mark as Done'}
                      </span>
                    </button>
                  </div>
                </div>
              )}
            </div>
          );
        })}
      </div>

      {/* QUICK HELPLINE FOOTER DIRECTORY */}
      <div className="p-3.5 rounded-2xl bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 flex flex-wrap items-center justify-between gap-2 text-xs">
        <span className="font-bold text-slate-700 dark:text-slate-300 flex items-center gap-1.5">
          <Siren className="w-4 h-4 text-rose-500" />
          <span>{isBn ? 'জরুরি আইনি হেল্পলাইন হটলাইন' : 'Emergency Law Enforcement Hotline Directory'}</span>
        </span>

        <div className="flex items-center gap-2 flex-wrap text-[11px] font-mono">
          <a
            href="tel:16216"
            className="px-2.5 py-1 rounded-lg bg-indigo-50 dark:bg-indigo-950/60 hover:bg-indigo-100 dark:hover:bg-indigo-900 text-indigo-700 dark:text-indigo-300 border border-indigo-200 dark:border-indigo-800 font-bold flex items-center gap-1"
          >
            <PhoneCall className="w-3 h-3 text-indigo-500" /> CID 16216
          </a>
          <a
            href="tel:999"
            className="px-2.5 py-1 rounded-lg bg-rose-50 dark:bg-rose-950/60 hover:bg-rose-100 dark:hover:bg-rose-900 text-rose-700 dark:text-rose-300 border border-rose-200 dark:border-rose-800 font-bold flex items-center gap-1"
          >
            <PhoneCall className="w-3 h-3 text-rose-500" /> 999 Emergency
          </a>
          <a
            href="tel:16121"
            className="px-2.5 py-1 rounded-lg bg-emerald-50 dark:bg-emerald-950/60 hover:bg-emerald-100 dark:hover:bg-emerald-900 text-emerald-700 dark:text-emerald-300 border border-emerald-200 dark:border-emerald-800 font-bold flex items-center gap-1"
          >
            <PhoneCall className="w-3 h-3 text-emerald-500" /> Consumer 16121
          </a>
        </div>
      </div>

      {/* DISPUTE NOTICE DRAFT MODAL */}
      {showDisputeModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-md animate-in fade-in duration-200">
          <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl max-w-xl w-full p-6 shadow-2xl space-y-4 text-left relative max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between border-b border-slate-100 dark:border-slate-800 pb-3">
              <div className="flex items-center gap-2">
                <div className="p-2 rounded-xl bg-amber-500/10 text-amber-600 dark:text-amber-400 border border-amber-500/20">
                  <FileText className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="text-sm font-bold text-slate-900 dark:text-white">
                    {isBn ? 'আনুষ্ঠানিক সম্পদ স্থগিত ও অভিযোগ নোটিশ' : 'Statutory Asset Freeze Dispute Draft'}
                  </h3>
                  <span className="text-[10px] font-mono text-slate-400">Ref: {referenceCode}</span>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setShowDisputeModal(false)}
                className="w-8 h-8 rounded-full bg-slate-100 dark:bg-slate-800 text-slate-500 hover:text-slate-800 dark:hover:text-white flex items-center justify-center font-bold text-sm cursor-pointer"
              >
                ✕
              </button>
            </div>

            <p className="text-xs text-slate-600 dark:text-slate-300">
              {isBn
                ? 'এই প্রস্তুতকৃত নোটিশটি কপি করে ব্যাংক, এমএফএস হেল্পডেস্ক বা থানায় লিখিত আবেদনের সাথে জমা দিতে পারেন। এতে বিটিআরসি ও বাংলাদেশ ব্যাংকের রেগুলেশন উল্লেখ রয়েছে।'
                : 'Copy this statutory dispute notice to email or submit physically to your bank / MFS customer care or police station.'}
            </p>

            <div className="p-3.5 rounded-2xl bg-slate-900 text-slate-200 font-mono text-[11px] leading-relaxed border border-slate-800 overflow-x-auto whitespace-pre-wrap select-all max-h-60">
              {generatedDisputeNotice}
            </div>

            <div className="flex items-center justify-end gap-3 pt-2">
              <button
                type="button"
                onClick={() => setShowDisputeModal(false)}
                className="px-4 py-2 rounded-xl bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-300 font-bold text-xs cursor-pointer"
              >
                {isBn ? 'বন্ধ করুন' : 'Close'}
              </button>

              <button
                type="button"
                onClick={handleCopyNotice}
                className="px-5 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-xs flex items-center gap-1.5 shadow-md shadow-indigo-600/20 cursor-pointer transition-all"
              >
                {copiedTemplate ? (
                  <>
                    <Check className="w-4 h-4 text-emerald-300" />
                    <span>{isBn ? 'কপি সম্পন্ন!' : 'Copied Notice!'}</span>
                  </>
                ) : (
                  <>
                    <Copy className="w-4 h-4" />
                    <span>{isBn ? 'নোটিশ কপি করুন' : 'Copy Notice Text'}</span>
                  </>
                )}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default RemediationRoadmap;
