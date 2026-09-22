import { graphSyncService } from '../src/services/graphSyncService';
import { graphAnalyticsService } from '../src/services/graphAnalyticsService';
import { graphStore } from '../src/services/graphStoreAdapter';
import { initDb, getDb } from '../src/db/sqlite';

export async function runPhase1GraphAnalyticsTests() {
  console.log('=== Running Phase 1 (Deliverable 4/38) Graph Analytics Test Suite ===');
  let failures = 0;

  try {
    initDb();
    const db = getDb();
    await graphStore.clearGraph();

    // 1. Setup Serial Operator Network: 1 Phone linked to 3 distinct entities
    const sharedPhone = '+8801999887766';

    await graphSyncService.syncEntity({
      pg_id: 'ent_shell_01',
      name: 'QuickPay Digital Ltd',
      type: 'Fintech',
      country: 'BD',
      risk_tier: 'HIGH',
      compliance_score: 40,
      blacklisted: false,
      identifiers: [{ type: 'PHONE', value: sharedPhone }],
      violations: [{ pg_id: 'v_01', law_section: 'Section 57', severity: 'HIGH', detected_at: '2026-08-01' }]
    });

    await graphSyncService.syncEntity({
      pg_id: 'ent_shell_02',
      name: 'FastCash Financials Ltd',
      type: 'Fintech',
      country: 'BD',
      risk_tier: 'CRITICAL',
      compliance_score: 25,
      blacklisted: true,
      identifiers: [{ type: 'PHONE', value: sharedPhone }],
      violations: [{ pg_id: 'v_02', law_section: 'Section 24', severity: 'CRITICAL', detected_at: '2026-08-10' }]
    });

    await graphSyncService.syncEntity({
      pg_id: 'ent_shell_03',
      name: 'Rapid Loans Gateway Ltd',
      type: 'Fintech',
      country: 'BD',
      risk_tier: 'MEDIUM',
      compliance_score: 60,
      blacklisted: false,
      identifiers: [{ type: 'PHONE', value: sharedPhone }]
    });

    // Test Serial Operator Detection
    const serialOps = await graphAnalyticsService.detectSerialOperators();
    if (serialOps.length === 0 || serialOps[0].fanOutCount < 3) {
      console.error('❌ FAIL: Expected serial operator to be detected with fanOut >= 3');
      failures++;
    } else {
      console.log(`✅ Serial Operator detected: Shared phone across ${serialOps[0].fanOutCount} entities (${serialOps[0].violatingEntityCount} violating).`);
    }

    // 2. Setup Circular Ownership Loop: Entity 01 -> Entity 02 -> Entity 03 -> Entity 01
    await graphStore.upsertRelationship({
      id: 'rel_own_cycle_1_2',
      type: 'OWNED_BY',
      fromNodeId: 'entity_ent_shell_01',
      toNodeId: 'entity_ent_shell_02',
      properties: { source: 'registry', confidence: 1.0, synced_at: new Date().toISOString() }
    });

    await graphStore.upsertRelationship({
      id: 'rel_own_cycle_2_3',
      type: 'OWNED_BY',
      fromNodeId: 'entity_ent_shell_02',
      toNodeId: 'entity_ent_shell_03',
      properties: { source: 'registry', confidence: 1.0, synced_at: new Date().toISOString() }
    });

    await graphStore.upsertRelationship({
      id: 'rel_own_cycle_3_1',
      type: 'OWNED_BY',
      fromNodeId: 'entity_ent_shell_03',
      toNodeId: 'entity_ent_shell_01',
      properties: { source: 'registry', confidence: 1.0, synced_at: new Date().toISOString() }
    });

    // Test Cycle Detection
    const cycles = await graphAnalyticsService.detectOwnershipCycles();
    if (cycles.length === 0) {
      console.error('❌ FAIL: Expected circular ownership cycle to be detected');
      failures++;
    } else {
      console.log(`✅ Ownership cycle detected: Cycle length ${cycles[0].length} (${cycles[0].cyclePath.join(' ➔ ')}).`);
    }

    // 3. Test Cluster Risk
    const clusters = await graphAnalyticsService.detectRiskClusters();
    if (clusters.length === 0) {
      console.error('❌ FAIL: Expected high-risk cluster to be detected');
      failures++;
    } else {
      console.log(`✅ High-Risk cluster detected: Density ${(clusters[0].violationDensity * 100).toFixed(0)}%, severity ${clusters[0].severity}.`);
    }

    // 4. Test PageRank
    const pageRanks = await graphAnalyticsService.computePageRank(0.85, 20);
    const hasRankValues = Object.keys(pageRanks).length > 0 && Object.values(pageRanks).some(v => v > 0);
    if (!hasRankValues) {
      console.error('❌ FAIL: PageRank calculation returned empty or zero values');
      failures++;
    } else {
      console.log(`✅ PageRank computed across ${Object.keys(pageRanks).length} nodes.`);
    }

    // 5. Test K-Hop Risk Propagation
    const propRisk = await graphAnalyticsService.computeKilledRiskScore('ent_shell_03', 2, 0.5);
    if (propRisk.propagatedBoost <= 0 || propRisk.finalCompositeRisk <= propRisk.baseRisk) {
      console.error('❌ FAIL: Risk propagation did not elevate risk score from high-risk neighbors');
      failures++;
    } else {
      console.log(`✅ K-Hop risk propagation verified: Base Risk ${propRisk.baseRisk} boosted to ${propRisk.finalCompositeRisk} (+${propRisk.propagatedBoost}).`);
    }

    // 6. Verify intel_graph_findings records in DB
    const findingsCount = db.prepare('SELECT count(*) as c FROM intel_graph_findings').get() as { c: number };
    if (findingsCount.c === 0) {
      console.error('❌ FAIL: No findings written to intel_graph_findings table');
      failures++;
    } else {
      console.log(`✅ ${findingsCount.c} findings recorded in intel_graph_findings.`);
    }

  } catch (err: any) {
    console.error(`❌ FAIL: Exception during analytics test: ${err.message}`);
    failures++;
  }

  if (failures === 0) {
    console.log('\n🎉 ALL PHASE 1 (DELIVERABLE 4/38) GRAPH ANALYTICS TESTS PASSED (0 failures).\n');
  } else {
    console.error(`\n❌ PHASE 1 GRAPH ANALYTICS TESTS FAILED with ${failures} error(s).\n`);
    process.exit(1);
  }
}

if (process.argv[1]?.endsWith('test-phase1-graph-analytics.ts')) {
  runPhase1GraphAnalyticsTests();
}
