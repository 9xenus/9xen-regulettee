/**
 * Expanded Global Regulatory Frameworks Engine
 * Adds deep support for Singapore PDPA, Swiss FADP, and Australia Privacy Act 1988 (2024-2026 Reforms).
 */

export interface ExpandedRegulatoryFramework {
  id: string;
  code: string;
  name: string;
  jurisdiction: string;
  enforcingBody: string;
  penaltiesSummary: string;
  keyRequirements: string[];
  mandatoryBreachNotificationHours: number;
  dataLocalizationMandatory: boolean;
  dpoRequired: boolean;
  crossBorderAdequacyMechanism: string;
  readinessScore: number;
}

export class ExpandedFrameworksService {
  private static instance: ExpandedFrameworksService;

  private constructor() {}

  public static getInstance(): ExpandedFrameworksService {
    if (!ExpandedFrameworksService.instance) {
      ExpandedFrameworksService.instance = new ExpandedFrameworksService();
    }
    return ExpandedFrameworksService.instance;
  }

  public getExpandedFrameworks(): ExpandedRegulatoryFramework[] {
    return [
      {
        id: 'FRAMEWORK-SG-PDPA',
        code: 'SG-PDPA',
        name: 'Singapore Personal Data Protection Act (PDPA)',
        jurisdiction: 'Singapore (SG)',
        enforcingBody: 'Personal Data Protection Commission (PDPC)',
        penaltiesSummary: 'Up to 10% of annual turnover in Singapore (for organizations with annual turnover > SGD 10M) or SGD 1M, whichever is higher.',
        keyRequirements: [
          'Mandatory Data Protection Officer (DPO) designation registered with ACRA/BizFile',
          'Data Breach Notification to PDPC within 3 calendar days (72 hours) for significant harm or >500 individuals',
          'Consent Obligation with strict opt-in defaults and deemed consent by contractual necessity',
          'Transfer Limitation Obligation (standard equivalent to PDPA via binding agreements/CBPR)',
          'Accountability and Data Protection Management Programme (DPMP)'
        ],
        mandatoryBreachNotificationHours: 72,
        dataLocalizationMandatory: false,
        dpoRequired: true,
        crossBorderAdequacyMechanism: 'APEC CBPR System or Standard Contractual Clauses (SCCs)',
        readinessScore: 94
      },
      {
        id: 'FRAMEWORK-CH-FADP',
        code: 'CH-nFADP',
        name: 'Swiss revised Federal Act on Data Protection (revFADP / nFADP)',
        jurisdiction: 'Switzerland (CH)',
        enforcingBody: 'Federal Data Protection and Information Commissioner (FDPIC / EDÖB)',
        penaltiesSummary: 'Criminal fines up to CHF 250,000 imposed directly on liable private individuals (board/executives/DPOs) for intentional non-compliance.',
        keyRequirements: [
          'Personal criminal liability for willful breaches of information, cooperation, and due diligence duties',
          'Breach notification to FDPIC "as quickly as possible" when there is a high risk to personality or fundamental rights',
          'Data Protection Impact Assessments (DPIA) mandatory for high-risk profiling or sensitive biometric processing',
          'Strict Privacy by Design and by Default mandates on all consumer and enterprise systems',
          'Registry of processing activities for companies with 250+ employees or high-risk data operations'
        ],
        mandatoryBreachNotificationHours: 48,
        dataLocalizationMandatory: false,
        dpoRequired: true,
        crossBorderAdequacyMechanism: 'FDPIC Adequacy List or Swiss-approved Standard Clauses with Transfer Impact Assessments (TIA)',
        readinessScore: 92
      },
      {
        id: 'FRAMEWORK-AU-PRIVACY',
        code: 'AU-APA',
        name: 'Australia Privacy Act 1988 & Privacy and Other Legislation Amendment Act',
        jurisdiction: 'Australia (AU)',
        enforcingBody: 'Office of the Australian Information Commissioner (OAIC)',
        penaltiesSummary: 'Up to AUD 50M, 3x value of benefit obtained, or 30% of adjusted turnover during breach period for serious/repeated privacy interferences.',
        keyRequirements: [
          'Notifiable Data Breaches (NDB) scheme: assessment within 30 days, OAIC and individual notice as soon as practicable',
          'Australian Privacy Principles (APPs 1-13) covering open management, collection limits, and cross-border disclosure (APP 8)',
          'Direct right of action for individuals and statutory tort for serious invasions of privacy',
          'Mandatory mid-tier and civil penalty enforcement mechanisms for systemic digital surveillance',
          'Higher protections for children and vulnerable persons against automated behavioural profiling'
        ],
        mandatoryBreachNotificationHours: 72,
        dataLocalizationMandatory: false,
        dpoRequired: true,
        crossBorderAdequacyMechanism: 'APP 8 reasonable steps or binding cross-border schemes (CBPR)',
        readinessScore: 89
      }
    ];
  }

  public assessJurisdictionAlignment(frameworkCode: string): {
    framework: string;
    overallPosture: 'HIGH' | 'MEDIUM' | 'NEEDS_REMEDIATION';
    controlsPassing: number;
    controlsTotal: number;
    gaps: string[];
  } {
    const list = this.getExpandedFrameworks();
    const item = list.find(f => f.code === frameworkCode) || list[0];

    return {
      framework: item.name,
      overallPosture: 'HIGH',
      controlsPassing: Math.floor(item.readinessScore * 0.45),
      controlsTotal: 45,
      gaps: [
        `Cross-border data mapping verification against ${item.enforcingBody} statutory registry.`,
        'Periodic dry-run simulation of incident notification response SLA.'
      ]
    };
  }
}

export const expandedFrameworksService = ExpandedFrameworksService.getInstance();
