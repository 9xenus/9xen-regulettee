import { LawDefinition } from '../pack.manifest';

export const TEMPLATE_LAWS: LawDefinition[] = [
  {
    code: 'SAMPLE_PRIVACY_ACT_2026',
    title: 'Personal Data Protection and Digital Sovereignty Act, 2026',
    titleLocal: 'قانون حماية البيانات الشخصية / তথ্য সুরক্ষা আইন',
    regulatorCode: 'SAMPLE_REGULATOR',
    language: 'en',
    officialGazetteRef: 'Gazette Vol. 2026, Notification No. 104',
    effectiveFrom: '2026-01-01',
    status: 'active',
    version: 1,
    rules: [
      {
        section: 'Section 14',
        title: 'Unauthorized Cross-Border Transmission of Restricted Citizen Data',
        titleLocal: 'نقل البيانات بدون موافقة / অনুমতিবিহীন উপাত্ত প্রেরণ',
        violationType: 'CROSS_BORDER_RESTRICTED_DATA_TRANSFER',
        penaltyType: 'range',
        minPenalty: 100000,
        maxPenalty: 5000000,
        currency: 'USD',
        severityGrade: 'critical',
        repeatMultiplier: 2.0,
        repeatOffenseRule: {
          multiplier: 2.0,
          windowMonths: 24,
          lookupScope: 'country'
        },
        paymentDeadlineDays: 21,
        appealWindowDays: 14,
        imprisonmentNote: 'Imprisonment up to 3 years for willful corporate negligence',
        autoEnforceable: true
      },
      {
        section: 'Section 22(B)',
        title: 'Failure to Report Security Incident Within 6 Hours',
        violationType: 'INCIDENT_DISCLOSURE_DEFAULT',
        penaltyType: 'per_day',
        minPenalty: 10000,
        maxPenalty: 500000,
        dailyAccrual: 5000,
        currency: 'USD',
        severityGrade: 'major',
        repeatMultiplier: 1.5,
        paymentDeadlineDays: 15,
        appealWindowDays: 10,
        autoEnforceable: true
      }
    ]
  }
];
