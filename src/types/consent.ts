export type ConsentCategory = 'strictly_necessary' | 'analytics' | 'marketing' | 'preferences';

export interface ConsentPreferences {
  strictly_necessary: boolean;
  analytics: boolean;
  marketing: boolean;
  preferences: boolean;
}

export const DEFAULT_CONSENT: ConsentPreferences = {
  strictly_necessary: true,
  analytics: false,
  marketing: false,
  preferences: false,
};
