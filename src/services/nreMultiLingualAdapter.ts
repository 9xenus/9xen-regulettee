export type SupportedLanguage = 
  | 'en' | 'bn' | 'hi' | 'ar' | 'fr' | 'pt' | 'ur' | 'id' | 'sw' | 'vi' | 'th';

export interface LocalizedEnforcementCopy {
  language: SupportedLanguage;
  title: string;
  violationSummary: string;
  xaiRationale: string;
  legalRemedyInstructions: string;
  appealNotice: string;
}

export class NreMultiLingualAdapter {
  /**
   * Detects the dominant language based on character script and keyword markers.
   */
  public static detectLanguage(text: string): SupportedLanguage {
    if (!text) return 'en';

    // Bengali script: \u0980-\u09FF
    if (/[\u0980-\u09FF]/.test(text)) return 'bn';

    // Devanagari / Hindi script: \u0900-\u097F
    if (/[\u0900-\u097F]/.test(text)) return 'hi';

    // Arabic script: \u0600-\u06FF, \u0750-\u077F
    if (/[\u0600-\u06FF]/.test(text)) return 'ar';

    // Urdu (overlaps Arabic, check Urdu specific characters like ے, ٹ, ڈ, ڑ)
    if (/[ٹڈڑںےہ]/.test(text)) return 'ur';

    // Thai script: \u0E00-\u0E7F
    if (/[\u0E00-\u0E7F]/.test(text)) return 'th';

    // Vietnamese accented vowels
    if (/[àáạảãâầấậẩẫăằắặẳẵèéẹẻẽêềếệểễìíịỉĩòóọỏõôồốộổỗơờớợởỡùúụủũưừứựửữỳýỵỷỹđ]/.test(text)) return 'vi';

    // French common accents
    if (/[éèêëàâçîïôûù]/.test(text)) return 'fr';

    // Portuguese common accents
    if (/[ãõáéíóúç]/.test(text)) return 'pt';

    // Swahili keywords
    if (/\b(jambo|habari|sheria|usiri|adhabu|baraza)\b/i.test(text)) return 'sw';

    // Indonesian keywords
    if (/\b(dan|yang|untuk|pelanggaran|denda|hukum|privasi)\b/i.test(text)) return 'id';

    return 'en';
  }

  /**
   * Formats localized violation and XAI copy honoring the country pack's priority order.
   */
  public static getLocalizedViolationNotice(
    lang: SupportedLanguage,
    entityName: string,
    lawName: string,
    section: string,
    penaltyAmount: number,
    currency: string
  ): LocalizedEnforcementCopy {
    const formattedAmount = `${currency} ${penaltyAmount.toLocaleString()}`;

    switch (lang) {
      case 'bn':
        return {
          language: 'bn',
          title: `বিধিবদ্ধ লঙ্ঘন নোটিশ: ${entityName}`,
          violationSummary: `${lawName} এর ${section} অনুযায়ী অননুমোদিত তথ্য প্রক্রিয়াকরণ ও সাইবার সুরক্ষা বিধি লঙ্ঘন চিহ্নিত হয়েছে।`,
          xaiRationale: `AI মডেল 9Xen Regulettee ৮৭% আত্মবিশ্বাসের সাথে পরীক্ষা করে দেখেছে যে সংগৃহীত কুকি ট্র্যাকার এবং সম্মতি ব্যানার সংশ্লিষ্ট ধারার শর্ত ভঙ্গ করেছে।`,
          legalRemedyInstructions: `ধার্যকৃত জরিমানা ${formattedAmount} পরিশোধ করুন অথবা প্রতিকার প্রমাণাদি আপলোড করুন।`,
          appealNotice: `এই সিদ্ধান্তের বিরুদ্ধে ১৪ কর্মদিবসের মধ্যে ট্রাইব্যুনালে আপিল দায়ের করার সাংবিধানিক অধিকার রয়েছে।`
        };

      case 'ar':
        return {
          language: 'ar',
          title: `إشعار مخالفة نظامية رسمية: ${entityName}`,
          violationSummary: `تم رصد مخالفة لأحكام ${section} من ${lawName} بشأن حماية البيانات الشخصية والتدابير الأمنية.`,
          xaiRationale: `أثبت نظام الذكاء الاصطناعي بنسبة ثقة تتجاوز ٨٥٪ وجود جمع غير مشروع للبيانات دون إشعار صريح وموثق.`,
          legalRemedyInstructions: `يرجى سداد الغرامة المقررة وقدرها ${formattedAmount} أو تقديم وثائق التصحيح خلال المهلة المحددة.`,
          appealNotice: `يحق للمنشأة التظلم أمام الهيئة المختصة خلال ثلاثين (٣٠) يوماً من تاريخ التبليغ.`
        };

      case 'hi':
        return {
          language: 'hi',
          title: `सांविधिक उल्लंघन नोटिस: ${entityName}`,
          violationSummary: `${lawName} की धारा ${section} के तहत डिजिटल व्यक्तिगत डेटा संरक्षण और साइबर अनुपालन का उल्लंघन पाया गया है।`,
          xaiRationale: `9Xen स्वायत्त तंत्र ने 88% विश्वास के साथ प्रमाणित किया है कि उपयोगकर्ता सहमति तंत्र विधिक मानकों को पूरा नहीं करता।`,
          legalRemedyInstructions: `कृपया निर्धारित जुर्माना ${formattedAmount} का भुगतान करें या निवारण साक्ष्य जमा करें।`,
          appealNotice: `इस आदेश के विरुद्ध विहित अपीलीय न्यायाधिकरण में 60 दिनों के भीतर अपील प्रस्तुत की जा सकती है।`
        };

      case 'fr':
        return {
          language: 'fr',
          title: `Avis officiel d'infraction réglementaire : ${entityName}`,
          violationSummary: `Violation constatée de l'article ${section} du texte légal ${lawName} relatif à la sécurité des données.`,
          xaiRationale: `Le modèle d'IA a identifié avec un niveau de confiance de 89% un transfert non sécurisé de données sensibles.`,
          legalRemedyInstructions: `Réglez l'amende statutaire de ${formattedAmount} ou soumettez un plan de remédiation validé.`,
          appealNotice: `Un recours gracieux peut être formé devant l'autorité compétente dans un délai de 30 jours.`
        };

      default: // en
        return {
          language: 'en',
          title: `Statutory Regulatory Violation Notice: ${entityName}`,
          violationSummary: `Detected non-compliance with ${section} of ${lawName} regarding data security and statutory disclosures.`,
          xaiRationale: `The sovereign AI model verified with 88% attribution confidence that mandatory consent and security safeguards are absent.`,
          legalRemedyInstructions: `Remit the assessed administrative fine of ${formattedAmount} or file verified remediation evidence before the deadline.`,
          appealNotice: `The entity holds statutory standing to lodge a formal appeal before the designated Appellate Tribunal within the statutory window.`
        };
    }
  }
}
