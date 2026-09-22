const Database = require('better-sqlite3');
const path = require('path');
const fs = require('fs');

const dbPath = path.join(__dirname, '..', 'compliance.db');

if (!fs.existsSync(dbPath)) {
  console.log(`Database file not found at ${dbPath}. Nothing to purge.`);
  process.exit(0);
}

try {
  console.log(`Connecting to SQLite database at ${dbPath}...`);
  const db = new Database(dbPath);

  // Disable foreign key constraints temporarily to allow clean purge
  db.pragma('foreign_keys = OFF');

  const demoTenants = [
    'org_1',
    'org_2',
    'org_3',
    'org_4',
    'org_ae_1',
    'org_ng_1',
    'org_sa_1'
  ];

  const demoScans = [
    'scan_1',
    'scan_2',
    'scan_3',
    'scan_4'
  ];

  console.log('--- PURGING DEMO RECORDS ---');

  // 1. Purge Tenants & settings
  const deleteTenants = db.prepare('DELETE FROM tenants WHERE id = ?');
  const deleteSettings = db.prepare('DELETE FROM tenant_settings WHERE tenant_id = ?');
  const deleteSSO = db.prepare('DELETE FROM enterprise_sso_configs WHERE tenant_id = ?');
  const deleteActivations = db.prepare('DELETE FROM tenant_framework_activations WHERE tenant_id = ?');
  const deleteSandbox = db.prepare('DELETE FROM sandbox_preclearance_requests WHERE organization_id = ?');
  const deleteOperations = db.prepare('DELETE FROM caas_operations WHERE tenant_id = ?');
  const deleteInquiries = db.prepare('DELETE FROM regulatory_inquiries WHERE target_organization_id = ?');
  const deleteFilings = db.prepare('DELETE FROM regulatory_filings WHERE organization_id = ?');

  let tenantsPurged = 0;
  let settingsPurged = 0;
  let ssoPurged = 0;
  let activationsPurged = 0;
  let sandboxPurged = 0;
  let operationsPurged = 0;
  let inquiriesPurged = 0;
  let filingsPurged = 0;

  db.transaction(() => {
    for (const tenantId of demoTenants) {
      const resT = deleteTenants.run(tenantId);
      tenantsPurged += resT.changes;

      const resS = deleteSettings.run(tenantId);
      settingsPurged += resS.changes;

      const resSso = deleteSSO.run(tenantId);
      ssoPurged += resSso.changes;

      const resA = deleteActivations.run(tenantId);
      activationsPurged += resA.changes;

      const resSb = deleteSandbox.run(tenantId);
      sandboxPurged += resSb.changes;

      const resOp = deleteOperations.run(tenantId);
      operationsPurged += resOp.changes;

      const resInq = deleteInquiries.run(tenantId);
      inquiriesPurged += resInq.changes;

      const resFil = deleteFilings.run(tenantId);
      filingsPurged += resFil.changes;
    }
  })();

  console.log(`Deleted Tenants: ${tenantsPurged}`);
  console.log(`Deleted Tenant Settings: ${settingsPurged}`);
  console.log(`Deleted SSO Configs: ${ssoPurged}`);
  console.log(`Deleted Framework Activations: ${activationsPurged}`);
  console.log(`Deleted Sandbox Requests: ${sandboxPurged}`);
  console.log(`Deleted CaaS Operations: ${operationsPurged}`);
  console.log(`Deleted Regulatory Inquiries: ${inquiriesPurged}`);
  console.log(`Deleted Regulatory Filings: ${filingsPurged}`);

  // 2. Purge Scans
  const deleteScans = db.prepare('DELETE FROM scan_results WHERE scan_id = ?');
  let scansPurged = 0;

  db.transaction(() => {
    for (const scanId of demoScans) {
      const resScan = deleteScans.run(scanId);
      scansPurged += resScan.changes;
    }
  })();

  console.log(`Deleted Scan Results: ${scansPurged}`);

  // Re-enable foreign key constraints
  db.pragma('foreign_keys = ON');

  db.close();
  console.log('-----------------------------');
  console.log('SQLite database purged successfully. Ready for clean launch without seed data!');
} catch (err) {
  console.error('Error during database purge:', err.message);
  process.exit(1);
}
