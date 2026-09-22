import { getDb } from '../src/db/sqlite.js';
import { queryDb, queryOne, getActiveDbConfig } from '../src/db/db-adapter.js';
import { dbReconnectionManager } from '../src/db/databaseReconnectionManager.js';
import { getDuckDb, queryAnalytics, initDuckDb } from '../src/db/duckdb.js';
import { getKuzuDb, kuzuQuery } from '../src/db/kuzu.js';
import { getLanceDb } from '../src/db/lancedb.js';
import { ChromaVectorStore } from '../src/db/chroma.js';
import { queryPg, getPgPool } from '../src/db/postgres.js';

async function verifyHybridDatabases() {
  console.log('\n=== [9XEN REGULETTEE HYBRID DATABASE INTEGRATION AUDIT] ===\n');
  let passed = 0;
  let failed = 0;

  function assert(name: string, condition: boolean, details?: string) {
    if (condition) {
      console.log(`  ✅ PASS: ${name}`);
      passed++;
    } else {
      console.error(`  ❌ FAIL: ${name} ${details ? `(${details})` : ''}`);
      failed++;
    }
  }

  try {
    // 1. Primary Relational SQLite & DbAdapter Integration
    console.log('[1/7] Verifying Primary Relational Database (SQLite & Adapter)...');
    const sqliteDb = getDb();
    assert('SQLite active & initialized', Boolean(sqliteDb));
    
    const dbConfig = getActiveDbConfig();
    assert('DbAdapter config returned valid provider', Boolean(dbConfig.provider));

    const testQueryResult = queryDb('SELECT 1 as val');
    assert('DbAdapter queryDb executes successfully', Array.isArray(testQueryResult) && testQueryResult.length > 0);

    const testOneResult = queryOne<{ val: number }>('SELECT 1 as val');
    assert('DbAdapter queryOne executes successfully', testOneResult?.val === 1);

    // 2. Database Reconnection Manager Integration
    console.log('\n[2/7] Verifying Database Reconnection Manager...');
    const healthStatus = dbReconnectionManager.getDatabaseStatuses();
    assert('Reconnection Manager tracks database drivers', Boolean(healthStatus.sqlite_relational));
    
    const retryTestRes = dbReconnectionManager.executeWithRetrySync('sqlite_relational', () => {
      return getDb().prepare('SELECT count(*) as cnt FROM sqlite_master').get() as { cnt: number };
    });
    assert('Reconnection Manager executes with retry wrapper', typeof retryTestRes?.cnt === 'number');

    // 3. DuckDB OLAP & Analytical Store
    console.log('\n[3/7] Verifying DuckDB Analytical / OLAP Engine...');
    await initDuckDb();
    const duckDbInstance = getDuckDb();
    assert('DuckDB instance acquired (native or in-memory fallback)', Boolean(duckDbInstance));

    const analyticsResult = await queryAnalytics('SELECT 1 as num');
    assert('DuckDB queryAnalytics executes cleanly', Array.isArray(analyticsResult));

    // 4. Kuzu Graph Database Engine
    console.log('\n[4/7] Verifying Kuzu Graph Database Engine...');
    const kuzuConn = await getKuzuDb();
    assert('Kuzu DB connection acquired (native or mock fallback)', Boolean(kuzuConn));

    const kuzuQueryResult = await kuzuQuery('MATCH (n) RETURN count(n);');
    assert('Kuzu kuzuQuery executes without throwing', Array.isArray(kuzuQueryResult) || kuzuQueryResult !== null);

    // 5. LanceDB Vector / Embedded Analytics Store
    console.log('\n[5/7] Verifying LanceDB Vector Engine...');
    const lancedb = await getLanceDb();
    assert('LanceDB instance acquired (native or mock fallback)', Boolean(lancedb));
    const tableNames = await lancedb.tableNames();
    assert('LanceDB tableNames query returns array', Array.isArray(tableNames));

    // 6. Chroma Vector Store
    console.log('\n[6/7] Verifying Chroma Vector Store Engine...');
    await ChromaVectorStore.addDocuments('test_audit_domain', [
      { id: 'doc_101', text: 'EU GDPR Article 32 requires technical and organizational security controls', metadata: { framework: 'GDPR' } }
    ]);
    const chromaSearchResults = await ChromaVectorStore.query('test_audit_domain', 'GDPR security controls', 2);
    assert('ChromaVectorStore indexing and search executed successfully', Boolean(chromaSearchResults && chromaSearchResults.documents));

    // 7. PostgreSQL Cloud SQL Pool / Fallback
    console.log('\n[7/7] Verifying PostgreSQL Pool Engine...');
    const pgPool = getPgPool();
    if (!process.env.DATABASE_URL) {
      assert('PostgreSQL skipped gracefully when DATABASE_URL is unconfigured', pgPool === null);
    } else {
      const pgRes = await queryPg('SELECT 1 as val');
      assert('PostgreSQL query executed successfully', Array.isArray(pgRes));
    }

    console.log(`\n======================================================`);
    console.log(`HYBRID DATABASE AUDIT COMPLETE: ${passed} passed, ${failed} failed.`);
    console.log(`======================================================\n`);

    if (failed > 0) process.exit(1);
    process.exit(0);
  } catch (err) {
    console.error('Hybrid database audit failed with error:', err);
    process.exit(1);
  }
}

verifyHybridDatabases();
