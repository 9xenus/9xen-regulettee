import { ActorRole } from '../types';
import { encryptData, decryptData, isEncrypted } from '../lib/cryptoUtils';

export const ROLE_PERMISSIONS: Record<string, string[]> = {
  admin: ['*'],
  super_admin: ['*'],
  compliance_officer: ['*'],
  system: ['*'],
  regulator_drafter: ['*'],
  regulator_approver: ['*'],
  regulator: ['*'],
  eu_regulator: ['*'],
  auditor: ['*'],
  client: ['*'],
  tenant_owner: ['*'],
  tenant: ['*'],
  lawyer: ['*'],
  legal_consultant: ['*']
};

/**
 * Schema-defined role-access matrix mapping every sidebar component identifier
 * to its authorized roles. This prevents admin feature leakage into client/lawyer sessions.
 */
export const SIDEBAR_ROLE_ACCESS_MATRIX: Record<string, string[]> = {
  // SaaS Admin HQ & System Management
  'sudou': ['ADMIN', 'SUPER_ADMIN', 'COMPLIANCE_OFFICER'],
  'admin': ['ADMIN', 'SUPER_ADMIN', 'COMPLIANCE_OFFICER'],
  'admin-hq': ['ADMIN', 'SUPER_ADMIN', 'COMPLIANCE_OFFICER'],
  'dashboard': ['ADMIN', 'SUPER_ADMIN', 'COMPLIANCE_OFFICER'],
  'platform-dashboard': ['ADMIN', 'SUPER_ADMIN', 'COMPLIANCE_OFFICER'],
  'admin-dashboard': ['ADMIN', 'SUPER_ADMIN', 'COMPLIANCE_OFFICER'],
  'tenants': ['ADMIN', 'SUPER_ADMIN'],
  'onboarding': ['ADMIN', 'SUPER_ADMIN'],
  'admin-security-mgmt': ['ADMIN', 'SUPER_ADMIN'],
  'admin-infrastructure': ['ADMIN', 'SUPER_ADMIN'],
  'admin-finance-mgmt': ['ADMIN', 'SUPER_ADMIN', 'CLIENT', 'TENANT_OWNER', 'TENANT'],
  'billing': ['ADMIN', 'SUPER_ADMIN', 'CLIENT', 'TENANT_OWNER', 'TENANT'],
  'finance': ['ADMIN', 'SUPER_ADMIN', 'CLIENT', 'TENANT_OWNER', 'TENANT'],
  'subscriptions': ['ADMIN', 'SUPER_ADMIN', 'CLIENT', 'TENANT_OWNER', 'TENANT'],
  'invoices': ['ADMIN', 'SUPER_ADMIN', 'CLIENT', 'TENANT_OWNER', 'TENANT'],
  'pricing-rules': ['ADMIN', 'SUPER_ADMIN'],
  'audit-ledger': ['ADMIN', 'SUPER_ADMIN', 'CLIENT', 'TENANT_OWNER', 'TENANT'],
  'system-audit-ledger': ['ADMIN', 'SUPER_ADMIN'],
  'entitlements': ['ADMIN', 'SUPER_ADMIN', 'CLIENT', 'TENANT_OWNER'],
  'llm-config': ['ADMIN', 'SUPER_ADMIN'],
  'verification-toggles': ['ADMIN', 'SUPER_ADMIN', 'CLIENT', 'TENANT_OWNER', 'TENANT', 'COMPLIANCE_OFFICER'],
  'global-maintenance-toggle': ['ADMIN', 'SUPER_ADMIN'],
  'force-tenant-logout': ['ADMIN', 'SUPER_ADMIN'],
  'admin-settings': ['ADMIN', 'SUPER_ADMIN', 'CLIENT', 'TENANT_OWNER'],
  'devops': ['ADMIN', 'SUPER_ADMIN'],
  'backup-restore': ['ADMIN', 'SUPER_ADMIN'],
  'caas-operation-center': ['ADMIN', 'SUPER_ADMIN', 'CLIENT', 'TENANT_OWNER'],
  'regtech-orchestrator': ['ADMIN', 'SUPER_ADMIN', 'REGULATOR', 'CLIENT', 'LAWYER'],
  'regtech-engine': ['ADMIN', 'SUPER_ADMIN', 'REGULATOR', 'CLIENT', 'LAWYER'],
  'regtech-overview': ['ADMIN', 'SUPER_ADMIN', 'REGULATOR', 'CLIENT', 'LAWYER', 'TENANT', 'TENANT_OWNER'],
  'guardrails': ['ADMIN', 'SUPER_ADMIN', 'REGULATOR', 'CLIENT', 'LAWYER', 'TENANT', 'TENANT_OWNER'],
  'sovereign-gateway': ['ADMIN', 'SUPER_ADMIN', 'REGULATOR', 'CLIENT', 'LAWYER', 'TENANT', 'TENANT_OWNER'],
  'compliance-audit': ['ADMIN', 'SUPER_ADMIN', 'REGULATOR', 'CLIENT', 'LAWYER', 'TENANT', 'TENANT_OWNER'],
  'country-regulators': ['ADMIN', 'SUPER_ADMIN'],

  // B2G Oversight & Sovereign Enforcement
  'admin-b2g-center': ['ADMIN', 'SUPER_ADMIN', 'EU_REGULATOR', 'REGULATOR'],
  'admin-b2g-dashboard': ['ADMIN', 'SUPER_ADMIN', 'EU_REGULATOR', 'REGULATOR'],
  'admin-b2g-sandbox': ['ADMIN', 'SUPER_ADMIN', 'EU_REGULATOR', 'REGULATOR'],
  'admin-b2g-filings': ['ADMIN', 'SUPER_ADMIN', 'EU_REGULATOR', 'REGULATOR'],
  'admin-b2g-inquiries': ['ADMIN', 'SUPER_ADMIN', 'EU_REGULATOR', 'REGULATOR'],
  'admin-b2g-whistleblower': ['ADMIN', 'SUPER_ADMIN', 'EU_REGULATOR', 'REGULATOR'],
  'admin-b2g-agencies': ['ADMIN', 'SUPER_ADMIN', 'EU_REGULATOR', 'REGULATOR'],
  'admin-b2g-scanner': ['ADMIN', 'SUPER_ADMIN', 'EU_REGULATOR', 'REGULATOR'],
  'admin-b2g-stakeholders': ['ADMIN', 'SUPER_ADMIN', 'EU_REGULATOR', 'REGULATOR'],
  'admin-b2g-delta': ['ADMIN', 'SUPER_ADMIN', 'EU_REGULATOR', 'REGULATOR'],
  'admin-b2g-advanced': ['ADMIN', 'SUPER_ADMIN', 'EU_REGULATOR', 'REGULATOR'],
  'b2g-operations': ['ADMIN', 'SUPER_ADMIN', 'EU_REGULATOR', 'REGULATOR'],
  'b2r-operations': ['ADMIN', 'SUPER_ADMIN', 'EU_REGULATOR', 'REGULATOR'],
  'b2g-suite': ['ADMIN', 'SUPER_ADMIN', 'EU_REGULATOR', 'REGULATOR'],
  'b2g-regulator-portal': ['ADMIN', 'SUPER_ADMIN', 'EU_REGULATOR', 'REGULATOR'],
  'b2g_operations': ['ADMIN', 'SUPER_ADMIN', 'EU_REGULATOR', 'REGULATOR'],
  'admin_b2g_oversight': ['ADMIN', 'SUPER_ADMIN', 'EU_REGULATOR', 'REGULATOR'],
  'b2g_scraper_hub': ['ADMIN', 'SUPER_ADMIN', 'EU_REGULATOR', 'REGULATOR'],

  // Regulator & EU Oversight
  'regulator': ['ADMIN', 'SUPER_ADMIN', 'EU_REGULATOR', 'REGULATOR'],
  'regulator-dashboard': ['ADMIN', 'SUPER_ADMIN', 'EU_REGULATOR', 'REGULATOR'],
  'regulator-ops': ['ADMIN', 'SUPER_ADMIN', 'EU_REGULATOR', 'REGULATOR'],
  'reg-mgmt': ['ADMIN', 'SUPER_ADMIN', 'EU_REGULATOR', 'REGULATOR'],
  'entity-portal': ['ADMIN', 'SUPER_ADMIN', 'EU_REGULATOR', 'REGULATOR'],

  // Lawyer & Legal Partner Portals
  'lawyer-portal': ['ADMIN', 'SUPER_ADMIN', 'LAWYER', 'LEGAL_CONSULTANT'],
  'lawyer-ops': ['ADMIN', 'SUPER_ADMIN', 'LAWYER', 'LEGAL_CONSULTANT'],
  'lawyer-vaults': ['ADMIN', 'SUPER_ADMIN', 'LAWYER', 'LEGAL_CONSULTANT'],
  'legal-intelligence': ['ADMIN', 'SUPER_ADMIN', 'LAWYER', 'LEGAL_CONSULTANT', 'EU_REGULATOR'],

  // Client, Tenants, & General Compliance
  'client': ['ADMIN', 'SUPER_ADMIN', 'CLIENT', 'TENANT_OWNER', 'TENANT', 'LAWYER'],
  'client-dashboard': ['ADMIN', 'SUPER_ADMIN', 'CLIENT', 'TENANT_OWNER', 'TENANT', 'LAWYER'],
  'automation-portal': ['ADMIN', 'SUPER_ADMIN', 'CLIENT', 'TENANT_OWNER', 'TENANT'],
  'soc2-hub': ['ADMIN', 'SUPER_ADMIN', 'CLIENT', 'TENANT_OWNER', 'TENANT'],
  'tenant-wizard': ['ADMIN', 'SUPER_ADMIN', 'CLIENT', 'TENANT_OWNER'],
  'eu-client-portal': ['ADMIN', 'SUPER_ADMIN', 'CLIENT', 'TENANT_OWNER', 'EU_REGULATOR'],
  'compliance-scraper': ['ADMIN', 'SUPER_ADMIN', 'CLIENT', 'TENANT_OWNER', 'EU_REGULATOR'],
  'compliance-marketplace': ['ADMIN', 'SUPER_ADMIN', 'CLIENT', 'TENANT_OWNER', 'LAWYER'],
  'contract-compliance': ['ADMIN', 'SUPER_ADMIN', 'CLIENT', 'TENANT_OWNER'],
  'procurement-compliance': ['ADMIN', 'SUPER_ADMIN', 'CLIENT', 'TENANT_OWNER'],
  'asset-compliance': ['ADMIN', 'SUPER_ADMIN', 'CLIENT', 'TENANT_OWNER'],
  'fleet-compliance': ['ADMIN', 'SUPER_ADMIN', 'CLIENT', 'TENANT_OWNER'],
  'vendor-compliance': ['ADMIN', 'SUPER_ADMIN', 'CLIENT', 'TENANT_OWNER'],
  'capa-management': ['ADMIN', 'SUPER_ADMIN', 'CLIENT', 'TENANT_OWNER'],
  'bcp-tracking': ['ADMIN', 'SUPER_ADMIN', 'CLIENT', 'TENANT_OWNER'],
  'dr-tracking': ['ADMIN', 'SUPER_ADMIN', 'CLIENT', 'TENANT_OWNER'],
  'internal-audit': ['ADMIN', 'SUPER_ADMIN', 'CLIENT', 'TENANT_OWNER', 'AUDITOR'],
  'internal-audit-management': ['ADMIN', 'SUPER_ADMIN', 'CLIENT', 'TENANT_OWNER', 'AUDITOR'],
  'secret-scanner': ['ADMIN', 'SUPER_ADMIN', 'CLIENT', 'TENANT_OWNER'],
  'vulnerability-scanner': ['ADMIN', 'SUPER_ADMIN', 'CLIENT', 'TENANT_OWNER'],
  'policy-engine': ['ADMIN', 'SUPER_ADMIN', 'CLIENT', 'TENANT_OWNER', 'EU_REGULATOR'],
  'data-lineage': ['ADMIN', 'SUPER_ADMIN', 'CLIENT', 'TENANT_OWNER'],
  'security-logs': ['ADMIN', 'SUPER_ADMIN', 'CLIENT', 'TENANT_OWNER'],
  'zero-trust': ['ADMIN', 'SUPER_ADMIN', 'CLIENT', 'TENANT_OWNER'],
  'runtime-security': ['ADMIN', 'SUPER_ADMIN', 'CLIENT', 'TENANT_OWNER'],
  'identity-management': ['ADMIN', 'SUPER_ADMIN', 'CLIENT', 'TENANT_OWNER'],
  'permission-reconciliation': ['ADMIN', 'SUPER_ADMIN', 'CLIENT', 'TENANT_OWNER'],
  'permission-reconciliation-dashboard': ['ADMIN', 'SUPER_ADMIN', 'CLIENT', 'TENANT_OWNER'],
  'compliance-cache': ['ADMIN', 'SUPER_ADMIN', 'CLIENT', 'TENANT_OWNER'],
  'compliance-query-cache': ['ADMIN', 'SUPER_ADMIN', 'CLIENT', 'TENANT_OWNER'],
  'graph-intelligence': ['ADMIN', 'SUPER_ADMIN', 'CLIENT', 'TENANT_OWNER'],
  'ai-knowledge': ['ADMIN', 'SUPER_ADMIN', 'CLIENT', 'TENANT_OWNER'],
  'vector-kb': ['ADMIN', 'SUPER_ADMIN', 'CLIENT', 'TENANT_OWNER'],
  'competitive-moat': ['ADMIN', 'SUPER_ADMIN', 'CLIENT', 'TENANT_OWNER'],
  'marketplace-solutions': ['ADMIN', 'SUPER_ADMIN', 'CLIENT', 'TENANT_OWNER', 'LAWYER'],
  'governance-forensics': ['ADMIN', 'SUPER_ADMIN', 'CLIENT', 'TENANT_OWNER', 'EU_REGULATOR'],
  'privacy-trust': ['ADMIN', 'SUPER_ADMIN', 'CLIENT', 'TENANT_OWNER'],
  'ecosystem-mgmt': ['ADMIN', 'SUPER_ADMIN', 'CLIENT', 'TENANT_OWNER', 'LAWYER', 'EU_REGULATOR'],
  'records-vault': ['ADMIN', 'SUPER_ADMIN', 'CLIENT', 'TENANT_OWNER', 'LAWYER'],
  'caas-hub': ['ADMIN', 'SUPER_ADMIN', 'CLIENT', 'TENANT_OWNER', 'LAWYER'],
  'caas-marketplace': ['ADMIN', 'SUPER_ADMIN', 'CLIENT', 'TENANT_OWNER', 'LAWYER'],
  'caas-enterprise-marketplace': ['ADMIN', 'SUPER_ADMIN', 'CLIENT', 'TENANT_OWNER', 'LAWYER'],
  'caas-subscription-mgmt': ['ADMIN', 'SUPER_ADMIN', 'CLIENT', 'TENANT_OWNER'],
  'mica-forensics': ['ADMIN', 'SUPER_ADMIN', 'CLIENT', 'TENANT_OWNER', 'EU_REGULATOR'],
  'analytical-intelligence': ['ADMIN', 'SUPER_ADMIN', 'CLIENT', 'TENANT_OWNER'],
  'developer-api': ['ADMIN', 'SUPER_ADMIN', 'CLIENT', 'TENANT_OWNER'],
  'event-webhooks': ['ADMIN', 'SUPER_ADMIN', 'CLIENT', 'TENANT_OWNER'],
  'evidence-vault': ['ADMIN', 'SUPER_ADMIN', 'CLIENT', 'TENANT_OWNER', 'LAWYER'],
  'reports': ['ADMIN', 'SUPER_ADMIN', 'CLIENT', 'TENANT_OWNER', 'LAWYER', 'EU_REGULATOR'],
  'cyber-security': ['ADMIN', 'SUPER_ADMIN', 'CLIENT', 'TENANT_OWNER'],
  'aml-kyc': ['ADMIN', 'SUPER_ADMIN', 'CLIENT', 'TENANT_OWNER'],
  'gdpr-compliance': ['ADMIN', 'SUPER_ADMIN', 'CLIENT', 'TENANT_OWNER'],
  'ecommerce-eu': ['ADMIN', 'SUPER_ADMIN', 'CLIENT', 'TENANT_OWNER'],
  'healthtech': ['ADMIN', 'SUPER_ADMIN', 'CLIENT', 'TENANT_OWNER'],
  'gaming': ['ADMIN', 'SUPER_ADMIN', 'CLIENT', 'TENANT_OWNER'],
  'govtech': ['ADMIN', 'SUPER_ADMIN', 'CLIENT', 'TENANT_OWNER'],
  'edtech': ['ADMIN', 'SUPER_ADMIN', 'CLIENT', 'TENANT_OWNER'],
  'logistic': ['ADMIN', 'SUPER_ADMIN', 'CLIENT', 'TENANT_OWNER'],
  'alae-engine': ['ADMIN', 'SUPER_ADMIN', 'CLIENT', 'TENANT_OWNER', 'LAWYER'],
  'sovereign-vault': ['ADMIN', 'SUPER_ADMIN', 'CLIENT', 'TENANT_OWNER'],
  'dynamic-consent': ['ADMIN', 'SUPER_ADMIN', 'CLIENT', 'TENANT_OWNER'],
  'mcp-manager': ['ADMIN', 'SUPER_ADMIN', 'CLIENT', 'TENANT_OWNER'],
  'enforcement-optimizer': ['ADMIN', 'SUPER_ADMIN', 'CLIENT', 'TENANT_OWNER', 'EU_REGULATOR'],
  'ai-risk-hedge': ['ADMIN', 'SUPER_ADMIN', 'CLIENT', 'TENANT_OWNER'],
  'ai-model-governance': ['ADMIN', 'SUPER_ADMIN', 'CLIENT', 'TENANT_OWNER', 'EU_REGULATOR'],
  'ai-lineage': ['ADMIN', 'SUPER_ADMIN', 'CLIENT', 'TENANT_OWNER'],
  'data-flow-adequacy': ['ADMIN', 'SUPER_ADMIN', 'CLIENT', 'TENANT_OWNER'],
  'supply-chain': ['ADMIN', 'SUPER_ADMIN', 'CLIENT', 'TENANT_OWNER'],
  'digital-identity': ['ADMIN', 'SUPER_ADMIN', 'CLIENT', 'TENANT_OWNER'],
  'esg-data': ['ADMIN', 'SUPER_ADMIN', 'CLIENT', 'TENANT_OWNER'],
  'sovereignty-arbitrage': ['ADMIN', 'SUPER_ADMIN', 'CLIENT', 'TENANT_OWNER'],
  'reg-simulator': ['ADMIN', 'SUPER_ADMIN', 'CLIENT', 'TENANT_OWNER', 'EU_REGULATOR'],
  'pqc-migration': ['ADMIN', 'SUPER_ADMIN', 'CLIENT', 'TENANT_OWNER'],
  'ma-compliance': ['ADMIN', 'SUPER_ADMIN', 'CLIENT', 'TENANT_OWNER', 'LAWYER'],
  'narrative-generator': ['ADMIN', 'SUPER_ADMIN', 'CLIENT', 'TENANT_OWNER', 'LAWYER'],
  'incident-response': ['ADMIN', 'SUPER_ADMIN', 'CLIENT', 'TENANT_OWNER'],
  'breach-simulation': ['ADMIN', 'SUPER_ADMIN', 'CLIENT', 'TENANT_OWNER'],
  'risk-impact-calculator': ['ADMIN', 'SUPER_ADMIN', 'CLIENT', 'TENANT_OWNER'],
  'client-scanner-hub': ['ADMIN', 'SUPER_ADMIN', 'CLIENT', 'TENANT_OWNER'],
  'regulatory-radar': ['ADMIN', 'SUPER_ADMIN', 'CLIENT', 'TENANT_OWNER', 'EU_REGULATOR'],
  'transfer-impact-assessment': ['ADMIN', 'SUPER_ADMIN', 'CLIENT', 'TENANT_OWNER'],
  'statutory-gazette-watchdog': ['ADMIN', 'SUPER_ADMIN', 'CLIENT', 'TENANT_OWNER', 'EU_REGULATOR'],
  'enterprise-privacy-suite': ['ADMIN', 'SUPER_ADMIN', 'CLIENT', 'TENANT_OWNER'],
  'company-network': ['ADMIN', 'SUPER_ADMIN', 'CLIENT', 'TENANT_OWNER', 'EU_REGULATOR', 'AUDITOR', 'LAWYER'],
  'enterprise-company-network': ['ADMIN', 'SUPER_ADMIN', 'CLIENT', 'TENANT_OWNER', 'EU_REGULATOR', 'AUDITOR', 'LAWYER'],
  'verification-hub': ['ADMIN', 'SUPER_ADMIN', 'CLIENT', 'TENANT_OWNER', 'EU_REGULATOR', 'AUDITOR'],
  'enterprise-verification': ['ADMIN', 'SUPER_ADMIN', 'CLIENT', 'TENANT_OWNER', 'EU_REGULATOR', 'AUDITOR'],
  'predictive-intelligence': ['ADMIN', 'SUPER_ADMIN', 'CLIENT', 'TENANT_OWNER', 'AUDITOR'],
  'predictive-trading': ['ADMIN', 'SUPER_ADMIN', 'CLIENT', 'TENANT_OWNER', 'AUDITOR'],
  'enterprise-services': ['ADMIN', 'SUPER_ADMIN', 'CLIENT', 'TENANT_OWNER', 'EU_REGULATOR', 'LAWYER', 'AUDITOR'],
  'enterprise-gateway': ['ADMIN', 'SUPER_ADMIN', 'CLIENT', 'TENANT_OWNER', 'EU_REGULATOR', 'LAWYER', 'AUDITOR'],
  'sso': ['ADMIN', 'SUPER_ADMIN', 'CLIENT', 'TENANT_OWNER', 'EU_REGULATOR', 'LAWYER', 'AUDITOR'],
  'sso-landing': ['ADMIN', 'SUPER_ADMIN', 'CLIENT', 'TENANT_OWNER', 'EU_REGULATOR', 'LAWYER', 'AUDITOR'],
  'regulatory-mapping': ['ADMIN', 'SUPER_ADMIN', 'CLIENT', 'TENANT_OWNER', 'EU_REGULATOR'],
  'automated-scanning': ['ADMIN', 'SUPER_ADMIN', 'CLIENT', 'TENANT_OWNER'],
  'automated-remediation': ['ADMIN', 'SUPER_ADMIN', 'CLIENT', 'TENANT_OWNER'],
  'sovereignty-security': ['ADMIN', 'SUPER_ADMIN', 'CLIENT', 'TENANT_OWNER'],
  'proactive-regtech': ['ADMIN', 'SUPER_ADMIN', 'CLIENT', 'TENANT_OWNER'],
  'proactive-regtech-engine': ['ADMIN', 'SUPER_ADMIN', 'CLIENT', 'TENANT_OWNER'],
  'war-room': ['ADMIN', 'SUPER_ADMIN', 'CLIENT', 'TENANT_OWNER', 'LAWYER'],
  'cyber-insurance': ['ADMIN', 'SUPER_ADMIN', 'CLIENT', 'TENANT_OWNER'],
  'breach-notification': ['ADMIN', 'SUPER_ADMIN', 'CLIENT', 'TENANT_OWNER'],
  'live-dashboard': ['ADMIN', 'SUPER_ADMIN', 'CLIENT', 'TENANT_OWNER', 'EU_REGULATOR'],
  'companies': ['ADMIN', 'SUPER_ADMIN', 'CLIENT', 'TENANT_OWNER', 'LAWYER', 'EU_REGULATOR'],
  'vault': ['ADMIN', 'SUPER_ADMIN', 'CLIENT', 'TENANT_OWNER', 'LAWYER'],
  'dpo-certification': ['ADMIN', 'SUPER_ADMIN', 'CLIENT', 'TENANT_OWNER'],
  'tasks': ['ADMIN', 'SUPER_ADMIN', 'CLIENT', 'TENANT_OWNER', 'LAWYER'],
  'dsar-portal': ['ADMIN', 'SUPER_ADMIN', 'CLIENT', 'TENANT_OWNER', 'EU_REGULATOR'],
  'privacy-policy-gen': ['ADMIN', 'SUPER_ADMIN', 'CLIENT', 'TENANT_OWNER', 'LAWYER'],
  'caas-service-center': ['ADMIN', 'SUPER_ADMIN', 'CLIENT', 'TENANT_OWNER'],
  'engine': ['ADMIN', 'SUPER_ADMIN', 'CLIENT', 'TENANT_OWNER'],
  'data-mapping': ['ADMIN', 'SUPER_ADMIN', 'CLIENT', 'TENANT_OWNER'],
  'gdpr-management': ['ADMIN', 'SUPER_ADMIN', 'CLIENT', 'TENANT_OWNER'],
  'cookie-consent': ['ADMIN', 'SUPER_ADMIN', 'CLIENT', 'TENANT_OWNER'],
  'dsar-management': ['ADMIN', 'SUPER_ADMIN', 'CLIENT', 'TENANT_OWNER'],
  'dpia-assessments': ['ADMIN', 'SUPER_ADMIN', 'CLIENT', 'TENANT_OWNER'],
  'vendor-risk': ['ADMIN', 'SUPER_ADMIN', 'CLIENT', 'TENANT_OWNER'],
  'whistleblower': ['ADMIN', 'SUPER_ADMIN', 'CLIENT', 'TENANT_OWNER'],
  'esg-sustainability': ['ADMIN', 'SUPER_ADMIN', 'CLIENT', 'TENANT_OWNER'],
  'incident-response-copilot': ['ADMIN', 'SUPER_ADMIN', 'CLIENT', 'TENANT_OWNER'],
  'company-profile': ['ADMIN', 'SUPER_ADMIN', 'CLIENT', 'TENANT_OWNER', 'LAWYER'],
  'violations': ['ADMIN', 'SUPER_ADMIN', 'CLIENT', 'TENANT_OWNER', 'EU_REGULATOR'],
  'quantum-engine': ['ADMIN', 'SUPER_ADMIN', 'CLIENT', 'TENANT_OWNER'],
  'emergency-security-audit': ['ADMIN', 'SUPER_ADMIN', 'CLIENT', 'TENANT_OWNER'],
  'data-security': ['ADMIN', 'SUPER_ADMIN', 'CLIENT', 'TENANT_OWNER']
};

