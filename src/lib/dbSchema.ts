// Database Schema Configuration (Drizzle ORM representation)

import {
  pgTable,
  uuid,
  varchar,
  text,
  boolean,
  integer,
  jsonb,
  timestamp,
  primaryKey,
} from "drizzle-orm/pg-core";

// Tenants: The SaaS customers
export const tenants = pgTable("tenants", {
  id: uuid("id").primaryKey().defaultRandom(),
  name: varchar("name", { length: 255 }).notNull(),
  domain: varchar("domain", { length: 255 }).unique().notNull(),
  planId: uuid("plan_id").references(() => plans.id),
  status: varchar("status", { length: 50 }).default("active"),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

// Company Profiles: Used to trigger the regulation mapping rules
export const companyProfiles = pgTable("company_profiles", {
  id: uuid("id").primaryKey().defaultRandom(),
  tenantId: uuid("tenant_id")
    .references(() => tenants.id)
    .notNull(),
  businessType: varchar("business_type", { length: 100 }).notNull(), // e.g. SaaS, Fintech
  companySize: varchar("company_size", { length: 50 }).notNull(), // e.g. SME, Enterprise
  geography: varchar("geography", { length: 50 }).notNull(), // e.g. EU, Global
  dataHandlingTypes: jsonb("data_handling_types").notNull(), // array of strings
  aiUsageLevel: varchar("ai_usage_level", { length: 100 }).notNull(),
  digitalServicesProvider: boolean("digital_services_provider").default(false),
  criticalInfrastructure: boolean("critical_infrastructure").default(false),
  lastCalculatedAt: timestamp("last_calculated_at"),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
});

// Plans: Blueprint for what gets included in subscription vs add-on
export const plans = pgTable("plans", {
  id: uuid("id").primaryKey().defaultRandom(),
  name: varchar("name", { length: 100 }).notNull(),
  basePrice: integer("base_price_cents").notNull(),
  includedCoreActs: jsonb("included_core_acts").notNull(), // array of regulation act IDs
});

// Regulations: The available policy modules mapped to the system
export const regulations = pgTable("regulations", {
  id: varchar("id", { length: 50 }).primaryKey(), // e.g., 'GDPR', 'AIACT', 'DORA'
  name: varchar("name", { length: 255 }).notNull(),
  description: text("description"),
  version: varchar("version", { length: 50 }).notNull(), // tracks changes to laws
  defaultAddonPrice: integer("default_addon_price_cents").notNull(),
});

// Regulation Rules Engine: Matrix for checking applicability
export const regulationRules = pgTable("regulation_rules", {
  id: uuid("id").primaryKey().defaultRandom(),
  actId: varchar("act_id", { length: 50 })
    .references(() => regulations.id)
    .notNull(),
  conditionType: varchar("condition_type", { length: 50 }).notNull(), // e.g. 'REQUIRES_DATA'
  conditionValue: varchar("condition_value", { length: 255 }).notNull(),
  scoreWeight: integer("score_weight").notNull(),
});

// Tenant Entitlements: Feature Flags mapping regulations to tenants
export const tenantEntitlements = pgTable(
  "tenant_entitlements",
  {
    tenantId: uuid("tenant_id")
      .references(() => tenants.id)
      .notNull(),
    actId: varchar("act_id", { length: 50 })
      .references(() => regulations.id)
      .notNull(),
    isEnabled: boolean("is_enabled").default(false).notNull(),
    billingModel: varchar("billing_model", { length: 50 }).notNull(), // 'included', 'add-on', 'custom'
    customPrice: integer("custom_price_cents"), // If overridden from default
  },
  (t: any) => ({
    pk: primaryKey(t.tenantId, t.actId),
  }),
);

// Tenant Regulation Status: Track per-tenant compliance workflow progress
export const tenantRegulationStatus = pgTable("tenant_regulation_status", {
  id: uuid("id").primaryKey().defaultRandom(),
  tenantId: uuid("tenant_id")
    .references(() => tenants.id)
    .notNull(),
  actId: varchar("act_id", { length: 50 })
    .references(() => regulations.id)
    .notNull(),
  calculatedStatus: varchar("calculated_status", { length: 50 }).notNull(), // 'Applicable', 'Upgrade', 'Skip'
  applicabilityScore: integer("applicability_score").notNull(),
  reasonLog: text("reason_log"), // The explanation string for why it applies
  lastCheckedDate: timestamp("last_checked_date").defaultNow(),
});

// Audit Logs: Full immutable auditing of system changes
export const auditLogs = pgTable("audit_logs", {
  id: uuid("id").primaryKey().defaultRandom(),
  tenantId: uuid("tenant_id")
    .references(() => tenants.id)
    .notNull(),
  adminUserId: uuid("admin_user_id"),
  action: varchar("action", { length: 255 }).notNull(),
  entityType: varchar("entity_type", { length: 100 }), // e.g. 'ENTITLEMENT', 'PROFILE'
  entityId: varchar("entity_id", { length: 100 }),
  previousState: jsonb("previous_state"),
  newState: jsonb("new_state"),
  timestamp: timestamp("timestamp").defaultNow().notNull(),
});

// Cybersecurity Modules Configuration
export const securityModules = pgTable("security_modules", {
  id: varchar("id", { length: 50 }).primaryKey(),
  name: varchar("name", { length: 150 }).notNull(),
  description: text("description"),
  basePriceCents: integer("base_price_cents").notNull(),
  complianceActs: jsonb("compliance_acts"), // e.g. ["NIS2", "DORA"]
  createdAt: timestamp("created_at").defaultNow(),
});

// Tenant Security Entitlements & Configuration
export const tenantSecurityEntitlements = pgTable(
  "tenant_security_entitlements",
  {
    id: uuid("id").primaryKey().defaultRandom(),
    tenantId: uuid("tenant_id")
      .references(() => tenants.id)
      .notNull(),
    moduleId: varchar("module_id")
      .references(() => securityModules.id)
      .notNull(),
    isEnabled: boolean("is_enabled").default(false),
    status: varchar("status", { length: 50 }).default("active"),
    customPriceCents: integer("custom_price_cents"),
    updatedAt: timestamp("updated_at").defaultNow(),
  },
);

// Security Incidents for Tracking & Mitigation (SOC)
export const securityIncidents = pgTable("security_incidents", {
  id: uuid("id").primaryKey().defaultRandom(),
  tenantId: uuid("tenant_id")
    .references(() => tenants.id)
    .notNull(),
  title: varchar("title", { length: 255 }).notNull(),
  severity: varchar("severity", { length: 20 }).notNull(), // 'CRITICAL', 'HIGH', etc.
  status: varchar("status", { length: 20 }).notNull(), // 'NEW', 'TRIAGE', 'INVESTIGATING', 'CONTAINED', 'RESOLVED'
  source: varchar("source", { length: 50 }),
  owner: varchar("owner", { length: 150 }),
  affectedSystems: jsonb("affected_systems"),
  createdAt: timestamp("created_at").defaultNow(),
  resolvedAt: timestamp("resolved_at"),
});

// Security Alerts
export const securityAlerts = pgTable("security_alerts", {
  id: uuid("id").primaryKey().defaultRandom(),
  tenantId: uuid("tenant_id")
    .references(() => tenants.id)
    .notNull(),
  title: text("title").notNull(),
  severity: varchar("severity", { length: 20 }).notNull(),
  isAssociatedIncident: uuid("associated_incident_id").references(
    () => securityIncidents.id,
  ),
  createdAt: timestamp("created_at").defaultNow(),
});

export const securityTasks = pgTable("security_tasks", {
  id: uuid("id").primaryKey().defaultRandom(),
  tenantId: uuid("tenant_id")
    .references(() => tenants.id)
    .notNull(),
  description: text("description").notNull(),
  status: varchar("status", { length: 20 }).default("pending"),
  dueDate: timestamp("due_date"),
});

export const securityFindings = pgTable("security_findings", {
  id: uuid("id").primaryKey().defaultRandom(),
  tenantId: uuid("tenant_id")
    .references(() => tenants.id)
    .notNull(),
  title: varchar("title", { length: 255 }).notNull(),
  description: text("description"),
  severity: varchar("severity", { length: 20 }).notNull(), // 'CRITICAL', 'HIGH', 'MEDIUM', 'LOW'
  status: varchar("status", { length: 20 }).default("open"), // 'open', 'resolved', 'ignored'
  source: varchar("source", { length: 50 }).notNull(), // e.g. 'SAST', 'CSPM', 'DAST'
  resourceId: varchar("resource_id", { length: 255 }), // Affected resource identifier
  createdAt: timestamp("created_at").defaultNow(),
  resolvedAt: timestamp("resolved_at"),
  incidentId: uuid("incident_id").references(() => securityIncidents.id),
});

export const incidentTimelines = pgTable("incident_timelines", {
  id: uuid("id").primaryKey().defaultRandom(),
  incidentId: uuid("incident_id")
    .references(() => securityIncidents.id)
    .notNull(),
  actorId: varchar("actor_id", { length: 150 }),
  actorName: varchar("actor_name", { length: 150 }),
  actionDetails: text("action_details").notNull(),
  timestamp: timestamp("timestamp").defaultNow(),
  eventType: varchar("event_type", { length: 50 }).default("system"), // 'system', 'user', 'integration'
});
