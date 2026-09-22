import 'dotenv/config';
import { initPgDb } from '../src/db/postgres';

async function run() {
  console.log('--- Starting 9Xen Regulettee PostgreSQL Database Migration ---');
  if (!process.env.DATABASE_URL) {
    console.warn('DATABASE_URL environment variable is not defined in environment or .env file.');
    console.warn('Set DATABASE_URL="postgresql://user:password@localhost:5432/regulettee_db" and run again.');
    process.exit(1);
  }

  const success = await initPgDb();
  if (success) {
    console.log('✓ Migration & database seeding completed successfully.');
    process.exit(0);
  } else {
    console.error('✗ Migration failed.');
    process.exit(1);
  }
}

run();
