import React from 'react';

// Simplified flag implementation using country emoji or CSS colors if requested.
// Using Emoji for portability and simplicity as requested for a universal flag viewer.
export const CountryFlag: React.FC<{ countryCode: string; className?: string }> = ({ countryCode, className = 'w-5 h-5' }) => {
  // Mapping country code to emoji flag
  const flagMap: Record<string, string> = {
    FR: '🇫🇷',
    DE: '🇩🇪',
    IE: '🇮🇪',
    ES: '🇪🇸',
    IT: '🇮🇹',
    // ...
  };

  return (
    <span className={`text-base ${className}`} role="img" aria-label={`Flag of ${countryCode}`}>
      {flagMap[countryCode] || '🏳️'}
    </span>
  );
};
