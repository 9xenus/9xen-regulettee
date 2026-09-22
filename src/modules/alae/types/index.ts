import { Regulation, Country, PenaltyRule } from '../domain/schema';

export interface ArbitrationRequest {
  countryCode: string;
  useCaseId: string;
}

export interface ConflictResolution {
  issue: string;
  euLaw: string;
  nationalLaw: string;
  decision: string;
  riskLevel: 'Low' | 'Medium' | 'High' | 'Critical';
}

export interface ArbitrationResult {
  conflicts: ConflictResolution[];
  penalties: PenaltyRule[];
  suggestedPolicies: string[];
}
