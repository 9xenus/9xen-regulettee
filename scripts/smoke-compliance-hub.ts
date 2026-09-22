import { complianceModuleRegistry } from '../src/modules/compliance-hub/engine/module-registry';
import { dbDrivenRuleEngine } from '../src/modules/compliance-hub/engine/db-rule-engine';
import { regulatoryChangeTracker } from '../src/modules/compliance-hub/engine/change-tracker';
import { complianceReportGenerator } from '../src/modules/compliance-hub/engine/report-generator';
import { realtimeScoreEngine } from '../src/modules/compliance-hub/engine/realtime-score';
import { getDb } from '../src/db/sqlite';
import { registerSectorPacks, listLoadedSectorPacks } from '../src/modules/compliance-hub/engine/sector-pack-loader';

const log = (label: string, ok: boolean, extra?: any) => {
  console.log(`[${ok ? 'PASS' : 'FAIL'}] ${label}${extra !== undefined ? ' — ' + JSON.stringify(extra) : ''}`);
};

try {
  const db = getDb();
  const tables = [
    'compliance_modules', 'compliance_score_snapshots',
    'compliance_report_templates', 'compliance_change_acknowledgements'
  ];
  for (const t of tables) {
    const row = db.prepare(`SELECT name FROM sqlite_master WHERE type='table' AND name=?`).get(t) as any;
    log(`table ${t} exists`, !!row);
  }

  const moduleSeed = complianceModuleRegistry.seedDefaults();
  log('seed enabling: module roles', moduleSeed >= 0, { count: moduleSeed, rowCount: complianceModuleRegistry.listModules().length });

  const listed = complianceModuleRegistry.listModules({ status: 'ACTIVE' });
  log('list modules', Array.isArray(listed));
  log('sector categories', complianceModuleRegistry.getSectorCategories().length > 0, complianceModuleRegistry.getSectorCategories().slice(0, 3));

  const ruleSeed = dbDrivenRuleEngine.seedDefaults();
  const rulesetCount = db.prepare(`SELECT count(*) AS c FROM dynamic_rulesets`).get() as { c: number };
  log('rulesets seeded', ruleSeed > 0 || rulesetCount.c >= 4, { created: ruleSeed, inDb: rulesetCount.c });

  const rs = dbDrivenRuleEngine.getRuleset('gdpr-breach-72h');
  log('get gdpr ruleset', !!rs, rs ? { name: rs.name, rules: rs.rules.length } : null);

  const evalResult = await dbDrivenRuleEngine.evaluate({
    isDataBreach: true, hoursSinceDiscovery: 80, regulatorNotified: false
  });
  log('rule evaluation catches GDPR 72h breach', evalResult.matchedRules.some(m => m.rule.code === 'GDPR_ART33_72H'), { compliant: evalResult.compliant, matched: evalResult.matchedRules.length });

  const evalPass = await dbDrivenRuleEngine.evaluate({
    isDataBreach: true, hoursSinceDiscovery: 10, regulatorNotified: true
  });
  log('rule evaluation passes clean facts', evalPass.compliant === true, { compliant: evalPass.compliant });

  const score = realtimeScoreEngine.evaluateTenant('smoke_tenant');
  log('realtime score evaluated', score.overallScore >= 0 && score.overallScore <= 100, { overall: score.overallScore, grade: score.grade, frameworks: score.activeFrameworks });
  log('snapshot persisted', realtimeScoreEngine.getScoreHistory('smoke_tenant').length > 0);

  const reportSeed = complianceReportGenerator.seedDefaults();
  const reportTplCount = db.prepare(`SELECT count(*) AS c FROM compliance_report_templates`).get() as { c: number };
  log('report templates seeded', reportSeed > 0 || reportTplCount.c >= 4, { count: reportSeed, inDb: reportTplCount.c });
  const report = complianceReportGenerator.generate('exec-summary', {
    tenantId: 'smoke_tenant',
    scores: { GDPR: 92, 'EU_AI_ACT': 71 },
    violations: [{ severity: 'CRITICAL', count: 2 }],
    changes: [],
    modules: []
  });
  log('report generated', report.contentBytes > 0, { file: report.fileName, bytes: report.contentBytes });

  const changeSeed = regulatoryChangeTracker.seedDefaults();
  const trackedChanges = regulatoryChangeTracker.listChanges({}).length;
  log('regulatory changes seeded', changeSeed > 0 || trackedChanges >= 5, { created: changeSeed, inDb: trackedChanges });
  const changes = regulatoryChangeTracker.listChanges({ country: 'EU' });
  log('list EU changes', changes.length > 0, { count: changes.length });
  const ack = regulatoryChangeTracker.acknowledge({
    updateId: changes[0].id, tenantId: 'smoke_tenant', acknowledgedBy: 'test-admin'
  });
  log('change acknowledged', ack.acknowledged === true, { id: ack.id });

  const unacked = regulatoryChangeTracker.getUnacknowledgedCount('smoke_tenant');
  log('unacknowledged count', typeof unacked === 'number', { unacked });

  // --- Sector pack loader ---
  const fakeApp = { use: () => {}, post: () => {}, get: () => {}, set: () => {} };
  const packs = registerSectorPacks(fakeApp);
  log('sector packs loaded (25)', packs.length === 25, { count: packs.length, names: packs.map(p => p.name.split(' & ')[0]).join(', ') });
  const totalModules = packs.reduce((s, p) => s + p.moduleCount, 0);
  log('total sector modules across packs', totalModules >= 30, { totalModules });
  const gdprTbl = db.prepare(`SELECT name FROM sqlite_master WHERE type='table' AND name='procurement_tenders'`).get() as any;
  log('govt schema table created', !!gdprTbl);
  const finTbl = db.prepare(`SELECT name FROM sqlite_master WHERE type='table' AND name='loan_applications'`).get() as any;
  log('finance schema table created', !!finTbl);
  const medTbl = db.prepare(`SELECT name FROM sqlite_master WHERE type='table' AND name='patient_health_records'`).get() as any;
  log('healthcare schema table created', !!medTbl);
  const sectorModules = complianceModuleRegistry.listModules({ category: 'SECTOR_SPECIFIC' }).concat(complianceModuleRegistry.listModules({ category: 'GOVERNMENT_B2G' }));
  log('sector modules surfaced in registry', sectorModules.length >= 4, { sectorModules: sectorModules.map(m => m.slug).slice(0, 6) });

  console.log('\nSMOKE TEST COMPLETE');
} catch (err: any) {
  console.error('\nSMOKE TEST FAILED:', err?.message);
  console.error(err?.stack);
  process.exit(1);
}