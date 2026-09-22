import { getDb } from '../src/db/sqlite.js';

const db = getDb();
try {
  db.exec(`CREATE TABLE IF NOT EXISTS platform_feature_flags (
    key TEXT PRIMARY KEY,
    name TEXT NOT NULL DEFAULT '',
    category TEXT NOT NULL DEFAULT 'GENERAL',
    description TEXT NOT NULL DEFAULT '',
    is_enabled INTEGER NOT NULL DEFAULT 1,
    circuit_breaker_active INTEGER NOT NULL DEFAULT 0,
    target_tenants TEXT NOT NULL DEFAULT '["ALL"]',
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
  );`);
} catch {}

db.prepare(`
  INSERT OR IGNORE INTO platform_feature_flags (key, name, category, description, is_enabled, circuit_breaker_active, target_tenants)
  VALUES (?, ?, ?, ?, ?, ?, ?)
`).run(
  'national_scan_engine',
  'National Scanning Engine & B2G Clearinghouse',
  'B2G_SCANNING',
  'Gates the National Scanning Engine war-room and the Regulatory Billing Unification Center (shared sovereign-clearinghouse gate).',
  1, 0, '["ALL"]'
);

const row = db.prepare('SELECT * FROM platform_feature_flags WHERE key = ?').get('national_scan_engine') as any;
console.log('SEEDED:', JSON.stringify(row));