import { getDb } from './src/db/sqlite.js';

const db = getDb();
const email = 'mustafaattamim@gmail.com';

db.prepare("UPDATE users SET role = 'admin', tenant_id = 'org_master', registration_status = 'approved', mfa_enabled = 1 WHERE email = ?").run(email);
db.prepare("UPDATE admin_users SET role = 'super_admin', is_active = 1 WHERE email = ?").run(email);
db.prepare("UPDATE saas_user_role_permissions SET role = 'SUPER_ADMIN', custom_permissions = '[\"*\"]' WHERE email = ?").run(email);

console.log('✅ Super SaaS Admin Account successfully verified & configured for:', email);
