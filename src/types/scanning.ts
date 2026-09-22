/**
 * SOVEREIGN SCANNING ENGINE TYPES
 * Standardized formats for cross-tool AI compliance scanning.
 */

export enum ScanSeverity {
  INFO = 'INFO',
  LOW = 'LOW',
  MEDIUM = 'MEDIUM',
  HIGH = 'HIGH',
  CRITICAL = 'CRITICAL'
}

export enum ScannerType {
  PLAYWRIGHT = 'PLAYWRIGHT_WEB_AUDIT',
  TRIVY = 'TRIVY_INFRA_AUDIT',
  NUCLEI = 'NUCLEI_DYNAMIC_AST',
  PRESIDIO = 'PRESIDIO_PII_DETECT',
  GITGUARDIAN = 'GITGUARDIAN_SECRETS',
  CLOUDFLARE_RADAR = 'CLOUDFLARE_NETWORK'
}

/**
 * Standardized Violation Object output by any scanner 
 * and consumed by the Gemini Legal Mapping Engine.
 */
export interface StandardizedViolation {
  scanner_source: ScannerType;
  rule_id: string; // e.g., 'CVE-2021-34527' or 'MISSING_CMP'
  title: string;
  description: string;
  severity: ScanSeverity;
  raw_evidence: any; // Raw JSON from tool or Screenshot buffer
  remediation_hint?: string;
  timestamp: string;
}

export interface ScannerResult {
  scanner_type: ScannerType;
  success: boolean;
  duration_ms: number;
  violations: StandardizedViolation[];
  error?: string;
}

/**
 * The Job payload placed into BullMQ
 */
export interface SovereignScanJob {
  case_id?: string; // If this is an existing case re-scan
  entity_id: number;
  target_url?: string;
  target_repo?: string;
  target_ip?: string;
  requested_scanners: ScannerType[];
  regulator_id: number;
}
