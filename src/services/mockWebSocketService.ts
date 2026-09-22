/**
 * Mock WebSocket Streaming Service for Real-time Transaction Monitoring
 * Simulates incoming high-throughput financial streaming data and flags
 * suspicious financial patterns based on common EU AML/CTF indicators.
 * 
 * Complies with EU 6AMLD (Directive 2018/1673), EU AML Regulation 2024/1620,
 * and EU Transfer of Funds Regulation (TFR 2023/1113).
 */

import { getPublicEndpoints } from '../config/publicUrlConfig';

export interface AmlIndicator {
  code: string;
  name: string;
  category: 'STRUCTURING' | 'HIGH_RISK_JURISDICTION' | 'PEP_SANCTIONS' | 'RAPID_VELOCITY' | 'CRYPTO_TRAVEL_RULE' | 'SHELL_COMPANY_SPIKE' | 'CIRCULAR_ROUTING';
  directiveRef: string;
  severity: 'LOW' | 'MEDIUM' | 'HIGH' | 'CRITICAL';
  description: string;
  weight: number;
}

export interface LiveTransaction {
  id: string;
  txHash: string;
  timestamp: string;
  originator: {
    name: string;
    iban: string;
    bic?: string;
    country: string;
    countryCode: string;
    isPep: boolean;
    isSanctioned: boolean;
    entityType: 'INDIVIDUAL' | 'CORPORATE' | 'UNHOSTED_WALLET' | 'VASP';
    accountAgeMonths: number;
  };
  beneficiary: {
    name: string;
    iban: string;
    bic?: string;
    country: string;
    countryCode: string;
    isPep: boolean;
    isSanctioned: boolean;
    entityType: 'INDIVIDUAL' | 'CORPORATE' | 'UNHOSTED_WALLET' | 'VASP';
    accountAgeMonths: number;
  };
  amount: number;
  currency: 'EUR' | 'USD' | 'GBP' | 'CHF' | 'USDT';
  channel: 'SEPA_INSTANT' | 'TARGET2' | 'SWIFT_MX' | 'CRYPTO_VASP' | 'CORRESPONDENT_BANK';
  riskScore: number; // 0 to 100
  riskLevel: 'LOW' | 'MEDIUM' | 'HIGH' | 'CRITICAL';
  indicators: AmlIndicator[];
  status: 'SETTLED' | 'SUSPENDED_SAR' | 'FLAGGED_REVIEW' | 'QUARANTINED';
  fiuReportingRequired: boolean;
  notes?: string;
  immudbTxId: string;
}

export interface StreamMetrics {
  totalMonitoredVolumeEur: number;
  totalProcessedCount: number;
  flaggedCount: number;
  sarCount: number;
  quarantinedAmountEur: number;
  msgPerSec: number;
  latencyMs: number;
  indicatorCounts: Record<string, number>;
}

export type WebSocketStatus = 'CONNECTED' | 'DISCONNECTED' | 'RECONNECTING' | 'PAUSED';

