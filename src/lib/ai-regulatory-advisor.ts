import { PolicyAct } from './types';

export const analyzeAct = (act: PolicyAct) => {
  if (act.severity === 'HIGH') {
    return {
      message: `High severity update detected for ${act.name}.`,
      suggestion: 'Initiate immediate compliance review and update security protocols.',
      action: 'Flag for manual review'
    };
  }
  return null;
};
