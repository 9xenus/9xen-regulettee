/**
 * 9XEN_REGULETTEE SOVEREIGN COMPLIANCE ENGINE
 * Core Domain Types & FSM Definitions
 */

// --- ENFORCEMENT FSM ---

export enum EnforcementStep {
  SCANNED = 'SCANNED',
  VIOLATION_DETECTED = 'VIOLATION_DETECTED',
  NOTICE_ISSUED = 'NOTICE_ISSUED',
  UNDER_APPEAL = 'UNDER_APPEAL',
  PENALTY_DEMANDED = 'PENALTY_DEMANDED',
  SOFT_ENFORCEMENT = 'SOFT_ENFORCEMENT',
  HARD_ENFORCEMENT = 'HARD_ENFORCEMENT',
  RESOLVED = 'RESOLVED'
}

export interface EnforcementCase {
  id: string;
  entity_id: string;
  regulator_id: number;
  status: EnforcementStep;
  dossier_hash?: string;
  created_at: string;
  updated_at: string;
}

export interface ViolationDossier {
  case_id: string;
  violations: Array<{
    article: string;
    description: string;
    evidence_url?: string;
    severity: 'LOW' | 'MEDIUM' | 'HIGH' | 'CRITICAL';
  }>;
  calculated_fine_cents: number;
  legal_justification: string;
  ai_confidence: number;
}

// --- ENTITLEMENTS & MONETIZATION ---

export enum TenantTier {
  BASIC = 'BASIC',
  PRO = 'PRO',
  ENTERPRISE = 'ENTERPRISE'
}

export interface TenantEntitlement {
  tenant_id: string;
  module_key: string;
  status: 'ACTIVE' | 'EXPIRED' | 'LOCKED';
  valid_until?: string;
  custom_limits?: Record<string, any>;
}

export interface RegulatorBillingConfig {
  regulator_id: number;
  base_monthly_fee_cents: number;
  commission_rate_percentage: number;
  billing_cycle: 'MONTHLY' | 'YEARLY';
  updated_at: string;
}

// --- AUDIT & IMMUTABILITY ---

export interface AuditProof {
  id: string;
  case_id: string;
  step: EnforcementStep;
  payload_hash: string;
  immudb_tx_id?: string;
  created_at: string;
}