// EU AML/CTF Regulatory Indicator Library
export const EU_AML_INDICATORS: Record<string, AmlIndicator> = {
  STRUCTURING_SUB_THRESHOLD: {
    code: 'EU-AML-IND-01',
    name: 'Smurfing & Structuring Sub-Threshold Transaction',
    category: 'STRUCTURING',
    directiveRef: 'EU 6AMLD Art. 18 & AMLR Art. 40',
    severity: 'CRITICAL',
    description: 'Transaction clustered within 10% below mandatory €10,000 reporting threshold (e.g. €9,500-€9,950) indicating deliberate evasion of reporting mandates.',
    weight: 45
  },
  HIGH_RISK_THIRD_COUNTRY: {
    code: 'EU-AML-IND-02',
    name: 'High-Risk Third Country & Strategic Deficiency Exposure',
    category: 'HIGH_RISK_JURISDICTION',
    directiveRef: 'EU Delegated Reg 2016/1675 & FATF Call for Action',
    severity: 'HIGH',
    description: 'Originator or beneficiary routed via FATF high-risk jurisdiction with strategic AML/CFT deficiencies (e.g., DPRK, Iran, Myanmar, Syria, Russia, Cayman Islands).',
    weight: 40
  },
  PEP_RCA_UNSCREENED: {
    code: 'EU-AML-IND-03',
    name: 'Politically Exposed Person (PEP) / RCA Exposure',
    category: 'PEP_SANCTIONS',
    directiveRef: 'Directive (EU) 2015/849 Art. 20 (EDD Requirements)',
    severity: 'HIGH',
    description: 'Direct transactional involvement of senior public official or close relative without Enhanced Customer Due Diligence (EDD) pre-clearance.',
    weight: 35
  },
  RAPID_VELOCITY_LAYERING: {
    code: 'EU-AML-IND-04',
    name: 'Pass-Through Velocity & Layering Flow',
    category: 'RAPID_VELOCITY',
    directiveRef: 'EBA Guidelines on ML/TF Risk Factors Section 4.2',
    severity: 'CRITICAL',
    description: 'High-velocity pass-through flow where incoming large funds are immediately routed to multiple external accounts within minutes without economic rationale.',
    weight: 50
  },
  CRYPTO_TRAVEL_RULE_BREACH: {
    code: 'EU-AML-IND-05',
    name: 'Crypto Travel Rule Breach & Unhosted Wallet Transfer',
    category: 'CRYPTO_TRAVEL_RULE',
    directiveRef: 'EU Transfer of Funds Regulation (TFR 2023/1113)',
    severity: 'HIGH',
    description: 'Crypto-asset transfer exceeding €1,000 involving unhosted self-custody wallet lacking verified beneficiary/originator identification metadata.',
    weight: 38
  },
  SHELL_DORMANT_SURGE: {
    code: 'EU-AML-IND-06',
    name: 'Dormancy Inversion & Shell Entity Turnover Spike',
    category: 'SHELL_COMPANY_SPIKE',
    directiveRef: 'EU Shell Entities Directive (Unshell / ATAD 3)',
    severity: 'HIGH',
    description: 'Entity with zero historical payroll or recent dormancy abruptly initiating multi-thousand Euro international settlements.',
    weight: 35
  },
  SANCTION_LIST_HIT: {
    code: 'EU-AML-IND-07',
    name: 'EU Restrictive Measures & Global Sanctions List Hit',
    category: 'PEP_SANCTIONS',
    directiveRef: 'Council Regulation (EU) No 269/2014 & UN Sanctions',
    severity: 'CRITICAL',
    description: 'Originating entity or beneficiary matches designated target on EU CFSP consolidated financial sanctions registry. Immediate asset freeze required.',
    weight: 85
  }
};

// High risk and monitored countries
const HIGH_RISK_COUNTRIES = [
  { name: 'North Korea', code: 'KP', risk: 'CRITICAL' },
  { name: 'Iran', code: 'IR', risk: 'CRITICAL' },
  { name: 'Myanmar', code: 'MM', risk: 'HIGH' },
  { name: 'Syria', code: 'SY', risk: 'HIGH' },
  { name: 'Russia', code: 'RU', risk: 'CRITICAL' },
  { name: 'Cayman Islands', code: 'KY', risk: 'HIGH' },
  { name: 'Vanuatu', code: 'VU', risk: 'HIGH' },
  { name: 'Panama', code: 'PA', risk: 'HIGH' }
];

const COMPLIANT_EU_COUNTRIES = [
  { name: 'Germany', code: 'DE' },
  { name: 'France', code: 'FR' },
  { name: 'Netherlands', code: 'NL' },
  { name: 'Austria', code: 'AT' },
  { name: 'Belgium', code: 'BE' },
  { name: 'Spain', code: 'ES' },
  { name: 'Italy', code: 'IT' },
  { name: 'Sweden', code: 'SE' },
  { name: 'Luxembourg', code: 'LU' },
  { name: 'Ireland', code: 'IE' }
];

const INDIVIDUAL_NAMES = [
  'Lucas Van Der Berg', 'Sophie Martin', 'Mateo Rossi', 'Elena Schmidt', 
  'Lars Lindqvist', 'Charlotte Dubois', 'Stefan Weber', 'Astrid Nielsen',
  'Hugo Silva', 'Klara Novak', 'Andreas Müller', 'Camille Bernard'
];

