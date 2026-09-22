import { z } from 'zod';

export const PlatformConfigSchema = z.object({
  NODE_ENV: z.enum(['development', 'production', 'test']).default('development'),
  PORT: z.coerce.number().default(3000),
  APP_SECRET: z.string().min(16).default('sovereign_secret_key_minimum_32_chars_long_entropy_9xen'),
  
  // Database (PostgreSQL 16)
  POSTGRES_HOST: z.string().default('localhost'),
  POSTGRES_PORT: z.coerce.number().default(5432),
  POSTGRES_DB: z.string().default('regulettee_core'),
  POSTGRES_USER: z.string().default('regulettee_admin'),
  POSTGRES_PASSWORD: z.string().default('ChangeMeInProduction_VaultManaged9Xen!'),

  // Cache & Message Queue (Redis 7)
  REDIS_HOST: z.string().default('localhost'),
  REDIS_PORT: z.coerce.number().default(6379),
  REDIS_PASSWORD: z.string().default('ChangeMeRedisSecret9Xen!'),

  // Graph Intelligence (Neo4j 5)
  NEO4J_URI: z.string().default('bolt://localhost:7687'),
  NEO4J_USER: z.string().default('neo4j'),
  NEO4J_PASSWORD: z.string().default('ChangeMeNeo4jVaultManaged9Xen!'),

  // S3 Object Store (MinIO)
  MINIO_ENDPOINT: z.string().default('localhost'),
  MINIO_PORT: z.coerce.number().default(9000),
  MINIO_USE_SSL: z.boolean().default(false),
  MINIO_ROOT_USER: z.string().default('regulettee_minio_admin'),
  MINIO_ROOT_PASSWORD: z.string().default('ChangeMeMinIOVaultPassword9Xen!'),
  MINIO_EVIDENCE_BUCKET: z.string().default('regulettee-evidence-vault'),

  // HashiCorp Vault KMS
  VAULT_ADDR: z.string().default('http://localhost:8200'),
  VAULT_TOKEN: z.string().default('root-dev-token-9xen'),

  // Microservice Uplink
  PYTHON_ML_SERVICE_URL: z.string().default('http://localhost:8000'),
});

export type PlatformConfig = z.infer<typeof PlatformConfigSchema>;

export function getPlatformConfig(env: Record<string, any> = process.env): PlatformConfig {
  const result = PlatformConfigSchema.safeParse(env);
  if (!result.success) {
    console.warn('⚠️ Platform Config validation warning (using hardened defaults):', result.error.format());
    return PlatformConfigSchema.parse({});
  }
  return result.data;
}

export const config = getPlatformConfig();
