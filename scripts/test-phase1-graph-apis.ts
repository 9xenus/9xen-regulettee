import express from 'express';
import http from 'http';
import { graphIntelRouter } from '../src/server/graphIntelRoutes';
import { initDb } from '../src/db/sqlite';

async function fetchJson(url: string, options: any = {}) {
  const res = await fetch(url, {
    ...options,
    headers: {
      'Content-Type': 'application/json',
      ...(options.headers || {})
    }
  });
  const data = await res.json();
  return { status: res.status, body: data };
}

export async function runPhase1GraphApiTests() {
  console.log('=== Running Phase 1 (Deliverable 5/38) Graph Curated APIs Test Suite ===');
  let failures = 0;

  let server: http.Server | null = null;
  try {
    initDb();
    const app = express();
    app.use(express.json());
    app.use('/api/v1/intel/graph', graphIntelRouter);

    // Start ephemeral server on random port
    await new Promise<void>((resolve) => {
      server = app.listen(0, '127.0.0.1', () => {
        resolve();
      });
    });

    const addr = server?.address() as any;
    const baseUrl = `http://127.0.0.1:${addr.port}/api/v1/intel/graph`;

    // 1. Seed demo graph network
    const seedRes = await fetchJson(`${baseUrl}/seed-demo`, { method: 'POST' });
    if (seedRes.status !== 200 || !seedRes.body.success || !seedRes.body.analyticsResults) {
      console.error('❌ FAIL: Seed demo endpoint returned invalid response', seedRes);
      failures++;
    } else {
      console.log('✅ Seed demo graph endpoint succeeded and computed analytics.');
    }

    // 2. Query Overview
    const overviewRes = await fetchJson(`${baseUrl}/overview`);
    if (overviewRes.status !== 200 || !overviewRes.body.success || overviewRes.body.stats.totalNodes <= 0) {
      console.error('❌ FAIL: Overview returned zero nodes', overviewRes);
      failures++;
    } else {
      console.log(`✅ Overview API succeeded: ${overviewRes.body.stats.totalNodes} nodes, ${overviewRes.body.stats.totalEdges} relationships, ${overviewRes.body.stats.totalFindings} findings.`);
    }

    // 3. Query Entity Network (2 Hops)
    const netRes = await fetchJson(`${baseUrl}/query`, {
      method: 'POST',
      body: JSON.stringify({
        action: 'entity-network',
        entityId: 'ent_bkash_agent_01',
        depth: 2
      })
    });

    if (netRes.status !== 200 || !netRes.body.success || netRes.body.nodes.length === 0) {
      console.error('❌ FAIL: Entity network query returned no nodes', netRes);
      failures++;
    } else {
      console.log(`✅ Entity network query succeeded: ${netRes.body.nodes.length} nodes and ${netRes.body.edges.length} edges found at depth 2.`);
    }

    // 4. Query Shortest Path
    const pathRes = await fetchJson(`${baseUrl}/query`, {
      method: 'POST',
      body: JSON.stringify({
        action: 'shortest-path',
        e1: 'ent_bkash_agent_01',
        e2: 'ent_bkash_agent_02'
      })
    });

    if (pathRes.status !== 200 || !pathRes.body.success || pathRes.body.pathLength < 0) {
      console.error('❌ FAIL: Shortest path query returned no path', pathRes);
      failures++;
    } else {
      console.log(`✅ Shortest path query succeeded: Distance ${pathRes.body.pathLength} hops between agent 01 and agent 02.`);
    }

    // 5. Query Serial Operators
    const serialRes = await fetchJson(`${baseUrl}/query`, {
      method: 'POST',
      body: JSON.stringify({ action: 'serial-operators' })
    });

    if (serialRes.status !== 200 || !serialRes.body.success || serialRes.body.count === 0) {
      console.error('❌ FAIL: Serial operators query returned 0 count', serialRes);
      failures++;
    } else {
      console.log(`✅ Serial operators query returned ${serialRes.body.count} flagged networks.`);
    }

    // 6. Query Findings & Review
    const findingsRes = await fetchJson(`${baseUrl}/query`, {
      method: 'POST',
      body: JSON.stringify({ action: 'findings' })
    });

    if (findingsRes.status !== 200 || !findingsRes.body.success || findingsRes.body.findings.length === 0) {
      console.error('❌ FAIL: Findings query returned 0 findings', findingsRes);
      failures++;
    } else {
      const firstFinding = findingsRes.body.findings[0];
      console.log(`✅ Findings query returned ${findingsRes.body.findings.length} findings.`);

      // Review first finding
      const reviewRes = await fetchJson(`${baseUrl}/query`, {
        method: 'POST',
        body: JSON.stringify({
          action: 'review-finding',
          findingId: firstFinding.id,
          status: 'confirmed',
          reviewer: 'inspector_mustafa',
          reviewNotes: 'Confirmed serial phone link for court submission'
        })
      });

      if (reviewRes.status !== 200 || !reviewRes.body.success || reviewRes.body.status !== 'confirmed') {
        console.error('❌ FAIL: Review finding mutation failed', reviewRes);
        failures++;
      } else {
        console.log(`✅ Finding review mutation succeeded: ${firstFinding.id} marked as confirmed.`);
      }
    }

  } catch (err: any) {
    console.error(`❌ FAIL: Exception during Graph API test: ${err.message}`);
    failures++;
  } finally {
    if (server) {
      (server as http.Server).close();
    }
  }

  if (failures === 0) {
    console.log('\n🎉 ALL PHASE 1 (DELIVERABLE 5/38) GRAPH CURATED API TESTS PASSED (0 failures).\n');
  } else {
    console.error(`\n❌ PHASE 1 GRAPH CURATED API TESTS FAILED with ${failures} error(s).\n`);
    process.exit(1);
  }
}

if (process.argv[1]?.endsWith('test-phase1-graph-apis.ts')) {
  runPhase1GraphApiTests();
}
