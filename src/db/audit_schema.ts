/**
 * SOVEREIGN AUDIT LEDGER SCHEMA
 * Links the main SQL database with the ImmuDB immutable store.
 */

export const AUDIT_LEDGER_SCHEMA = `
CREATE TABLE IF NOT EXISTS audit_proofs (
    id TEXT PRIMARY KEY,
    case_id TEXT NOT NULL,
    step TEXT NOT NULL, -- e.g. 'SCANNED', 'VIOLATION_DETECTED'
    payload_hash TEXT NOT NULL, -- SHA-256
    immudb_tx_id TEXT, -- The reference ID from ImmuDB
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (case_id) REFERENCES enforcement_cases(id) ON DELETE CASCADE
);

CREATE TABLE IF NOT EXISTS enforcement_cases (
    id TEXT PRIMARY KEY,
    entity_id INTEGER NOT NULL,
    regulator_id INTEGER NOT NULL,
    status TEXT NOT NULL DEFAULT 'SCANNED',
    dossier_hash TEXT, -- Final Merkle Root or Dossier Hash
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (entity_id) REFERENCES companies(id),
    FOREIGN KEY (regulator_id) REFERENCES governments(id)
);

CREATE INDEX IF NOT EXISTS idx_audit_proofs_case ON audit_proofs(case_id);
CREATE INDEX IF NOT EXISTS idx_enforcement_cases_regulator ON enforcement_cases(regulator_id);
CREATE INDEX IF NOT EXISTS idx_enforcement_cases_status ON enforcement_cases(status);
`;
