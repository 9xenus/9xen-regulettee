import { prisma } from '../lib/prisma';

export const ENFORCEMENT_LEVELS = [
  { 
    key: 'L1_SMART_CONTRACT_DEDUCT', 
    label: 'Smart Contract Auto-Deduct', 
    description: 'Automated treasury deduction via registered smart contracts.',
    technicalAction: 'BLOCKCHAIN_DEDUCT',
    defaultMode: 'AUTO' as const,
    triggerFields: ['riskScore', 'violationType'],
    legalBasisFields: ['regulation', 'article']
  },
  { 
    key: 'L2_DATA_RESIDENCY_LOCK', 
    label: 'Data Residency Lock', 
    description: 'Enforce strict regional data stay orders via Cloud Provider IAM.',
    technicalAction: 'IAM_REGIONAL_LOCK',
    defaultMode: 'AUTO' as const,
    triggerFields: ['impact', 'residencyCompliance'],
    legalBasisFields: ['regulation', 'article']
  },
  { 
    key: 'L3_CROSS_BORDER_FREEZE', 
    label: 'Cross-Border Transfer Freeze', 
    description: 'Instant suspension of all non-EU data egress tunnels.',
    technicalAction: 'NETWORK_EGRESS_SUSPEND',
    defaultMode: 'AUTO' as const,
    triggerFields: ['egressVolume', 'destinationJurisdiction'],
    legalBasisFields: ['regulation', 'article']
  },
  { 
    key: 'L4_SERVICE_BLOCKADE', 
    label: 'Service Blockade (Public)', 
    description: 'DNS and IP-level blocking of public-facing service endpoints.',
    technicalAction: 'DNS_SINKHOLE',
    defaultMode: 'MANUAL' as const,
    triggerFields: ['severity', 'repetitionCount'],
    legalBasisFields: ['regulation', 'article', 'courtOrderRef']
  },
  { 
    key: 'L5_AD_TECH_RESTRICTION', 
    label: 'Ad-Tech Revenue Suspension', 
    description: 'Interdiction of programmatic ad-bidding and monetization APIs.',
    technicalAction: 'AD_API_SUSPEND',
    defaultMode: 'MANUAL' as const,
    triggerFields: ['violationType'],
    legalBasisFields: ['regulation', 'article']
  },
  { 
    key: 'L6_VENDOR_ECOSYSTEM_ISOLATION', 
    label: 'Vendor Isolation', 
    description: 'Mandatory suspension of B2B API keys for downstream processors.',
    technicalAction: 'B2B_API_REVOKE',
    defaultMode: 'MANUAL' as const,
    triggerFields: ['vendorRisk'],
    legalBasisFields: ['regulation', 'article']
  },
  { 
    key: 'L7_JUDICIAL_PROSECUTION', 
    label: 'Judicial Prosecution Link', 
    description: 'Automated case hand-off to the National Public Prosecutor.',
    technicalAction: 'JUDICIAL_HANDOFF',
    defaultMode: 'MANUAL' as const,
    triggerFields: ['legalCompliance'],
    legalBasisFields: ['regulation', 'article', 'caseEvidenceRef']
  },
  { 
    key: 'L8_LICENSE_REVOCATION', 
    label: 'Operating License Revocation', 
    description: 'Complete legal and digital withdrawal of the right to operate in the EU.',
    technicalAction: 'LICENSE_INVALIDATE',
    defaultMode: 'MANUAL' as const,
    triggerFields: ['totalViolationScore'],
    legalBasisFields: ['regulation', 'article', 'finalDecisionRef']
  }
];

export async function seedEnforcementTemplates() {
  if (!prisma) {
    console.warn('[Seed] Prisma not initialized (missing DATABASE_URL), skipping seeding.');
    return;
  }
  console.log('[Seed] Seeding Enforcement Templates...');
  for (const level of ENFORCEMENT_LEVELS) {
    await prisma.enforcementLevelTemplate.upsert({
      where: { key: level.key },
      update: level,
      create: level as any
    });
  }
  console.log('[Seed] Enforcement Templates seeded successfully.');
}
