
import { v4 as uuidv4 } from 'uuid';
import { getDb } from '../db/sqlite';

export type PermissionAction = 'READ' | 'WRITE' | 'EXECUTE' | 'ADMIN';

export const MODULE_KEYS = [
  'GOV_COMPLIANCE',
  'GOV_AI_ACT',
  'SEC_SOVEREIGNTY',
  'SEC_CYBER',
  'FIN_BILLING',
  'OPS_WORKFLOW',
  'ID_KYC'
] as const;

export type ModuleKey = typeof MODULE_KEYS[number];

export const seedRBAC = () => {
  const db = getDb();
  
  // 1. Seed Permissions
  for (const key of MODULE_KEYS) {
    const actions: PermissionAction[] = ['READ', 'WRITE', 'EXECUTE', 'ADMIN'];
    for (const action of actions) {
      db.prepare(`
        INSERT INTO rbac_permissions (id, key, action, description)
        VALUES (?, ?, ?, ?)
        ON CONFLICT(key, action) DO NOTHING
      `).run(uuidv4(), key, action, `${action} permission for ${key}`);
    }
  }

  // 2. Seed Roles
  const roles = [
    { name: 'PLATFORM_ADMIN', desc: 'Full global access' },
    { name: 'COMPLIANCE_OFFICER', desc: 'Compliance and Operations focus' },
    { name: 'SECURITY_LEAD', desc: 'Security and Sovereignty focus' },
    { name: 'AUDITOR', desc: 'Read-only access across all modules' }
  ];

  for (const role of roles) {
    db.prepare(`
      INSERT INTO rbac_roles (id, name, description)
      VALUES (?, ?, ?)
      ON CONFLICT(name) DO NOTHING
    `).run(uuidv4(), role.name, role.desc);
  }

  // 3. Map Permissions to Roles (Simplified logic for seeding)
  const allRoles = db.prepare('SELECT id, name FROM rbac_roles').all() as any[];
  const allPerms = db.prepare('SELECT id, key, action FROM rbac_permissions').all() as any[];

  for (const role of allRoles) {
    for (const perm of allPerms) {
      let assign = false;
      
      if (role.name === 'PLATFORM_ADMIN') assign = true;
      if (role.name === 'AUDITOR' && perm.action === 'READ') assign = true;
      
      if (role.name === 'COMPLIANCE_OFFICER') {
        if (perm.key.startsWith('GOV_') || perm.key.startsWith('OPS_')) assign = true;
        if (perm.key === 'FIN_BILLING' && perm.action === 'READ') assign = true;
      }

      if (role.name === 'SECURITY_LEAD') {
        if (perm.key.startsWith('SEC_') || perm.key === 'ID_KYC') assign = true;
      }

      if (assign) {
        db.prepare(`
          INSERT INTO rbac_role_permissions (role_id, permission_id)
          VALUES (?, ?)
          ON CONFLICT DO NOTHING
        `).run(role.id, perm.id);
      }
    }
  }
};

export const hasPermission = (userId: string, tenantId: string, module: ModuleKey, action: PermissionAction): boolean => {
  const db = getDb();
  const result = db.prepare(`
    SELECT 1 FROM rbac_user_roles ur
    JOIN rbac_role_permissions rp ON ur.role_id = rp.role_id
    JOIN rbac_permissions p ON rp.permission_id = p.id
    WHERE ur.user_id = ? AND ur.tenant_id = ? AND p.key = ? AND p.action = ?
  `).get(userId, tenantId, module, action);
  
  return !!result;
};
