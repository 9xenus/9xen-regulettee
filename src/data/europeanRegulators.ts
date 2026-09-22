export interface RegulatoryAgency {
  countryCode: string;
  countryName: string;
  agencyName: string;
  agencyAcronym: string;
  website: string;
}

export const EUROPEAN_REGULATORS: RegulatoryAgency[] = [
  { countryCode: 'FR', countryName: 'France', agencyName: 'Commission Nationale de l\'Informatique et des Libertés', agencyAcronym: 'CNIL', website: 'https://www.cnil.fr' },
  { countryCode: 'DE', countryName: 'Germany', agencyName: 'Der Bundesbeauftragte für den Datenschutz und die Informationsfreiheit', agencyAcronym: 'BfDI', website: 'https://www.bfdi.bund.de' },
  { countryCode: 'IE', countryName: 'Ireland', agencyName: 'Data Protection Commission', agencyAcronym: 'DPC', website: 'https://www.dataprotection.ie' },
  { countryCode: 'ES', countryName: 'Spain', agencyName: 'Agencia Española de Protección de Datos', agencyAcronym: 'AEPD', website: 'https://www.aepd.es' },
  { countryCode: 'IT', countryName: 'Italy', agencyName: 'Garante per la protezione dei dati personali', agencyAcronym: 'GPDP', website: 'https://www.garanteprivacy.it' },
  // ... scalable to more ...
];
