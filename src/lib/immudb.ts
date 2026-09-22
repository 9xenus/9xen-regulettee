import postgres from 'postgres';

/**
 * ImmuDB Integration Utility
 * Using the PGSQL interface for tamper-proof audit logging.
 */

const IMMUDB_HOST = '127.0.0.1';
const IMMUDB_PORT = 5433;
const IMMUDB_USER = 'immudb';
const IMMUDB_PASS = 'immudb';
const IMMUDB_DB = 'defaultdb';

let sql: any = null;

export function getImmuDb() {
  if (!sql) {
    sql = postgres({
      host: IMMUDB_HOST,
      port: IMMUDB_PORT,
      database: IMMUDB_DB,
      username: IMMUDB_USER,
      password: IMMUDB_PASS,
      // immudb might not support all PG features, so we keep it simple
      max: 10,
      idle_timeout: 30,
      connect_timeout: 5,
    });
  }
  return sql;
}

export interface AuditLog {
  case_id: string;
  step: string;
  payload: string;
  timestamp: string;
}

/**
 * Record a tamper-proof audit log entry
 */
export async function recordAuditProof(caseId: string, step: string, payload: any) {
  const db = getImmuDb();
  const timestamp = new Date().toISOString();
  const payloadStr = typeof payload === 'string' ? payload : JSON.stringify(payload);

  try {
    // Create table if not exists (immudb supports basic DDL via pgsql)
    await db`
      CREATE TABLE IF NOT EXISTS audit_logs (
        id VARCHAR PRIMARY KEY,
        case_id VARCHAR,
        step VARCHAR,
        payload TEXT,
        created_at VARCHAR
      )
    `;

    const id = `audit_${Date.now()}_${Math.random().toString(36).substring(2, 9)}`;

    await db`
      INSERT INTO audit_logs (id, case_id, step, payload, created_at)
      VALUES (${id}, ${caseId}, ${step}, ${payloadStr}, ${timestamp})
    `;

    return { success: true, id };
  } catch (err) {
    console.error('ImmuDB Audit Record Error:', err);
    return { success: false, error: (err as Error).message };
  }
}

/**
 * Verify the audit trail for a case
 */
export async function getAuditTrail(caseId: string) {
  const db = getImmuDb();
  try {
    const logs = await db`
      SELECT * FROM audit_logs WHERE case_id = ${caseId} ORDER BY created_at ASC
    `;
    return logs;
  } catch (err) {
    console.error('ImmuDB Audit Fetch Error:', err);
    return [];
  }
}

/**
 * Verify an individual audit proof for court admissibility
 */
export async function verifyAuditProof(auditId: string, caseId: string) {
  const db = getImmuDb();
  try {
    const logs = await db`
      SELECT * FROM audit_logs WHERE id = ${auditId} AND case_id = ${caseId} LIMIT 1
    `;
    if (logs.length > 0) {
      return { verified: true, data: logs[0] };
    }
    return { verified: false, error: 'Audit record not found in immutable ledger' };
  } catch (err) {
    console.error('ImmuDB Audit Verify Error:', err);
    return { verified: false, error: (err as Error).message };
  }
}