const CORPORATE_NAMES = [
  'AeroTech Logistics GmbH', 'Nordic Clean Energy AB', 'Rhine Horizon Trading BV',
  'Alpine Cloud Solutions AG', 'Iberian Maritime SpA', 'Baltic FinTech Services OÜ',
  'Bavarian Precision Machining KG', 'Hexagon Venture Holdings S.A.'
];

const SUSPICIOUS_ENTITIES = [
  { name: 'Alisher Usmanov', isPep: true, isSanctioned: true, country: 'Russia', code: 'RU' },
  { name: 'Delta Aero Logistics LLC', isPep: false, isSanctioned: true, country: 'Russia', code: 'RU' },
  { name: 'Vanguard Offshore Trust Corp', isPep: false, isSanctioned: false, country: 'Cayman Islands', code: 'KY' },
  { name: 'Alexander Lukashenko', isPep: true, isSanctioned: true, country: 'Belarus', code: 'BY' },
  { name: 'Tehran Industrial Shipping Line', isPep: false, isSanctioned: true, country: 'Iran', code: 'IR' },
  { name: 'Grand Cayman Shell Holdings', isPep: false, isSanctioned: false, country: 'Cayman Islands', code: 'KY' }
];

type MessageListener = (data: { type: string; payload: any }) => void;

class MockWebSocketService {
  private status: WebSocketStatus = 'DISCONNECTED';
  private listeners: Set<MessageListener> = new Set();
  private timer: any = null;
  private intervalMs: number = 1800; // default 1.8 seconds per tx
  private metrics: StreamMetrics = {
    totalMonitoredVolumeEur: 3845920,
    totalProcessedCount: 412,
    flaggedCount: 38,
    sarCount: 14,
    quarantinedAmountEur: 428900,
    msgPerSec: 0.6,
    latencyMs: 24,
    indicatorCounts: {
      'EU-AML-IND-01': 14,
      'EU-AML-IND-02': 11,
      'EU-AML-IND-03': 6,
      'EU-AML-IND-04': 9,
      'EU-AML-IND-05': 8,
      'EU-AML-IND-06': 5,
      'EU-AML-IND-07': 3
    }
  };
  private messageHistory: LiveTransaction[] = [];

  constructor() {
    this.seedInitialHistory();
  }

