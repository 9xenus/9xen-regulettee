import tailwindcss from '@tailwindcss/vite';
import react from '@vitejs/plugin-react';
import path from 'path';
import {defineConfig} from 'vite';

export default defineConfig(() => {
  return {
    plugins: [react(), tailwindcss()],
    resolve: {
      dedupe: ['react', 'react-dom', 'react/jsx-runtime', 'react/jsx-dev-runtime'],
      alias: {
        'react': path.resolve(__dirname, './node_modules/react'),
        'react-dom': path.resolve(__dirname, './node_modules/react-dom'),
        'react/jsx-runtime': path.resolve(__dirname, './node_modules/react/jsx-runtime'),
        'react/jsx-dev-runtime': path.resolve(__dirname, './node_modules/react/jsx-dev-runtime'),
        '@': path.resolve(__dirname, '.'),
        'util$': path.resolve(__dirname, './src/utils/promisifyPolyfill.ts'),
        'util/types': path.resolve(__dirname, './src/utils/promisifyPolyfill.ts'),
        'node:util$': path.resolve(__dirname, './src/utils/promisifyPolyfill.ts'),
        'node:util/types': path.resolve(__dirname, './src/utils/promisifyPolyfill.ts'),
        'path': path.resolve(__dirname, './src/utils/pathPolyfill.ts'),
        'node:path': path.resolve(__dirname, './src/utils/pathPolyfill.ts'),
        'path/posix': path.resolve(__dirname, './src/utils/pathPolyfill.ts'),
        'node:path/posix': path.resolve(__dirname, './src/utils/pathPolyfill.ts'),
        'crypto': path.resolve(__dirname, './src/utils/cryptoPolyfill.ts'),
        'node:crypto': path.resolve(__dirname, './src/utils/cryptoPolyfill.ts'),
        'fs': path.resolve(__dirname, './src/utils/fsPolyfill.ts'),
        'node:fs': path.resolve(__dirname, './src/utils/fsPolyfill.ts'),
        'express': path.resolve(__dirname, './src/utils/expressPolyfill.ts'),
        'better-sqlite3': path.resolve(__dirname, './src/utils/betterSqlite3Polyfill.ts'),
      },
    },
    optimizeDeps: {
      include: [
        'react',
        'react-dom',
        'react/jsx-runtime',
        'react/jsx-dev-runtime',
        'recharts',
        'lucide-react',
        'motion',
        'motion/react',
        'd3',
        'jspdf',
        'jspdf-autotable',
        'react-markdown',
        '@stripe/stripe-js',
        'clsx',
        'tailwind-merge',
        'uuid',
        'qrcode',
        'jsqr',
        'sql.js',
        'react-joyride',
        'topojson-client',
        'zod',
        'ajv',
        'json-rules-engine'
      ],
      exclude: ['pg', 'better-sqlite3', 'bullmq', 'ioredis', 'nodemailer', 'winston', 'stripe', 'twilio', 'neo4j-driver', 'kuzu', 'duckdb', '@lancedb/lancedb', 'chromadb'],
    },
    build: {
      target: 'esnext',
      rollupOptions: {
        external: ['pg', 'better-sqlite3', 'bullmq', 'ioredis', 'nodemailer', 'winston', 'stripe', 'twilio', 'kuzu', 'duckdb', '@lancedb/lancedb', 'chromadb'],
        output: {
          manualChunks(id) {
            if (id.includes('node_modules/recharts') || id.includes('node_modules/d3-') || id.includes('node_modules/react') || id.includes('node_modules/react-dom') || id.includes('node_modules/scheduler')) {
              return 'vendor-core';
            }
            if (id.includes('node_modules/lucide-react')) {
              return 'vendor-icons';
            }
            if (id.includes('node_modules/motion') || id.includes('node_modules/framer-motion')) {
              return 'vendor-animation';
            }
          },
        },
      },
    },
    server: {
      // HMR is disabled in AI Studio via DISABLE_HMR env var.
      // Do not modifyâfile watching is disabled to prevent flickering during agent edits.
      hmr: process.env.DISABLE_HMR !== 'true',
      // Disable file watching when DISABLE_HMR is true to save CPU during agent edits.
      watch: process.env.DISABLE_HMR === 'true' ? null : {},
    },
  };
});
