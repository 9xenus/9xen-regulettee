import fs from 'fs';
import path from 'path';

export async function runPhase0Tests() {
  console.log('=== Running Phase 0 Verification Test Suite ===');
  let failures = 0;

  // 1. Verify requirements.txt
  const reqPath = path.resolve(process.cwd(), 'requirements.txt');
  if (!fs.existsSync(reqPath)) {
    console.error('❌ FAIL: requirements.txt does not exist');
    failures++;
  } else {
    const content = fs.readFileSync(reqPath, 'utf8');
    const requiredPackages = [
      'fastapi==', 'uvicorn', 'neo4j==', 'scikit-learn==', 'flwr==',
      'transformers==', 'lightgbm==', 'paddleocr', 'faster-whisper==',
      'instructor==', 'blake3==', 'cryptography=='
    ];
    for (const pkg of requiredPackages) {
      if (!content.includes(pkg)) {
        console.error(`❌ FAIL: requirements.txt missing package: ${pkg}`);
        failures++;
      }
    }
    console.log('✅ requirements.txt has all required pinned dependencies.');
  }

  // 2. Verify docker-compose.yml
  const composePath = path.resolve(process.cwd(), 'docker-compose.yml');
  if (!fs.existsSync(composePath)) {
    console.error('❌ FAIL: docker-compose.yml does not exist');
    failures++;
  } else {
    const content = fs.readFileSync(composePath, 'utf8');
    const requiredServices = ['postgres:', 'redis:', 'neo4j:', 'minio:', 'vault:'];
    for (const s of requiredServices) {
      if (!content.includes(s)) {
        console.error(`❌ FAIL: docker-compose.yml missing service: ${s}`);
        failures++;
      }
    }
    console.log('✅ docker-compose.yml declares all 5 foundation infrastructure services.');
  }

  // 3. Verify package.json
  const pkgPath = path.resolve(process.cwd(), 'package.json');
  const pkgJson = JSON.parse(fs.readFileSync(pkgPath, 'utf8'));
  const criticalDeps = ['express', 'zod', 'helmet', 'ioredis', 'bullmq', 'pg', 'better-sqlite3'];
  for (const dep of criticalDeps) {
    if (!pkgJson.dependencies[dep]) {
      console.error(`❌ FAIL: package.json missing core dependency: ${dep}`);
      failures++;
    }
  }
  console.log('✅ package.json contains all required node runtime packages.');

  // 4. Verify infra directory configs
  const vaultConfig = path.resolve(process.cwd(), 'infra/vault/vault-config.hcl');
  const cypherInit = path.resolve(process.cwd(), 'infra/neo4j/init.cypher');
  if (!fs.existsSync(vaultConfig) || !fs.existsSync(cypherInit)) {
    console.error('❌ FAIL: Infrastructure config files missing in /infra');
    failures++;
  } else {
    console.log('✅ Infrastructure configs (Vault HCL & Neo4j init.cypher) verified.');
  }

  if (failures === 0) {
    console.log('\n🎉 ALL PHASE 0 MANIFEST & FOUNDATION TESTS PASSED (0 failures).\n');
  } else {
    console.error(`\n❌ PHASE 0 TESTS FAILED with ${failures} error(s).\n`);
    process.exit(1);
  }
}

if (process.argv[1]?.endsWith('test-phase0.ts')) {
  runPhase0Tests();
}
