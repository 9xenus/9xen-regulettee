import { complianceModuleRegistry } from './engine/module-registry';
import { dbDrivenRuleEngine } from './engine/db-rule-engine';
import { regulatoryChangeTracker } from './engine/change-tracker';
import { complianceReportGenerator } from './engine/report-generator';

let seeded = false;

/**
 * Idempotent seeding of Compliance Hub defaults. Called once at server startup
 * (not from db/sqlite init) to avoid circular module init during schema load.
 */
export function seedComplianceHub(): { modules: number; rules: number; changes: number; templates: number } {
  if (seeded) return { modules: 0, rules: 0, changes: 0, templates: 0 };
  seeded = true;
  const modules = complianceModuleRegistry.seedDefaults();
  const rules = dbDrivenRuleEngine.seedDefaults();
  const changes = regulatoryChangeTracker.seedDefaults();
  const templates = complianceReportGenerator.seedDefaults();
  return { modules, rules, changes, templates };
}