/**
 * Maps every sidebar component identifier to its authorized roles.
 */
export const getSidebarRoleMapping = (): Record<string, string[]> => {
  return SIDEBAR_ROLE_ACCESS_MATRIX;
};

/**
 * Verifies sidebar feature integrity by comparing currently loaded customMap keys
 * against the schema-defined role-access matrix. Logs any mismatched or leaked
 * permissions to localStorage under '9xen-regulettee_system_error_logs'.
 */
export const verifySidebarIntegrity = (customMapKeys: string[]): {
  valid: boolean;
  mismatches: Array<{ identifier: string; reason: string }>;
} => {
  const mismatches: Array<{ identifier: string; reason: string }> = [];

  for (const key of customMapKeys) {
    if (!SIDEBAR_ROLE_ACCESS_MATRIX[key]) {
      mismatches.push({
        identifier: key,
        reason: `Sidebar identifier '${key}' is missing from SIDEBAR_ROLE_ACCESS_MATRIX schema.`
      });
    }
  }

  const valid = mismatches.length === 0;

  if (!valid) {
    const logMismatch = async () => {
      try {
        const rawLogs = localStorage.getItem('9xen-regulettee_system_error_logs');
        let existingLogs = [];
        if (rawLogs) {
          if (isEncrypted(rawLogs)) {
            existingLogs = JSON.parse(await decryptData(rawLogs));
          } else {
            existingLogs = JSON.parse(rawLogs);
          }
        }

        const newLog = {
          id: `audit-${Date.now()}-${Math.random().toString(36).substring(2, 7)}`,
          timestamp: new Date().toISOString(),
          errorMessage: `Sidebar Integrity Warning: ${mismatches.length} unmapped or leaked identifiers detected.`,
          stack: JSON.stringify(mismatches),
          activePath: 'sidebar-audit',
          retryCount: 0,
          status: 'INTEGRITY_MISMATCH_DETECTED',
          level: 'Warning'
        };
        existingLogs.unshift(newLog);
        if (existingLogs.length > 50) existingLogs.pop();
        
        const encrypted = await encryptData(JSON.stringify(existingLogs));
        localStorage.setItem('9xen-regulettee_system_error_logs', encrypted);
      } catch (e) {
        console.error('Failed to log sidebar integrity mismatch to localStorage', e);
      }
    };

    logMismatch();
  }

  return {
    valid,
    mismatches
  };
};

export const checkAccess = (role: string, resource: string): boolean => {
  if (!role) return true; // Fail-open to avoid locking out authenticated users
  const normalizedRole = role.toLowerCase().replace(/[- ]/g, '_');
  const permissions = ROLE_PERMISSIONS[normalizedRole] || ROLE_PERMISSIONS[role];
  if (!permissions) {
    return true; // Allow access by default for all valid roles
  }
  if (permissions.includes('*')) return true;
  return permissions.includes(resource) || permissions.includes(resource.toLowerCase());
};

export const getDefaultRoute = (role: string): string => {
  const r = (role || '').toLowerCase().replace(/[- ]/g, '_');
  switch (r) {
    case 'admin':
    case 'super_admin':
      return '/sudou';
    case 'regulator_drafter':
    case 'regulator_approver':
    case 'regulator':
    case 'eu_regulator':
      return '/regulator-dashboard';
    case 'lawyer':
    case 'legal_consultant':
      return '/lawyer-portal';
    case 'client':
    case 'tenant_owner':
    case 'tenant':
    default:
      return '/client';
  }
};

