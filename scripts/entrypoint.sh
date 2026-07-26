#!/usr/bin/env sh

set -e

# Set variables accessible by the frontend
mkdir -p /app/frontend/public

# Build runtime-config.js containing only env vars that are defined and non-empty.
node - <<'NODE'
const fs = require('fs');
const outPath = '/app/frontend/public/runtime-config.json';
const keys = ['WIFI_SSID','WIFI_PASSWORD','WIFI_TYPE','WIFI_HIDDEN','PRINT_CONFIG'];

function parseValue(value) {
  if (!value) {
    return value;
  }

  const trimmed = value.trim();

  // Only attempt JSON parsing for object/array-looking values
  if (trimmed.startsWith('{') || trimmed.startsWith('[')) {
    try {
      return JSON.parse(trimmed);
    } catch {
      // Not valid JSON, keep original string
    }
  }

  return value;
}

const cfg = {};
for (const k of keys) {
  const v = process.env[k];
  if (v !== undefined) {
    cfg[k] = parseValue(v);
  }
}

fs.writeFileSync(
  outPath,
  JSON.stringify(cfg, null, 2),
  'utf8'
);

console.log('WROTE', outPath, 'keys=', Object.keys(cfg));
NODE

# exec the original command
exec "$@"