  private seedInitialHistory() {
    // Generate 12 initial high-quality historical transactions
    const initialSeeds: LiveTransaction[] = [
      {
        id: 'TX-984210',
        txHash: '0x8f192b04c81a293847e19203847a9f81',
        timestamp: new Date(Date.now() - 1000 * 60 * 4).toISOString(),
        originator: {
          name: 'Grand Cayman Shell Holdings',
          iban: 'KY8900223300001234567890',
          bic: 'CAYMKY2X',
          country: 'Cayman Islands',
          countryCode: 'KY',
          isPep: false,
          isSanctioned: false,
          entityType: 'CORPORATE',
          accountAgeMonths: 2
        },
        beneficiary: {
          name: 'Rhine Horizon Trading BV',
          iban: 'NL91ABNA0417164300',
          bic: 'ABNANL2A',
          country: 'Netherlands',
          countryCode: 'NL',
          isPep: false,
          isSanctioned: false,
          entityType: 'CORPORATE',
          accountAgeMonths: 48
        },
        amount: 9850,
        currency: 'EUR',
        channel: 'SWIFT_MX',
        riskScore: 88,
        riskLevel: 'CRITICAL',
        indicators: [EU_AML_INDICATORS.STRUCTURING_SUB_THRESHOLD, EU_AML_INDICATORS.HIGH_RISK_THIRD_COUNTRY],
        status: 'SUSPENDED_SAR',
        fiuReportingRequired: true,
        notes: 'Repeated transaction at €9,850 originating from non-cooperative offshore jurisdiction. Smurfing evasion profile flagged.',
        immudbTxId: 'tx-immudb-984210'
      },
      {
        id: 'TX-984209',
        txHash: '0x3c819204a8b712389fbc771230491823',
        timestamp: new Date(Date.now() - 1000 * 60 * 8).toISOString(),
        originator: {
          name: 'Alisher Usmanov',
          iban: 'RU02044525600407028104',
          bic: 'SABRRUMM',
          country: 'Russia',
          countryCode: 'RU',
          isPep: true,
          isSanctioned: true,
          entityType: 'INDIVIDUAL',
          accountAgeMonths: 36
        },
        beneficiary: {
          name: 'Alpine Cloud Solutions AG',
          iban: 'CH9300762011623852957',
          bic: 'UBSWCHZH',
          country: 'Switzerland',
          countryCode: 'CH',
          isPep: false,
          isSanctioned: false,
          entityType: 'CORPORATE',
          accountAgeMonths: 60
        },
        amount: 145000,
        currency: 'EUR',
        channel: 'SWIFT_MX',
        riskScore: 99,
        riskLevel: 'CRITICAL',
        indicators: [EU_AML_INDICATORS.SANCTION_LIST_HIT, EU_AML_INDICATORS.PEP_RCA_UNSCREENED],
        status: 'QUARANTINED',
        fiuReportingRequired: true,
        notes: 'Target matches EU Consolidated Sanctions Registry. Direct asset freeze enforced under Council Reg (EU) 269/2014.',
        immudbTxId: 'tx-immudb-984209'
      },
      {
        id: 'TX-984208',
        txHash: '0x7e1920384a7192834b71293847a9f812',
        timestamp: new Date(Date.now() - 1000 * 60 * 12).toISOString(),
        originator: {
          name: 'Lucas Van Der Berg',
          iban: 'DE89370400440532013000',
          bic: 'DBEUMM21',
          country: 'Germany',
          countryCode: 'DE',
          isPep: false,
          isSanctioned: false,
          entityType: 'INDIVIDUAL',
          accountAgeMonths: 84
        },
        beneficiary: {
          name: 'Sophie Martin',
          iban: 'FR7630006000011234567890189',
          bic: 'BNPAFRPP',
          country: 'France',
          countryCode: 'FR',
          isPep: false,
          isSanctioned: false,
          entityType: 'INDIVIDUAL',
          accountAgeMonths: 72
        },
        amount: 850,
        currency: 'EUR',
        channel: 'SEPA_INSTANT',
        riskScore: 8,
        riskLevel: 'LOW',
        indicators: [],
        status: 'SETTLED',
        fiuReportingRequired: false,
        notes: 'Standard verified retail consumer payment. All CDD baseline thresholds compliant.',
        immudbTxId: 'tx-immudb-984208'
      },
      {
        id: 'TX-984207',
        txHash: '0x12a9bc83f0192847a192834719283749',
        timestamp: new Date(Date.now() - 1000 * 60 * 16).toISOString(),
        originator: {
          name: 'Unhosted Wallet 0x9b4a...f721',
          iban: '0x9b4a2e88102381f9a81237c8912384729104f721',
          country: 'Unknown (Self-Custody)',
          countryCode: 'XX',
          isPep: false,
          isSanctioned: false,
          entityType: 'UNHOSTED_WALLET',
          accountAgeMonths: 1
        },
        beneficiary: {
          name: 'Baltic FinTech Services OÜ',
          iban: 'EE382200221020145682',
          bic: 'LHVE22',
          country: 'Estonia',
          countryCode: 'EE',
          isPep: false,
          isSanctioned: false,
          entityType: 'VASP',
          accountAgeMonths: 24
        },
        amount: 14200,
        currency: 'EUR',
        channel: 'CRYPTO_VASP',
        riskScore: 78,
        riskLevel: 'HIGH',
        indicators: [EU_AML_INDICATORS.CRYPTO_TRAVEL_RULE_BREACH],
        status: 'FLAGGED_REVIEW',
        fiuReportingRequired: true,
        notes: 'TFR Rule violation: Unhosted wallet crypto transfer exceeding €1,000 without mandatory originator metadata verification.',
        immudbTxId: 'tx-immudb-984207'
      }
    ];

    this.messageHistory = initialSeeds;
  }

