# 9Xen Regulettee — Sovereign Compliance-as-a-Service (CaaS)

9Xen Regulettee is a RegTech platform that turns EU regulatory text (EU AI Act, GDPR, DORA, NIS2, MiCA, and more) into executable, multi-tenant compliance workflows. It combines a rule engine, graph intelligence, zero-knowledge proofs, KYC/KYB orchestration, encryption at rest and in transit, and an immutable audit ledger behind a strict RBAC control plane.

## Stack

- **Frontend:** React 19 + Vite 6 + Tailwind 4 + Recharts
- **Backend:** Express 4 on Node, bootstrapped via `tsx` in dev and bundled to `dist/server.cjs` via esbuild for production
- **Datastores (optional adapters):** SQLite (default, server-side only), PostgreSQL (via `pg`), Neo4j (graph intel), Redis (BullMQ queues), MinIO (evidence vault), HashiCorp Vault (secrets)
- **Auth:** signed bearer tokens (`base64url(payload).base64url(HMAC-SHA256)`), role-based access (ADMIN / SUPER_ADMIN / COMPLIANCE_OFFICER / AUDITOR / LAWYER / TENANT_USER / REGULATOR), SAML/SSO assertions, TOTP MFA
- **Infrastructure:** Docker Compose (postgres/redis/neo4j/minio/vault), Terraform (AWS `eu-central-1`, OCI)

## Run Locally

Prerequisites: Node.js **>= 22.12** and npm.

1. Install dependencies:
   ```bash
   npm install
   ```

2. Configure environment. Copy `server.ts`-driven config via a `.env` file (Dotenv is loaded at startup). At minimum, set a signing secret for sessions:
   ```bash
   JWT_SECRET=$(openssl rand -base64 48)
   ```
   Optional: `DATABASE_URL`, `GEMINI_API_KEY`, `NEXI_*` payment credentials, `PII_VAULT_KEY`, `WEBHOOK_SIGNING_SECRET`, etc. (Production refuses to start without the required secrets.)

3. Start the dev server (frontend + API):
   ```bash
   npm run dev
   ```
   - API: `http://localhost:3000`
   - Dev-only auth bypass (never in production): set `DEV_AUTH_BYPASS=true`

## Production Build

```bash
npm run build       # vite build + esbuild bundle server
npm start           # node dist/server.cjs
```

Set `NODE_ENV=production` and all required secret env vars (e.g. `JWT_SECRET`, `WEBHOOK_SIGNING_SECRET`, `PII_VAULT_KEY`, `AUDIT_HMAC_SECRET`, `ENCRYPTION_KEY`). The server fails fast if mandatory secrets are missing.

## Key Scripts

| Command | Purpose |
| --- | --- |
| `npm run dev` | Start dev server via tsx |
| `npm run build` | Production build (client + server bundle) |
| `npm run lint` | `tsc --noEmit` typecheck |
| `npm run test:backend` | Backend smoke tests |
| `npm run test:unit` | Vitest unit tests |

## Security Notes

- No client-supplied identity headers (`x-user-id`, `x-tenant-id`) are trusted; identity is derived from verified signed tokens only.
- Fake/auto-approved verification (KYC, KYB, EUDI, biometric) is refused in production — an integrated provider or explicit `PENDING` state is returned.
- All production feature/seed/demo write endpoints are gated behind authentication and role checks.
- Docker Compose defaults are development-only; override every `ChangeMe*` value before any non-local deployment.