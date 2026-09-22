/**
 * Programmatic Migration 002: Phase 1 Graph Intelligence
 * Supports Knex / Postgres / SQLite migration execution.
 */

export interface MigrationClient {
  client: { config: { client: string } };
  schema: {
    hasTable: (tableName: string) => Promise<boolean>;
    createTable: (tableName: string, callback: (table: any) => void) => Promise<void>;
    dropTableIfExists: (tableName: string) => Promise<void>;
  };
  fn: { now: () => any };
  raw: (sql: string) => any;
}

export async function up(knex: MigrationClient | any): Promise<void> {
  const isPostgres = knex.client.config.client === 'pg' || knex.client.config.client === 'postgresql';

  // 1. intel_graph_sync_log
  const hasSyncLog = await knex.schema.hasTable('intel_graph_sync_log');
  if (!hasSyncLog) {
    await knex.schema.createTable('intel_graph_sync_log', (table) => {
      if (isPostgres) {
        table.uuid('id').primary().defaultTo(knex.raw('gen_random_uuid()'));
      } else {
        table.string('id').primary();
      }
      table.string('tenant_id', 64).notNullable();
      table.string('country_id', 8).notNullable().defaultTo('BD');
      table.string('entity_type', 32).notNullable();
      table.string('entity_id', 128).notNullable();
      table.string('operation', 32).notNullable();
      table.string('neo4j_tx_id', 128).nullable();
      table.string('sync_status', 24).notNullable().defaultTo('PENDING');
      if (isPostgres) {
        table.jsonb('diff_payload').defaultTo('{}');
      } else {
        table.text('diff_payload').defaultTo('{}');
      }
      table.integer('retry_count').notNullable().defaultTo(0);
      table.text('error_message').nullable();
      table.string('hash_chain', 64).nullable();
      table.timestamp('synced_at').nullable();
      table.timestamp('created_at').notNullable().defaultTo(knex.fn.now());

      table.index(['sync_status', 'country_id'], 'idx_intel_sync_status_country');
      table.index(['entity_type', 'entity_id'], 'idx_intel_sync_entity');
      table.index(['created_at'], 'idx_intel_sync_created_at');
    });
  }

  // 2. intel_graph_findings
  const hasFindings = await knex.schema.hasTable('intel_graph_findings');
  if (!hasFindings) {
    await knex.schema.createTable('intel_graph_findings', (table) => {
      if (isPostgres) {
        table.uuid('id').primary().defaultTo(knex.raw('gen_random_uuid()'));
      } else {
        table.string('id').primary();
      }
      table.string('tenant_id', 64).notNullable();
      table.string('country_id', 8).notNullable().defaultTo('BD');
      table.string('finding_type', 64).notNullable();
      table.string('primary_entity_id', 128).notNullable();
      if (isPostgres) {
        table.jsonb('related_entity_ids').notNullable().defaultTo('[]');
        table.jsonb('graph_path').defaultTo('{}');
        table.jsonb('evidence_refs').notNullable().defaultTo('[]');
      } else {
        table.text('related_entity_ids').notNullable().defaultTo('[]');
        table.text('graph_path').defaultTo('{}');
        table.text('evidence_refs').notNullable().defaultTo('[]');
      }
      table.string('community_id', 64).nullable();
      table.decimal('pagerank_score', 8, 6).notNullable().defaultTo(0.0);
      table.decimal('risk_score', 5, 4).notNullable().defaultTo(0.85);
      table.decimal('confidence', 5, 4).notNullable().defaultTo(0.85);
      table.text('xai_explanation').notNullable();
      table.string('review_status', 24).notNullable().defaultTo('PENDING_REVIEW');
      table.string('severity', 16).notNullable().defaultTo('HIGH');
      table.string('reviewed_by', 128).nullable();
      table.text('review_notes').nullable();
      table.timestamp('reviewed_at').nullable();
      table.timestamp('created_at').notNullable().defaultTo(knex.fn.now());

      table.index(['country_id', 'review_status'], 'idx_intel_findings_country_status');
      table.index(['finding_type', 'severity'], 'idx_intel_findings_type_severity');
      table.index(['primary_entity_id'], 'idx_intel_findings_primary_entity');
    });
  }

  // 3. intel_entity_resolution
  const hasResolution = await knex.schema.hasTable('intel_entity_resolution');
  if (!hasResolution) {
    await knex.schema.createTable('intel_entity_resolution', (table) => {
      if (isPostgres) {
        table.uuid('id').primary().defaultTo(knex.raw('gen_random_uuid()'));
      } else {
        table.string('id').primary();
      }
      table.string('tenant_id', 64).notNullable();
      table.string('country_id', 8).notNullable().defaultTo('BD');
      table.string('candidate_a_id', 128).notNullable();
      table.string('candidate_b_id', 128).notNullable();
      table.string('candidate_a_name', 256).nullable();
      table.string('candidate_b_name', 256).nullable();
      table.string('blocking_key', 128).notNullable();
      table.decimal('deterministic_score', 5, 4).notNullable().defaultTo(0.0);
      table.decimal('llm_similarity_score', 5, 4).notNullable().defaultTo(0.0);
      table.decimal('composite_confidence', 5, 4).notNullable().defaultTo(0.0);
      if (isPostgres) {
        table.jsonb('shared_identifiers').notNullable().defaultTo('[]');
      } else {
        table.text('shared_identifiers').notNullable().defaultTo('[]');
      }
      table.string('decision', 24).notNullable().defaultTo('PENDING');
      table.string('decided_by', 128).nullable();
      table.text('decision_rationale').nullable();
      table.timestamp('decided_at').nullable();
      table.timestamp('created_at').notNullable().defaultTo(knex.fn.now());

      table.unique(['tenant_id', 'candidate_a_id', 'candidate_b_id'], 'uq_intel_resolution_candidates');
      table.index(['country_id', 'decision'], 'idx_intel_resolution_country_dec');
      table.index(['blocking_key'], 'idx_intel_resolution_blocking');
      table.index(['composite_confidence'], 'idx_intel_resolution_confidence');
    });
  }
}

export async function down(knex: MigrationClient | any): Promise<void> {
  await knex.schema.dropTableIfExists('intel_entity_resolution');
  await knex.schema.dropTableIfExists('intel_graph_findings');
  await knex.schema.dropTableIfExists('intel_graph_sync_log');
}