  public connect(): void {
    if (this.status === 'CONNECTED') return;

    this.status = 'RECONNECTING';
    this.broadcast({ type: 'STATUS_CHANGE', payload: { status: this.status } });

    setTimeout(() => {
      this.status = 'CONNECTED';
      this.broadcast({
        type: 'STATUS_CHANGE',
        payload: {
          status: this.status,
          endpoint: getPublicEndpoints().wsBaseUrl.replace('/v1/ws', '/v1/aml-monitoring'),
          protocol: 'WSS-TLS1.3-AMLR',
          connectedAt: new Date().toISOString()
        }
      });
      this.startGenerator();
    }, 450);
  }

  public disconnect(): void {
    this.status = 'DISCONNECTED';
    if (this.timer) {
      clearInterval(this.timer);
      this.timer = null;
    }
    this.broadcast({ type: 'STATUS_CHANGE', payload: { status: this.status } });
  }

  public pause(): void {
    if (this.status === 'CONNECTED') {
      this.status = 'PAUSED';
      if (this.timer) {
        clearInterval(this.timer);
        this.timer = null;
      }
      this.broadcast({ type: 'STATUS_CHANGE', payload: { status: this.status } });
    }
  }

  public resume(): void {
    if (this.status === 'PAUSED') {
      this.status = 'CONNECTED';
      this.broadcast({ type: 'STATUS_CHANGE', payload: { status: this.status } });
      this.startGenerator();
    }
  }

  public setSpeed(speedMultiplier: number): void {
    // base 1800ms / multiplier
    this.intervalMs = Math.max(250, Math.round(1800 / speedMultiplier));
    if (this.status === 'CONNECTED') {
      if (this.timer) clearInterval(this.timer);
      this.startGenerator();
    }
  }

  public subscribe(listener: MessageListener): () => void {
    this.listeners.add(listener);
    // Send current status and historical records immediately
    listener({ type: 'STATUS_CHANGE', payload: { status: this.status } });
    listener({ type: 'HISTORY_INIT', payload: { transactions: this.messageHistory, metrics: this.metrics } });

    return () => {
      this.listeners.delete(listener);
    };
  }

  private broadcast(message: { type: string; payload: any }) {
    this.listeners.forEach((listener) => {
      try {
        listener(message);
      } catch (err) {
        console.error('WebSocket listener error:', err);
      }
    });
  }

  private startGenerator() {
    if (this.timer) clearInterval(this.timer);

    this.timer = setInterval(() => {
      if (this.status !== 'CONNECTED') return;

      const newTx = this.generateSyntheticTransaction();
      this.recordTransaction(newTx);
    }, this.intervalMs);
  }

  public triggerSpecificScenario(scenarioType: 'STRUCTURING' | 'SANCTIONS_HIT' | 'VELOCITY_LAYERING' | 'CRYPTO_TFR' | 'SHELL_SPIKE' | 'CLEAN_SEPA'): LiveTransaction {
    const newTx = this.generateSyntheticTransaction(scenarioType);
    this.recordTransaction(newTx);
    return newTx;
  }

  private recordTransaction(tx: LiveTransaction) {
    this.messageHistory.unshift(tx);
    if (this.messageHistory.length > 80) {
      this.messageHistory.pop();
    }

    // Update real-time metrics
    this.metrics.totalMonitoredVolumeEur += tx.amount;
    this.metrics.totalProcessedCount += 1;
    this.metrics.latencyMs = Math.floor(18 + Math.random() * 14);
    this.metrics.msgPerSec = parseFloat((1000 / this.intervalMs).toFixed(1));

    if (tx.riskLevel === 'HIGH' || tx.riskLevel === 'CRITICAL') {
      this.metrics.flaggedCount += 1;
    }
    if (tx.fiuReportingRequired) {
      this.metrics.sarCount += 1;
    }
    if (tx.status === 'QUARANTINED') {
      this.metrics.quarantinedAmountEur += tx.amount;
    }

    tx.indicators.forEach(ind => {
      this.metrics.indicatorCounts[ind.code] = (this.metrics.indicatorCounts[ind.code] || 0) + 1;
    });

    this.broadcast({
      type: 'TRANSACTION_STREAM',
      payload: { transaction: tx, metrics: this.metrics }
    });

    if (tx.riskLevel === 'CRITICAL' || tx.fiuReportingRequired) {
      this.broadcast({
        type: 'SUSPICIOUS_ACTIVITY_ALERT',
        payload: {
          alertId: `ALT-${tx.id}`,
          title: `AML Red Flag: ${tx.indicators.map(i => i.name).join(' + ') || 'High Risk Transaction'}`,
          transaction: tx,
          timestamp: new Date().toISOString()
        }
      });
    }
  }

