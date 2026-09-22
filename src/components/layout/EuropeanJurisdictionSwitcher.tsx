import React from 'react';
import { useRegulatory } from '../../context/RegulatoryContext';
import { EUROPEAN_REGULATORS } from '../../data/europeanRegulators';
import { CountryFlag } from '../ui/CountryFlag';
import { ChevronDown } from 'lucide-react';

export const EuropeanJurisdictionSwitcher: React.FC = () => {
  const { selectedCountryCode, setSelectedCountryCode } = useRegulatory();
  const [isOpen, setIsOpen] = React.useState(false);

  const selectedAgency = EUROPEAN_REGULATORS.find(r => r.countryCode === selectedCountryCode);

  return (
    <div className="relative">
      <button 
        onClick={() => setIsOpen(!isOpen)}
        className="flex items-center gap-2 px-3 py-1.5 rounded-lg bg-slate-100 dark:bg-slate-800 text-xs font-medium hover:bg-slate-200 dark:hover:bg-slate-700 transition-colors"
      >
        {selectedAgency ? (
          <>
            <CountryFlag countryCode={selectedAgency.countryCode} className="w-4 h-4" />
            <span>{selectedAgency.countryName}</span>
          </>
        ) : (
          <span>Select EU Jurisdiction</span>
        )}
        <ChevronDown className="w-3 h-3" />
      </button>

      {isOpen && (
        <div className="absolute top-full right-0 mt-2 w-56 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-lg shadow-xl z-50">
          {EUROPEAN_REGULATORS.map((reg) => (
            <button
              key={reg.countryCode}
              onClick={() => { setSelectedCountryCode(reg.countryCode); setIsOpen(false); }}
              className="flex items-center gap-3 w-full px-4 py-2 text-xs hover:bg-slate-50 dark:hover:bg-slate-800"
            >
              <CountryFlag countryCode={reg.countryCode} className="w-4 h-4" />
              {reg.countryName} ({reg.agencyAcronym})
            </button>
          ))}
        </div>
      )}
    </div>
  );
};
