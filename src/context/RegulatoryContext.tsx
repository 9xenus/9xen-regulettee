import { createContext, useContext, useState } from 'react';

export type RiskAppetite = 'Aversive' | 'Balanced' | 'Aggressive';
export type RegulatoryLens = 'Standard' | 'Strict' | 'Innovation';

interface RegulatoryContextType {
  selectedCountryCode: string | null;
  setSelectedCountryCode: (code: string | null) => void;
  riskAppetite: RiskAppetite;
  setRiskAppetite: (appetite: RiskAppetite) => void;
  lens: RegulatoryLens;
  setLens: (lens: RegulatoryLens) => void;
  aiAutonomyThreshold: number;
  setAiAutonomyThreshold: (val: number) => void;
}

const RegulatoryContext = createContext<RegulatoryContextType | undefined>(undefined);

export const RegulatoryProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [selectedCountryCode, setSelectedCountryCode] = useState<string | null>(null);
  const [riskAppetite, setRiskAppetite] = useState<RiskAppetite>('Balanced');
  const [lens, setLens] = useState<RegulatoryLens>('Standard');
  const [aiAutonomyThreshold, setAiAutonomyThreshold] = useState<number>(85);

  return (
    <RegulatoryContext.Provider value={{ 
      selectedCountryCode, 
      setSelectedCountryCode,
      riskAppetite,
      setRiskAppetite,
      lens,
      setLens,
      aiAutonomyThreshold,
      setAiAutonomyThreshold
    }}>
      {children}
    </RegulatoryContext.Provider>
  );
};

export const useRegulatory = () => {
  const context = useContext(RegulatoryContext);
  if (!context) {
    throw new Error('useRegulatory must be used within a RegulatoryProvider');
  }
  return context;
};
