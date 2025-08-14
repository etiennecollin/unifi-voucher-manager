#!/usr/bin/env sh

set -e

# Set variables accessible by the frontend
mkdir -p /app/frontend/public

# Build runtime-config.js containing only env vars that are defined and non-empty.
node - <<'NODE'
const fs = require('fs');
const outPath = '/app/frontend/public/runtime-config.js';
const keys = ['WIFI_SSID','WIFI_PASSWORD','WIFI_TYPE','WIFI_HIDDEN'];
const cfg = {};
for (const k of keys) {
  const v = process.env[k];
  if (v !== undefined) {
    cfg[k] = v;
  }
}
fs.writeFileSync(outPath, 'window.__RUNTIME_CONFIG__ = ' + JSON.stringify(cfg) + ';', 'utf8');
console.log('WROTE', outPath, 'keys=', Object.keys(cfg));
NODE

# exec the original command
exec "$@"
