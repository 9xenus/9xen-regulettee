import { 
  EnforcementTriggerConfig, 
  ApprovalPolicyConfig, 
  LegalBasisConfig 
} from '../types';

export const validateTriggerConfig = (config: EnforcementTriggerConfig): string[] => {
  const errors: string[] = [];
  if (config.riskThreshold < 0 || config.riskThreshold > 100) {
    errors.push('Risk threshold must be between 0 and 100.');
  }
  if (!config.violationTypes || config.violationTypes.length === 0) {
    errors.push('At least one violation type must be selected.');
  }
  return errors;
};

export const validateApprovalPolicy = (config: ApprovalPolicyConfig): string[] => {
  const errors: string[] = [];
  if (config.requiredApprovers < 1) {
    errors.push('At least one approver is required.');
  }
  if (!config.approverRoles || config.approverRoles.length === 0) {
    errors.push('At least one approver role must be defined.');
  }
  if (config.slaHours < 1) {
    errors.push('SLA must be at least 1 hour.');
  }
  return errors;
};

export const validateLegalBasis = (config: LegalBasisConfig): string[] => {
  const errors: string[] = [];
  if (!config.regulation) errors.push('Regulation name is required.');
  if (!config.article) errors.push('Article reference is required.');
  if (!config.jurisdictionRef) errors.push('Jurisdiction reference is required.');
  return errors;
};

export const validateEnforcementLevel = (setting: {
  enabled: boolean;
  legalBasis: LegalBasisConfig;
  triggerConditions: EnforcementTriggerConfig;
  approvalPolicy: ApprovalPolicyConfig;
}): string[] => {
  if (!setting.enabled) return [];
  
  return [
    ...validateLegalBasis(setting.legalBasis),
    ...validateTriggerConfig(setting.triggerConditions),
    ...validateApprovalPolicy(setting.approvalPolicy),
  ];
};
