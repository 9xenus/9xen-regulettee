import { RegulatoryUpdate } from '../types';

const UPDATE_POOL: Omit<RegulatoryUpdate, 'id' | 'timestamp' | 'read'>[] = [
  {
    title: 'EDPB Draft Guidelines on Consent Architecture',
    description: 'European Data Protection Board has released new draft guidelines targeting "dark patterns" in cookie consent banners. Immediate review of current design patterns is advised.',
    category: 'GDPR',
    severity: 'warning',
    link: 'https://edpb.europa.eu/our-work-tools/documents/public-consultations_en',
  },
  {
    title: 'EU AI Act High-Risk Models Registration Mandatory',
    description: 'The European Commission has finalized the portal for registration of foundational models categorized under high systemic risk. Compliance documentation must be submitted by Q3.',
    category: 'EU AI Act',
    severity: 'critical',
    link: 'https://digital-strategy.ec.europa.eu/en/policies/regulatory-framework-ai',
  },
  {
    title: 'France CNIL Enforces Strict Consent Logging Audits',
    description: 'French regulator CNIL announced active automated probing for consent log authenticity. Organizations must retain verifiable proof of active consent for at least 5 years.',
    category: 'GDPR',
    severity: 'critical',
    link: 'https://www.cnil.fr/en',
  },
  {
    title: 'EU-US Data Privacy Framework Annual Review',
    description: 'The first annual review of the DPF has concluded. While transatlantic flow is maintained, heightened oversight on downstream vendor sub-processing has been recommended.',
    category: 'Data Residency',
    severity: 'info',
    link: 'https://www.dataprivacyframework.gov/s/',
  },
  {
    title: 'Germany BfDI Issues Decentralized Cloud Storage Warning',
    description: 'Federal Commissioner for Data Protection issues directive concerning decentralized multi-region cloud storages. PII data segments must not escape geographical sovereign boundaries.',
    category: 'Data Residency',
    severity: 'warning',
    link: 'https://www.bfdi.bund.de/EN/Home/home_node.html',
  },
  {
    title: 'European Health Data Space (EHDS) Interoperability Mandate',
    description: 'The European Parliament has approved the EHDS framework. Under the new rules, health tech vendors must implement local cryptographic zero-trust architectures.',
    category: 'Policy Change',
    severity: 'info',
    link: 'https://health.ec.europa.eu/ehealth-digital-health-and-care/european-health-data-space_en',
  },
  {
    title: 'Irish DPC Launches Query into AI Scraper Protocols',
    description: 'Irish Data Protection Commissioner issues formal inquiry into passive web-scraping agents. Compliance validation requires explicit opt-out verification on client domains.',
    category: 'EU AI Act',
    severity: 'warning',
    link: 'https://www.dataprotection.ie/',
  },
  {
    title: 'Revised Standard Contractual Clauses (SCCs) Published',
    description: 'The EU Commission has adopted modern SCC templates to incorporate specific Article 28 GDPR processing obligations for sub-processors outside the EEA.',
    category: 'Policy Change',
    severity: 'info',
  },
  {
    title: 'CJEU Strengthens Right to Erasure in Search Indexing',
    description: 'The Court of Justice of the European Union rules search engines must expunge matching listings immediately upon credible proof of inaccurate biographical PII.',
    category: 'GDPR',
    severity: 'warning',
  },
  {
    title: 'Austria DSB Rules on Multi-Region Analytical Scripts',
    description: 'Austrian Data Protection Authority rules default IP-masking on server-side proxies does not fully anonymize users. Explicit analytical consent required.',
    category: 'GDPR',
    severity: 'critical',
  },
  {
    title: 'Pending Deadline: Annual GDPR Compliance Report',
    description: 'Your linked data ecosystem is missing the mandatory annual GDPR compliance audit report. Submission deadline is in 14 days.',
    category: 'General',
    severity: 'warning',
  },
  {
    title: 'Detected Privacy Violation: Unauthorized Data Access',
    description: 'Critical Alert: Anomalous access patterns detected in your linked data ecosystem indicating a potential privacy violation in EU-WEST-1 region.',
    category: 'Data Residency',
    severity: 'critical',
  }
];

let currentIndex = 0;

export const fetchLatestRegulatoryUpdate = (): Omit<RegulatoryUpdate, 'id' | 'timestamp' | 'read'> => {
  const update = UPDATE_POOL[currentIndex];
  // Cycle through the pool sequentially
  currentIndex = (currentIndex + 1) % UPDATE_POOL.length;
  return update;
};

// Generates an initial batch of updates for the feed
export const getInitialUpdates = (): RegulatoryUpdate[] => {
  return [
    {
      id: 'init-1',
      title: 'EU AI Act Conformity Assessments Standardized',
      description: 'The European Union standardizing bodies have defined formal conformity certification formats for generative models operating in commercial tenant spaces.',
      category: 'EU AI Act',
      severity: 'warning',
      timestamp: new Date(Date.now() - 3600000 * 2).toISOString(), // 2 hours ago
      read: false,
    },
    {
      id: 'init-2',
      title: 'Data Residency Localization Regulations Consolidated',
      description: 'New unified guidelines reinforce that compliance ledgers, audit logs, and diagnostic telemetry containing customer IDs must stay within sovereign EU data realms.',
      category: 'Data Residency',
      severity: 'info',
      timestamp: new Date(Date.now() - 3600000 * 5).toISOString(), // 5 hours ago
      read: true,
    }
  ];
};
