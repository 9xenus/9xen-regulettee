/**
 * ALAE KuzuDB Schema Definition
 * Defines the graph schema for the Autonomous Legislative Arbitration Engine.
 */

export const ALAE_KUZU_SCHEMA = `
  // Nodes
  CREATE NODE TABLE Regulation (id STRING, name STRING, level STRING, jurisdiction STRING, effectiveDate DATE, PRIMARY KEY (id));
  CREATE NODE TABLE Country (isoCode STRING, name STRING, region STRING, PRIMARY KEY (isoCode));
  CREATE NODE TABLE Obligation (id STRING, description STRING, category STRING, PRIMARY KEY (id));
  CREATE NODE TABLE PenaltyRule (id STRING, maxPenalty STRING, strictness STRING, type STRING, PRIMARY KEY (id));
  CREATE NODE TABLE UseCase (id STRING, name STRING, domain STRING, PRIMARY KEY (id));

  // Edges
  CREATE REL TABLE AppliesTo (FROM Regulation TO Country);
  CREATE REL TABLE ContainsObligation (FROM Regulation TO Obligation);
  CREATE REL TABLE HasPenalty (FROM Obligation TO PenaltyRule);
  CREATE REL TABLE SubjectTo (FROM UseCase TO Obligation);
  CREATE REL TABLE Overrides (FROM Obligation TO Obligation, reason STRING);
`;

export interface RegulationNode {
  id: string;
  name: string;
  level: 'EU' | 'National';
  jurisdiction: string;
}

export interface PenaltyRuleNode {
  id: string;
  maxPenalty: string;
  strictness: 'Low' | 'Medium' | 'High' | 'Critical';
  type: string;
}
