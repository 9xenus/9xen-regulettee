/**
 * Scam School & Citizen Education Module (Module 6)
 * 
 * Short bite-sized interactive lessons, localized case analyses, and micro-quizzes
 * that reward citizens with verifiable level badges ("Scam-Aware Citizen Level 2").
 */

export interface ScamLesson {
  id: string;
  titleBn: string;
  titleEn: string;
  category: string;
  durationMinutes: number;
  readCount: number;
  summaryBn: string;
  summaryEn: string;
  stepsBn: string[];
  stepsEn: string[];
  redFlagsBn: string[];
  redFlagsEn: string[];
  quiz: {
    questionBn: string;
    questionEn: string;
    optionsBn: string[];
    optionsEn: string[];
    correctIndex: number;
    explanationBn: string;
    explanationEn: string;
  };
}

export interface CitizenBadge {
  level: number;
  titleBn: string;
  titleEn: string;
  badgeCode: string;
  unlockedAt?: string;
  criteriaBn: string;
  criteriaEn: string;
}

export class ScamSchoolService {
  private static lessons: ScamLesson[] = [
    {
      id: 'LES-01',
      titleBn: 'বিকাশ ও নগদ পিন/ওটিপি হাতিয়ে নেওয়ার কৌশল চেনার উপায়',
      titleEn: 'How to Spot MFS PIN & OTP Phishing Tactics',
      category: 'Mobile Financial Services',
      durationMinutes: 2,
      readCount: 14820,
      summaryBn: 'প্রতারকরা যেভাবে নিজেকে ব্যাংক বা বিকাশ প্রতিনিধি দাবি করে এবং আপনার ওটিপি সংগ্রহ করে।',
      summaryEn: 'How scammers impersonate customer service representatives to extract your one-time passwords.',
      stepsBn: [
        '১. তারা আপনাকে কল দিয়ে বলবে আপনার অ্যাকাউন্ট জরুরি কেওয়াইসি ভেরিফিকেশনের জন্য হোল্ডে আছে।',
        '২. ভেরিফিকেশন কোড পাঠানোর পর তা ফোনে মুখে বলতে অথবা কিপ্যাডে চাপতে বলবে।',
        '৩. ওটিপি পাওয়া মাত্রই তারা অ্যাকাউন্টের পুরো ব্যালেন্স অন্য নম্বরে ক্যাশআউট করে ফেলে।'
      ],
      stepsEn: [
        '1. They call claiming your MFS account is suspended for urgent security KYC.',
        '2. They trigger an official password reset and demand you read out the 6-digit SMS code.',
        '3. The moment OTP is disclosed, your funds are siphoned within 10 seconds.'
      ],
      redFlagsBn: [
        'বিকাশ/নগদ বা ব্যাংক কখনো আপনার পিন (PIN) বা ওটিপি (OTP) জানতে চাইবে না।',
        'অ্যাকাউন্ট "বন্ধ হয়ে যাবে" বলে জরুরি তাড়াহুড়ো সৃষ্টি করা।'
      ],
      redFlagsEn: [
        'No bank or MFS representative will EVER ask for your 5-digit PIN or OTP.',
        'Artificial urgency claiming your funds will be frozen within 5 minutes.'
      ],
      quiz: {
        questionBn: 'বিকাশ হেল্পলাইন দাবি করে কেউ কল দিয়ে আপনার কাছে এসএমএস ওটিপি চাইলে আপনার কী করা উচিত?',
        questionEn: 'If someone calls claiming to be bKash support and asks for your SMS OTP, what should you do?',
        optionsBn: [
          'দ্রুত ওটিপি বলে অ্যাকাউন্ট সচল রাখা',
          'কল কেটে দিয়ে ট্রাস্ট চেক অ্যাপে রিপোর্ট করা এবং কাউকে ওটিপি না দেওয়া',
          'পিন নম্বরটি দেওয়া কিন্তু ওটিপি গোপন রাখা',
          'অন্য বন্ধুর নম্বর দিয়ে দেওয়া'
        ],
        optionsEn: [
          'Share the OTP immediately to prevent suspension',
          'Hang up immediately, never share OTP, and report on Trust Check',
          'Share the PIN but withhold the OTP',
          'Give a friend’s phone number'
        ],
        correctIndex: 1,
        explanationBn: 'সঠিক! কোনো পরিস্থিতিতেই ওটিপি বা পিন কারও সাথে শেয়ার করবেন না। এটি আপনার অ্যাকাউন্টের প্রধান চাবি।',
        explanationEn: 'Correct! Never share your OTP or PIN under any circumstance. Customer agents never ask for authentication codes.'
      }
    },
    {
      id: 'LES-02',
      titleBn: 'ফেসবুক কেনাকাটায় অগ্রিম পেমেন্ট ফাঁদ ও ভুয়া পেজ শনাক্তকরণ',
      titleEn: 'Detecting Fake Social Commerce Pages & Advance Payment Traps',
      category: 'E-Commerce & Retail',
      durationMinutes: 3,
      readCount: 11240,
      summaryBn: 'অবিশ্বাস্য কম মূল্যে গ্যাজেট বা জামাকাপড় বিক্রির নামে অগ্রিম টাকা নিয়ে ব্লক করার প্রতারণা।',
      summaryEn: 'Spotting fake Facebook pages offering 90% discounts to collect unrefundable advance money.',
      stepsBn: [
        '১. পেজটির বয়স ও পূর্বের নাম পরিবর্তন ইতিহাস দেখুন (About Info তে)।',
        '২. তাদের বিকাশ বা নগদ নম্বরটি পেমেন্ট করার আগে Trust Check এ স্ক্যান করুন।',
        '৩. পণ্য দেখে নেওয়ার জন্য ক্যাশ অন ডেলিভারি (COD) এর নিশ্চয়তা নিন।'
      ],
      stepsEn: [
        '1. Check Page Transparency (Page creation date and previous name changes).',
        '2. Search the payment bKash/Nagad number on Trust Check before transferring.',
        '3. Insist on open-box Cash on Delivery (COD).'
      ],
      redFlagsBn: [
        'পেজে কোনো স্থায়ী দোকান বা শোরুমের ঠিকানা না থাকা।',
        'শুধুমাত্র বিকাশ পার্সোনাল নম্বরে "Send Money" করতে জোর দেওয়া।'
      ],
      redFlagsEn: [
        'No physical trade license or verifiable address provided.',
        'Insisting strictly on personal bKash send-money with zero escrow protection.'
      ],
      quiz: {
        questionBn: 'একটি ফেসবুক পেজে ১০,০০০ টাকার স্মার্টওয়াচ ৯৯৯ টাকায় অফার করা হচ্ছে এবং ১০০% অগ্রিম বিকাশ চাওয়া হচ্ছে। এটি কীসের লক্ষণ?',
        questionEn: 'A Facebook page offers a 10,000 BDT smartwatch for 999 BDT requiring 100% advance bKash. What is this?',
        optionsBn: [
          'সুযোগ মিস না করে তৎক্ষণাৎ টাকা পাঠিয়ে দেওয়া',
          'উচ্চ ঝুঁকির নিশ্চিত প্রতারণা — অগ্রিম টাকা না দিয়ে ট্রাস্ট চেক দিয়ে যাচাই করা',
          'বন্ধুদের পেজটি লাইক দিতে বলা',
          'কুরিয়ার চার্জের জন্য আরও কিছু টাকা বেশি পাঠানো'
        ],
        optionsEn: [
          'A genuine flash sale to pay for immediately',
          'A high-risk scam — do not pay, verify merchant status on Trust Check',
          'Ask friends to like the page',
          'Send extra money for delivery'
        ],
        correctIndex: 1,
        explanationBn: 'সঠিক! অতিরিক্ত অবিশ্বাস্য মূল্যছাড় ও সম্পূর্ণ অগ্রিম পেমেন্টের চাপ অধিকাংশ ক্ষেত্রে প্রতারণার লক্ষণ।',
        explanationEn: 'Correct! Unrealistic price drops combined with 100% advance personal transfers are classic fraud indicators.'
      }
    }
  ];

