import React, { createContext, useContext, useState } from 'react';

export type CountryCode = 'EU' | 'US-CA' | 'US-HIPAA' | 'CA' | 'ZA' | 'NG' | 'AE' | 'SA';

export type JurisdictionCode = 'GDPR' | 'CCPA' | 'HIPAA' | 'PIPEDA' | 'POPIA' | 'NDPR' | 'UAE_DL' | 'PDPL';

export interface CountryInfo {
  code: CountryCode;
  name: string;
  flag: string;
  jurisdiction: JurisdictionCode;
  frameworkName: string;
}

export const COUNTRIES: Record<CountryCode, CountryInfo> = {
  'EU': {
    code: 'EU',
    name: 'European Union',
    flag: '🇪🇺',
    jurisdiction: 'GDPR',
    frameworkName: 'GDPR & EU AI Act'
  },
  'US-CA': {
    code: 'US-CA',
    name: 'United States (California)',
    flag: '🇺🇸',
    jurisdiction: 'CCPA',
    frameworkName: 'CCPA & AB 2930'
  },
  'US-HIPAA': {
    code: 'US-HIPAA',
    name: 'United States (Healthcare)',
    flag: '🏥',
    jurisdiction: 'HIPAA',
    frameworkName: 'HIPAA & HHS AI Rules'
  },
  'CA': {
    code: 'CA',
    name: 'Canada',
    flag: '🇨🇦',
    jurisdiction: 'PIPEDA',
    frameworkName: 'PIPEDA & Canada AIDA'
  },
  'ZA': {
    code: 'ZA',
    name: 'South Africa',
    flag: '🇿🇦',
    jurisdiction: 'POPIA',
    frameworkName: 'POPIA & AI Guidelines'
  },
  'NG': {
    code: 'NG',
    name: 'Nigeria',
    flag: '🇳🇬',
    jurisdiction: 'NDPR',
    frameworkName: 'NDPR & NITDA AI'
  },
  'AE': {
    code: 'AE',
    name: 'UAE',
    flag: '🇦🇪',
    jurisdiction: 'UAE_DL',
    frameworkName: 'UAE Data Law & AI Ethics'
  },
  'SA': {
    code: 'SA',
    name: 'Saudi Arabia',
    flag: '🇸🇦',
    jurisdiction: 'PDPL',
    frameworkName: 'PDPL & SDAIA Framework'
  }
};

interface JurisdictionContextProps {
  country: CountryCode;
  setCountry: (country: CountryCode) => void;
  jurisdiction: JurisdictionCode;
  frameworkName: string;
  countries: CountryInfo[];
}

const JurisdictionContext = createContext<JurisdictionContextProps | undefined>(undefined);

export const JurisdictionProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [country, setCountryState] = useState<CountryCode>(() => {
    const saved = localStorage.getItem('app_global_country');
    return (saved as CountryCode) || 'EU';
  });

  const setCountry = (c: CountryCode) => {
    setCountryState(c);
    localStorage.setItem('app_global_country', c);
    window.dispatchEvent(new CustomEvent('jurisdictionchange', { detail: c }));
  };

  const selectedCountryInfo = COUNTRIES[country] || COUNTRIES.EU;

  return (
    <JurisdictionContext.Provider value={{
      country,
      setCountry,
      jurisdiction: selectedCountryInfo.jurisdiction,
      frameworkName: selectedCountryInfo.frameworkName,
      countries: Object.values(COUNTRIES)
    }}>
      {children}
    </JurisdictionContext.Provider>
  );
};

export const useJurisdiction = () => {
  const context = useContext(JurisdictionContext);
  if (!context) {
    throw new Error('useJurisdiction must be used within a JurisdictionProvider');
  }
  return context;
};
