import { graphSyncService } from '../src/services/graphSyncService';
import { entityResolutionService } from '../src/services/entityResolutionService';
import { graphStore } from '../src/services/graphStoreAdapter';
import { initDb, getDb } from '../src/db/sqlite';

export async function runPhase1GraphSyncTests() {
  console.log('=== Running Phase 1 (Deliverable 3/38) Graph Sync & Entity Resolution Test Suite ===');
  let failures = 0;

  try {
    initDb();
    const db = getDb();
    await graphStore.clearGraph();

    // 1. Sync primary entity with director, TIN, and violations
    const syncResA = await graphSyncService.syncEntity({
      pg_id: 'ent_corp_101',
      name: 'Apex Digital Gateway Ltd',
      type: 'Fintech / PSP',
      country: 'BD',
      risk_tier: 'HIGH',
      compliance_score: 54,
      blacklisted: false,
      directors: [{ name: 'Rahim Chowdhury', aliases: ['R. Chowdhury'] }],
      identifiers: [
        { type: 'TIN', value: 'TIN-889922001' },
        { type: 'PHONE', value: '+8801711009988' }
      ],
      websites: ['apexpay.bd'],
      violations: [
        { pg_id: 'viol_8819', law_section: 'BTRC Act Sec 57', severity: 'HIGH', detected_at: '2026-08-15' }
      ]
    });

    if (!syncResA.success) {
      console.error('❌ FAIL: Failed to sync entity ent_corp_101 to graph');
      failures++;
    } else {
      console.log('✅ Entity ent_corp_101 synced to graph store.');
    }

    // 2. Sync secondary entity sharing the same TIN
    const syncResB = await graphSyncService.syncEntity({
      pg_id: 'ent_corp_102',
      name: 'Apex Express Commerce Ltd',
      type: 'E-commerce',
      country: 'BD',
      risk_tier: 'MEDIUM',
      compliance_score: 68,
      blacklisted: false,
      identifiers: [
        { type: 'TIN', value: 'TIN-889922001' }
      ]
    });

    if (!syncResB.success) {
      console.error('❌ FAIL: Failed to sync entity ent_corp_102 to graph');
      failures++;
    } else {
      console.log('✅ Entity ent_corp_102 synced to graph store.');
    }

    // 3. Test Graph Neighbors Traversal
    const neighbors = await graphStore.getNeighbors('entity_ent_corp_101', 2);
    if (neighbors.nodes.length < 4 || neighbors.edges.length < 3) {
      console.error(`❌ FAIL: Expected >= 4 nodes & >= 3 edges in 2-hop neighborhood, got ${neighbors.nodes.length} nodes & ${neighbors.edges.length} edges`);
      failures++;
    } else {
      console.log(`✅ 2-Hop Graph Neighborhood traversed: ${neighbors.nodes.length} nodes and ${neighbors.edges.length} edges found.`);
    }

    // 4. Test Entity Resolution with Shared TIN (Deterministic match -> Auto-merged)
    const resA = await entityResolutionService.evaluatePair(
      { entityId: 'ent_corp_101', name: 'Apex Digital Gateway Ltd', tin: 'TIN-889922001' },
      { entityId: 'ent_corp_102', name: 'Apex Express Commerce Ltd', tin: 'TIN-889922001' }
    );

    if (resA.confidence !== 1.0 || resA.decision !== 'auto_merged') {
      console.error(`❌ FAIL: Expected exact TIN match to auto_merge with confidence 1.0, got ${resA.confidence} (${resA.decision})`);
      failures++;
    } else {
      console.log('✅ Entity resolution correctly auto-merged pair with exact TIN match (confidence: 1.0).');
    }

    // 5. Test Entity Resolution with Ambiguous match -> Pending review
    const resB = await entityResolutionService.evaluatePair(
      { entityId: 'ent_corp_101', name: 'Apex Digital Gateway Ltd', phone: '+8801711009988' },
      { entityId: 'ent_corp_103', name: 'Zeta Agro Farms Ltd', phone: '+8801711009988' }
    );

    if (resB.decision !== 'pending') {
      console.error(`❌ FAIL: Expected ambiguous match to be routed to 'pending' queue, got ${resB.decision}`);
      failures++;
    } else {
      console.log('✅ Ambiguous entity pair correctly routed to human review queue (decision: pending).');
    }

    // 6. Test Graph Reconciliation report
    const report = await graphSyncService.reconcileGraph();
    if (report.entitiesSynced < 2 || report.totalNodes < 5) {
      console.error('❌ FAIL: Graph reconciliation report node counts inaccurate');
      failures++;
    } else {
      console.log(`✅ Graph reconciliation verified: ${report.entitiesSynced} entities across ${report.totalNodes} total nodes.`);
    }

    // 7. Verify sync logs in SQLite
    const syncLogs = db.prepare('SELECT count(*) as c FROM intel_graph_sync_log').get() as { c: number };
    const resLogs = db.prepare('SELECT count(*) as c FROM intel_entity_resolution').get() as { c: number };

    if (syncLogs.c < 2 || resLogs.c < 2) {
      console.error(`❌ FAIL: Expected >= 2 sync logs and >= 2 resolution records in DB, found ${syncLogs.c} syncs and ${resLogs.c} resolutions`);
      failures++;
    } else {
      console.log(`✅ Database audit trails verified (${syncLogs.c} sync logs, ${resLogs.c} resolution records).`);
    }

  } catch (err: any) {
    console.error(`❌ FAIL: Unexpected error in test: ${err.message}`);
    failures++;
  }

  if (failures === 0) {
    console.log('\n🎉 ALL PHASE 1 (DELIVERABLE 3/38) GRAPH SYNC & RESOLUTION TESTS PASSED (0 failures).\n');
  } else {
    console.error(`\n❌ PHASE 1 GRAPH SYNC TESTS FAILED with ${failures} error(s).\n`);
    process.exit(1);
  }
}

if (process.argv[1]?.endsWith('test-phase1-graph-sync.ts')) {
  runPhase1GraphSyncTests();
}