  public static getLessons(): ScamLesson[] {
    return this.lessons;
  }

  public static getBadges(userScore: number = 0): CitizenBadge[] {
    return [
      {
        level: 1,
        titleBn: 'সচেতন নাগরিক (লেভেল ১)',
        titleEn: 'Scam-Aware Citizen (Level 1)',
        badgeCode: 'BADGE_CITIZEN_L1',
        unlockedAt: '2026-03-01T10:00:00Z',
        criteriaBn: '১টি পাঠ সম্পন্ন ও সফল কুইজ উত্তর',
        criteriaEn: 'Complete 1 lesson & pass micro-quiz',
      },
      {
        level: 2,
        titleBn: 'কমিউনিটি ট্রাস্ট গার্ড (লেভেল ২)',
        titleEn: 'Community Trust Guard (Level 2)',
        badgeCode: 'BADGE_CITIZEN_L2',
        unlockedAt: userScore >= 2 ? new Date().toISOString() : undefined,
        criteriaBn: 'সকল মৌলিক স্ক্যাম পাঠ সম্পন্ন ও ২টি সন্দেহজনক মার্চেন্ট যাচাই',
        criteriaEn: 'Complete all core scam lessons and perform 2 trust verifications',
      },
      {
        level: 3,
        titleBn: 'সার্বভৌম ডিজিটাল প্রটেক্টর (লেভেল ৩)',
        titleEn: 'Sovereign Digital Protector (Level 3)',
        badgeCode: 'BADGE_CITIZEN_L3',
        unlockedAt: undefined,
        criteriaBn: '৫টি সফল যাচাইকরণ এবং ১টি কমিউনিটি রিপোর্ট দাখিল',
        criteriaEn: 'Perform 5 verifications & submit 1 confirmed community alert',
      }
    ];
  }
}
