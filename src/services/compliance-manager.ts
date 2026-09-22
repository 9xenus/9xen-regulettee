import db from '../db/sqlite';
import { ComplianceFramework, TenantFrameworkActivation } from '../types';

export const ComplianceManager = {
  getTenantEnabledPolicies: (tenantId: string): ComplianceFramework[] => {
    const query = `
      SELECT cf.* 
      FROM compliance_frameworks cf
      JOIN tenant_framework_activations tfa ON cf.id = tfa.framework_id
      WHERE tfa.tenant_id = ? AND tfa.status = 'ACTIVE'
    `;
    return db.prepare(query).all(tenantId) as ComplianceFramework[];
  },

  activateFramework: (tenantId: string, frameworkId: string, config: Record<string, any> = {}) => {
    const stmt = db.prepare(`
      INSERT INTO tenant_framework_activations (tenant_id, framework_id, config)
      VALUES (?, ?, ?)
    `);
    return stmt.run(tenantId, frameworkId, JSON.stringify(config));
  },

  logAudit: (tenantId: string, frameworkId: string, action: string, status: string, details: Record<string, any> = {}) => {
    const stmt = db.prepare(`
      INSERT INTO compliance_audit_logs (tenant_id, framework_id, action, status, details)
      VALUES (?, ?, ?, ?, ?)
    `);
    return stmt.run(tenantId, frameworkId, action, status, JSON.stringify(details));
  },

  getAuditLogs: (tenantId: string) => {
    const query = `
      SELECT * FROM compliance_audit_logs
      WHERE tenant_id = ?
      ORDER BY created_at DESC
    `;
    return db.prepare(query).all(tenantId);
  }
};
