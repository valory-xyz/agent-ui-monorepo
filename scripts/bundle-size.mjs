#!/usr/bin/env node
/**
 * Walk each built app under dist/apps/<app>/ and emit a JSON report with
 * total bytes plus per-extension breakdown. Used by the bundle-size
 * workflow to detect sudden bundle growth as a malware canary (large
 * bundle jumps frequently accompany a malicious dep entering the tree).
 *
 * Usage:
 *   node scripts/bundle-size.mjs [output-path]
 *
 * Output shape (default: stdout, also written to output-path if given):
 *   {
 *     "<app>": {
 *       "total": <bytes>,
 *       "by_ext": { "js": <bytes>, "css": <bytes>, "html": <bytes>, ... }
 *     },
 *     ...
 *   }
 *
 * No external deps — only node:fs / node:path.
 */

import { readdirSync, statSync, writeFileSync, existsSync } from 'node:fs';
import { join, resolve, extname } from 'node:path';

const ROOT = resolve('.');
const DIST = resolve(ROOT, 'dist/apps');
const APPS = ['agentsfun-ui', 'babydegen-ui', 'predict-ui'];

function* walkFiles(dir) {
  let entries;
  try {
    entries = readdirSync(dir, { withFileTypes: true });
  } catch {
    return;
  }
  for (const entry of entries) {
    const full = join(dir, entry.name);
    if (entry.isDirectory()) {
      yield* walkFiles(full);
    } else if (entry.isFile()) {
      yield full;
    }
  }
}

function measureApp(appName) {
  const appDir = join(DIST, appName);
  if (!existsSync(appDir)) {
    console.error(`::error::dist/apps/${appName} not found — run \`yarn nx build ${appName}\` first`);
    return null;
  }
  let total = 0;
  const byExt = {};
  for (const path of walkFiles(appDir)) {
    const size = statSync(path).size;
    total += size;
    // Strip the leading dot; group .map files separately so the source
    // bundle delta isn't masked by sourcemap-only changes.
    const ext = extname(path).slice(1) || 'noext';
    byExt[ext] = (byExt[ext] || 0) + size;
  }
  return { total, by_ext: byExt };
}

const report = {};
for (const app of APPS) {
  const measurement = measureApp(app);
  if (measurement === null) process.exit(2);
  report[app] = measurement;
}

const json = JSON.stringify(report, null, 2);
console.log(json);

const outPath = process.argv[2];
if (outPath) {
  writeFileSync(resolve(outPath), json + '\n');
  console.error(`Wrote ${outPath}`);
}
