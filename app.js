// app.js - cPanel Phusion Passenger Startup Entry Point
// This wrapper loads the compiled esbuild server bundle (dist/server.cjs)

process.env.NODE_ENV = process.env.NODE_ENV || 'production';
process.env.PORT = process.env.PORT || '3000';

try {
  require('./dist/server.cjs');
} catch (err) {
  console.error('[cPanel Startup Error] Failed to load dist/server.cjs:', err);
  process.exit(1);
}