  private generateSyntheticTransaction(forcedScenario?: 'STRUCTURING' | 'SANCTIONS_HIT' | 'VELOCITY_LAYERING' | 'CRYPTO_TFR' | 'SHELL_SPIKE' | 'CLEAN_SEPA'): LiveTransaction {
    const id = `TX-${Math.floor(100000 + Math.random() * 900000)}`;
    const txHash = `0x${Array.from({ length: 32 }, () => Math.floor(Math.random() * 16).toString(16)).join('')}`;
    const immudbTxId = `tx-immudb-${Math.floor(800000 + Math.random() * 200000)}`;
    const timestamp = new Date().toISOString();

    // Determine if this generated event will be suspicious
    // If not forced, ~25% chance of being suspicious to make dashboard engaging
    const isSuspicious = forcedScenario ? forcedScenario !== 'CLEAN_SEPA' : Math.random() < 0.28;

    let scenario = forcedScenario;
    if (!scenario && isSuspicious) {
      const scenarios: Array<'STRUCTURING' | 'SANCTIONS_HIT' | 'VELOCITY_LAYERING' | 'CRYPTO_TFR' | 'SHELL_SPIKE'> = [
        'STRUCTURING', 'SANCTIONS_HIT', 'VELOCITY_LAYERING', 'CRYPTO_TFR', 'SHELL_SPIKE'
      ];
      scenario = scenarios[Math.floor(Math.random() * scenarios.length)];
    }

    // Default clean transaction
    if (!isSuspicious || scenario === 'CLEAN_SEPA') {
      const c1 = COMPLIANT_EU_COUNTRIES[Math.floor(Math.random() * COMPLIANT_EU_COUNTRIES.length)];
      const c2 = COMPLIANT_EU_COUNTRIES[Math.floor(Math.random() * COMPLIANT_EU_COUNTRIES.length)];
      const origName = INDIVIDUAL_NAMES[Math.floor(Math.random() * INDIVIDUAL_NAMES.length)];
      const beneName = CORPORATE_NAMES[Math.floor(Math.random() * CORPORATE_NAMES.length)];
      const amount = Math.floor(45 + Math.random() * 3200);

      return {
        id,
        txHash,
        timestamp,
        originator: {
          name: origName,
          iban: `${c1.code}89370400440532013${Math.floor(100 + Math.random() * 900)}`,
          bic: 'DEUTDEDD',
          country: c1.name,
          countryCode: c1.code,
          isPep: false,
          isSanctioned: false,
          entityType: 'INDIVIDUAL',
          accountAgeMonths: Math.floor(12 + Math.random() * 72)
        },
        beneficiary: {
          name: beneName,
          iban: `${c2.code}91ABNA04171643${Math.floor(10 + Math.random() * 90)}`,
          bic: 'ABNANL2A',
          country: c2.name,
          countryCode: c2.code,
          isPep: false,
          isSanctioned: false,
          entityType: 'CORPORATE',
          accountAgeMonths: Math.floor(24 + Math.random() * 96)
        },
        amount,
        currency: 'EUR',
        channel: 'SEPA_INSTANT',
        riskScore: Math.floor(4 + Math.random() * 18),
        riskLevel: 'LOW',
        indicators: [],
        status: 'SETTLED',
        fiuReportingRequired: false,
        notes: 'Compliant intra-EU commercial clearing. CDD automated check passed.',
        immudbTxId
      };
    }

    // Scenario 1: Structuring / Smurfing
    if (scenario === 'STRUCTURING') {
      const c1 = COMPLIANT_EU_COUNTRIES[Math.floor(Math.random() * COMPLIANT_EU_COUNTRIES.length)];
      const amounts = [9650, 9820, 9940, 9890, 9750];
      const amount = amounts[Math.floor(Math.random() * amounts.length)];

      return {
        id,
        txHash,
        timestamp,
        originator: {
          name: 'Yoko Sato (Sole Proprietorship)',
          iban: `${c1.code}440532013000982312`,
          bic: 'COMMDEFF',
          country: c1.name,
          countryCode: c1.code,
          isPep: false,
          isSanctioned: false,
          entityType: 'INDIVIDUAL',
          accountAgeMonths: 3
        },
        beneficiary: {
          name: 'Crypto Liquidity Services S.A.',
          iban: 'LU280019400644750000',
          bic: 'BCLULULL',
          country: 'Luxembourg',
          countryCode: 'LU',
          isPep: false,
          isSanctioned: false,
          entityType: 'VASP',
          accountAgeMonths: 14
        },
        amount,
        currency: 'EUR',
        channel: 'SEPA_INSTANT',
        riskScore: 84,
        riskLevel: 'HIGH',
        indicators: [EU_AML_INDICATORS.STRUCTURING_SUB_THRESHOLD],
        status: 'SUSPENDED_SAR',
        fiuReportingRequired: true,
        notes: `Structured payment of €${amount.toLocaleString()} positioned just below statutory €10,000 AML threshold. Automatic CTR evasion flagged.`,
        immudbTxId
      };
    }

    // Scenario 2: Sanctions List Hit
    if (scenario === 'SANCTIONS_HIT') {
      const susEntity = SUSPICIOUS_ENTITIES[Math.floor(Math.random() * SUSPICIOUS_ENTITIES.length)];
      const c2 = COMPLIANT_EU_COUNTRIES[Math.floor(Math.random() * COMPLIANT_EU_COUNTRIES.length)];
      const amount = Math.floor(45000 + Math.random() * 120000);

      return {
        id,
        txHash,
        timestamp,
        originator: {
          name: susEntity.name,
          iban: `${susEntity.code}778901234567890123`,
          bic: 'EXPSRUMM',
          country: susEntity.country,
          countryCode: susEntity.code,
          isPep: susEntity.isPep,
          isSanctioned: susEntity.isSanctioned,
          entityType: susEntity.isPep ? 'INDIVIDUAL' : 'CORPORATE',
          accountAgeMonths: 48
        },
        beneficiary: {
          name: 'Rhine Horizon Trading BV',
          iban: `${c2.code}91ABNA0417164300`,
          bic: 'ABNANL2A',
          country: c2.name,
          countryCode: c2.code,
          isPep: false,
          isSanctioned: false,
          entityType: 'CORPORATE',
          accountAgeMonths: 60
        },
        amount,
        currency: 'EUR',
        channel: 'SWIFT_MX',
        riskScore: 98,
        riskLevel: 'CRITICAL',
        indicators: [EU_AML_INDICATORS.SANCTION_LIST_HIT, EU_AML_INDICATORS.HIGH_RISK_THIRD_COUNTRY],
        status: 'QUARANTINED',
        fiuReportingRequired: true,
        notes: `CRITICAL SANCTION HIT: Entity ${susEntity.name} is designated under EU Restrictive Measures & UN Sanctions. Funds quarantined immediately.`,
        immudbTxId
      };
    }

    // Scenario 3: High-Velocity Layering (Pass-Through Wire)
    if (scenario === 'VELOCITY_LAYERING') {
      const amount = Math.floor(180000 + Math.random() * 250000);
      return {
        id,
        txHash,
        timestamp,
        originator: {
          name: 'Novatek Global Logistics FZCO',
          iban: 'AE880330000000012345678',
          bic: 'EMARAEAA',
          country: 'United Arab Emirates',
          countryCode: 'AE',
          isPep: false,
          isSanctioned: false,
          entityType: 'CORPORATE',
          accountAgeMonths: 1
        },
        beneficiary: {
          name: 'Hexagon Venture Holdings S.A.',
          iban: 'FR7630006000011234567890189',
          bic: 'BNPAFRPP',
          country: 'France',
          countryCode: 'FR',
          isPep: false,
          isSanctioned: false,
          entityType: 'CORPORATE',
          accountAgeMonths: 2
        },
        amount,
        currency: 'EUR',
        channel: 'TARGET2',
        riskScore: 92,
        riskLevel: 'CRITICAL',
        indicators: [EU_AML_INDICATORS.RAPID_VELOCITY_LAYERING, EU_AML_INDICATORS.HIGH_RISK_THIRD_COUNTRY],
        status: 'SUSPENDED_SAR',
        fiuReportingRequired: true,
        notes: 'Pass-through velocity anomaly: €' + amount.toLocaleString() + ' deposited and sliced into 6 outbound sub-accounts within 180 seconds.',
        immudbTxId
      };
    }

    // Scenario 4: Crypto Travel Rule Breach
    if (scenario === 'CRYPTO_TFR') {
      const amount = Math.floor(8500 + Math.random() * 24000);
      return {
        id,
        txHash,
        timestamp,
        originator: {
          name: 'Unhosted Self-Custody Wallet (Tornado Mixer Route)',
          iban: '0x71C...4e89',
          country: 'Unhosted Self-Custody',
          countryCode: 'XX',
          isPep: false,
          isSanctioned: false,
          entityType: 'UNHOSTED_WALLET',
          accountAgeMonths: 0
        },
        beneficiary: {
          name: 'Baltic FinTech Services OÜ',
          iban: 'EE382200221020145682',
          bic: 'LHVE22',
          country: 'Estonia',
          countryCode: 'EE',
          isPep: false,
          isSanctioned: false,
          entityType: 'VASP',
          accountAgeMonths: 36
        },
        amount,
        currency: 'EUR',
        channel: 'CRYPTO_VASP',
        riskScore: 79,
        riskLevel: 'HIGH',
        indicators: [EU_AML_INDICATORS.CRYPTO_TRAVEL_RULE_BREACH],
        status: 'FLAGGED_REVIEW',
        fiuReportingRequired: true,
        notes: 'EU TFR 2023/1113 non-compliance: Unhosted wallet transfer > €1,000 without mandatory originator identity proof and verifiable address payload.',
        immudbTxId
      };
    }

    // Scenario 5: Shell Company Surge
    const amount = Math.floor(125000 + Math.random() * 320000);
    return {
      id,
      txHash,
      timestamp,
      originator: {
        name: 'Grand Offshore Management Ltd',
        iban: 'KY8900223300001234567890',
        bic: 'CAYMKY2X',
        country: 'Cayman Islands',
        countryCode: 'KY',
        isPep: false,
        isSanctioned: false,
        entityType: 'CORPORATE',
        accountAgeMonths: 1
      },
      beneficiary: {
        name: 'Alpha Capital Partners GmbH',
        iban: 'DE89370400440532013000',
        bic: 'DBEUMM21',
        country: 'Germany',
        countryCode: 'DE',
        isPep: false,
        isSanctioned: false,
        entityType: 'CORPORATE',
        accountAgeMonths: 2
      },
      amount,
      currency: 'EUR',
      channel: 'SWIFT_MX',
      riskScore: 89,
      riskLevel: 'CRITICAL',
      indicators: [EU_AML_INDICATORS.SHELL_DORMANT_SURGE, EU_AML_INDICATORS.HIGH_RISK_THIRD_COUNTRY],
      status: 'SUSPENDED_SAR',
      fiuReportingRequired: true,
      notes: 'Shell company anomaly under EU Unshell Directive: Entity incorporated < 6 months with 1 employee receiving €' + amount.toLocaleString() + ' consulting invoice.',
      immudbTxId
    };
  }

  public getStatus(): WebSocketStatus {
    return this.status;
  }

  public getMetrics(): StreamMetrics {
    return { ...this.metrics };
  }

  public getHistory(): LiveTransaction[] {
    return [...this.messageHistory];
  }

  public updateTransactionStatus(txId: string, newStatus: 'SETTLED' | 'SUSPENDED_SAR' | 'FLAGGED_REVIEW' | 'QUARANTINED', resolutionNotes?: string) {
    const tx = this.messageHistory.find(t => t.id === txId);
    if (tx) {
      tx.status = newStatus;
      if (resolutionNotes) {
        tx.notes = `${tx.notes || ''} [AUDITOR RESOLUTION: ${resolutionNotes}]`;
      }
      this.broadcast({
        type: 'TRANSACTION_UPDATED',
        payload: { transaction: tx }
      });
    }
  }
}

// Singleton instance
export const mockWebSocketService = new MockWebSocketService();
