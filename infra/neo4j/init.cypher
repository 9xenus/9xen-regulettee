// ============================================================
// Phase 1 Graph Intelligence Constraints & Indexes (Neo4j 5.x)
// ============================================================

// Unique Constraints
CREATE CONSTRAINT entity_pg_id_unique IF NOT EXISTS
FOR (e:Entity) REQUIRE e.pg_id IS UNIQUE;

CREATE CONSTRAINT person_name_unique IF NOT EXISTS
FOR (p:Person) REQUIRE p.name IS UNIQUE;

CREATE CONSTRAINT identifier_type_value_unique IF NOT EXISTS
FOR (i:Identifier) REQUIRE (i.type, i.value) IS UNIQUE;

CREATE CONSTRAINT website_domain_unique IF NOT EXISTS
FOR (w:Website) REQUIRE w.domain IS UNIQUE;

CREATE CONSTRAINT violation_pg_id_unique IF NOT EXISTS
FOR (v:Violation) REQUIRE v.pg_id IS UNIQUE;

// Performance Indexes
CREATE INDEX entity_country_idx IF NOT EXISTS
FOR (e:Entity) ON (e.country);

CREATE INDEX entity_risk_tier_idx IF NOT EXISTS
FOR (e:Entity) ON (e.risk_tier);

CREATE INDEX violation_severity_idx IF NOT EXISTS
FOR (v:Violation) ON (v.severity);
