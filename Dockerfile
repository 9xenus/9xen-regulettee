# ═══════════════════════════════════════════════════════════
# Stage 1: Build frontend (Vite + React)
# ═══════════════════════════════════════════════════════════
FROM node:22-slim AS frontend-build

WORKDIR /app

# Install only build-critical deps first (layer cache)
COPY package.json package-lock.json ./
RUN npm ci --ignore-scripts 2>/dev/null || npm install --ignore-scripts

# Copy source for frontend build
COPY vite.config.ts tsconfig.json index.html ./
COPY src/ src/

# Build frontend
ENV DISABLE_HMR=true
ENV NODE_ENV=production
RUN npx vite build 2>&1 || echo "Vite build failed, continuing with dev mode fallback"

# ═══════════════════════════════════════════════════════════
# Stage 2: Production runtime
# ═══════════════════════════════════════════════════════════
FROM node:22-slim AS production

# Security: non-root user
RUN groupadd -r regulettee && useradd -r -g regulettee -m regulettee

WORKDIR /app

# Install production dependencies only
COPY package.json package-lock.json ./
RUN npm ci --omit=dev --ignore-scripts 2>/dev/null || npm install --omit=dev --ignore-scripts

# Copy server source
COPY server.ts ./
COPY src/ src/
COPY packages/ packages/
COPY scripts/ scripts/

# Copy built frontend from stage 1 (if build succeeded)
COPY --from=frontend-build /app/dist/ dist/

# Copy polyfill files needed by vite.config aliases
COPY src/utils/ src/utils/

# Ensure dist directory exists (fallback for dev mode)
RUN mkdir -p dist

# Set ownership
RUN chown -R regulettee:regulettee /app

USER regulettee

# Environment
ENV NODE_ENV=production
ENV PORT=3000

EXPOSE 3000

HEALTHCHECK --interval=30s --timeout=5s --start-period=15s --retries=3 \
  CMD node -e "const http = require('http'); http.get('http://localhost:3000/health', (r) => { process.exit(r.statusCode === 200 ? 0 : 1); }).on('error', () => process.exit(1));"

CMD ["node", "--import", "tsx", "server.ts"]
