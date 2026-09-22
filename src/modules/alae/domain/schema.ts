/**
 * Domain models for the ALAE module, representing the graph structure in KuzuDB.
 */

export interface Regulation {
  id: string;
  name: string;
  level: 'EU' | 'National';
  jurisdiction: string;
  effectiveDate: Date;
}

export interface Country {
  isoCode: string;
  name: string;
  region: string;
}

export interface PenaltyRule {
  id: string;
  maxPenalty: string;
  strictness: 'Low' | 'Medium' | 'High' | 'Critical';
  type: string;
}

export interface Obligation {
  id: string;
  description: string;
  category: string;
}

export interface UseCase {
  id: string;
  name: string;
  domain: string;
}

/**
 * KuzuDB Cypher Schema Definition for ALAE
 */
export const ALAE_SCHEMA_DDL = `
  // Node Tables
  CREATE NODE TABLE Regulation (id STRING, name STRING, level STRING, jurisdiction STRING, effectiveDate DATE, PRIMARY KEY (id));
  CREATE NODE TABLE Country (isoCode STRING, name STRING, region STRING, PRIMARY KEY (isoCode));
  CREATE NODE TABLE PenaltyRule (id STRING, maxPenalty STRING, strictness STRING, type STRING, PRIMARY KEY (id));
  CREATE NODE TABLE Obligation (id STRING, description STRING, category STRING, PRIMARY KEY (id));
  CREATE NODE TABLE UseCase (id STRING, name STRING, domain STRING, PRIMARY KEY (id));

  // Rel Tables
  CREATE REL TABLE AppliesTo (FROM Regulation TO Country);
  CREATE REL TABLE ContainsObligation (FROM Regulation TO Obligation);
  CREATE REL TABLE HasPenalty (FROM Obligation TO PenaltyRule);
  CREATE REL TABLE SubjectTo (FROM UseCase TO Obligation);
  CREATE REL TABLE Overrides (FROM Obligation TO Obligation, reason STRING);
`;
