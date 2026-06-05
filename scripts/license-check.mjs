#!/usr/bin/env node
/**
 * License allowlist gate — fail-closed parity with the backend `liccheck`
 * PARANOID posture. Every installed dependency's SPDX license expression must
 * resolve against the allowlist in .supply-chain/license-allowlist.json, or the
 * gate prints the violator and exits non-zero.
 *
 * Mirrors scripts/audit.mjs in shape: load a checked-in allowlist, run the
 * scanner, classify, print, exit 0/1. Uses license-checker-rseidelsohn's
 * programmatic `init` (a maintained license-checker fork that reads real
 * LICENSE files, reducing spurious UNKNOWNs) rather than spawning the CLI and
 * parsing stdout — fewer failure modes.
 *
 * Fail-closed: any license expression we cannot confidently resolve to the
 * allowlist (an `UNKNOWN`, an unrecognized identifier, a `WITH` exception, or an
 * otherwise unparseable string) counts as a violation. Resolve it with a
 * documented `licenseOverrides` entry — never by silencing.
 *
 * Dev-only: this script and its `license-checker-rseidelsohn` dependency are
 * never bundled into any app and cannot affect runtime behaviour.
 *
 * See SUPPLY-CHAIN-SECURITY.md §9.
 */

import { existsSync, readFileSync } from 'node:fs';
import { createRequire } from 'node:module';
import { resolve } from 'node:path';
import { pathToFileURL } from 'node:url';

const ROOT = resolve('.');
const ALLOWLIST_PATH = resolve(ROOT, '.supply-chain/license-allowlist.json');
const DATE_RE = /^\d{4}-\d{2}-\d{2}$/;

// ---------------------------------------------------------------------------
// SPDX expression evaluation (pure — unit-tested in license-check.test.mjs)
// ---------------------------------------------------------------------------

/**
 * license-checker appends `*` when it *guessed* the license from a LICENSE
 * file rather than reading a declared `license` field (e.g. `MIT*`). The guess
 * vs. declared distinction doesn't change which license it is, so strip it for
 * matching. Comparison is case-insensitive (SPDX ids are case-insensitive).
 */
export function normalizeLicense(id) {
  return id.replace(/\*+$/, '').trim().toLowerCase();
}

/**
 * Split an SPDX expression into '(' , ')', 'AND', 'OR', or license-id tokens.
 * Operators are matched uppercase-exact below (per the SPDX grammar); anything
 * that isn't a recognized operator/paren is a leaf license id. A `WITH`
 * exception therefore tokenizes into a stray leaf and fails to parse —
 * fail-closed by design.
 */
function tokenize(expr) {
  return expr
    .replace(/\(/g, ' ( ')
    .replace(/\)/g, ' ) ')
    .trim()
    .split(/\s+/)
    .filter(Boolean);
}

/**
 * Recursive-descent evaluator for the subset of SPDX expressions that occur in
 * npm `license` fields: parentheses, AND (binds tighter), OR. `isAllowedLeaf`
 * decides a single normalized license id. Returns whether the whole expression
 * is satisfied. Throws on any malformed or unexpected structure so the caller
 * can treat it as a violation (fail-closed).
 *
 *   orExpr  := andExpr ('OR'  andExpr)*
 *   andExpr := unary   ('AND' unary)*
 *   unary   := '(' orExpr ')' | LICENSE
 */
export function evaluateExpression(expr, isAllowedLeaf) {
  const tokens = tokenize(expr);
  let pos = 0;
  const peek = () => tokens[pos];
  const next = () => tokens[pos++];

  function parseUnary() {
    const t = peek();
    if (t === undefined) throw new Error('unexpected end of expression');
    if (t === '(') {
      next(); // consume '('
      const v = parseOr();
      if (next() !== ')') throw new Error('missing closing paren');
      return v;
    }
    if (t === 'AND' || t === 'OR' || t === ')') {
      throw new Error(`unexpected token '${t}'`);
    }
    next();
    return isAllowedLeaf(normalizeLicense(t));
  }
  function parseAnd() {
    let v = parseUnary();
    // Left operand always evaluated first, so each unary is consumed regardless
    // of the running result — no short-circuit skipping of tokens.
    while (peek() === 'AND') {
      next();
      const r = parseUnary();
      v = v && r;
    }
    return v;
  }
  function parseOr() {
    let v = parseAnd();
    while (peek() === 'OR') {
      next();
      const r = parseAnd();
      v = v || r;
    }
    return v;
  }

  const result = parseOr();
  if (pos !== tokens.length) throw new Error(`trailing token '${tokens[pos]}'`);
  return result;
}

/**
 * Build the leaf decider from the allow/deny sets. An explicit `unauthorized`
 * entry wins over `allowed`, so a copyleft id can never pass even if someone
 * mistakenly also lists it in `allowedSpdx`.
 */
export function makeLeafChecker(allowedSet, unauthorizedSet) {
  return (id) => {
    if (!id) return false;
    if (unauthorizedSet.has(id)) return false;
    return allowedSet.has(id);
  };
}

/** Convenience: true iff `expr` is satisfied and parses cleanly. */
export function isExpressionAllowed(expr, isAllowedLeaf) {
  try {
    return evaluateExpression(expr, isAllowedLeaf);
  } catch {
    return false; // fail-closed
  }
}

// ---------------------------------------------------------------------------
// Allowlist loading / validation (mirrors scripts/audit.mjs discipline)
// ---------------------------------------------------------------------------

function fail(msg) {
  console.error(`::error::${msg}`);
  process.exit(2);
}

export function loadAllowlist(path = ALLOWLIST_PATH) {
  if (!existsSync(path)) fail(`license allowlist not found at ${path}`);
  let data;
  try {
    data = JSON.parse(readFileSync(path, 'utf8'));
  } catch (err) {
    fail(`failed to parse ${path}: ${err.message}`);
  }
  for (const key of ['allowedSpdx', 'unauthorizedSpdx', 'licenseOverrides', 'exemptions']) {
    if (!Array.isArray(data[key])) fail(`\`${key}\` must be an array in ${path}`);
  }
  // Overrides and exemptions carry the same reason+review discipline as the
  // audit allowlist. Empty today; validated so a future entry can't skip it.
  for (const o of data.licenseOverrides) {
    const errs = [];
    if (typeof o.package !== 'string' || !o.package.trim()) errs.push('`package` is required');
    if (typeof o.license !== 'string' || !o.license.trim()) errs.push('`license` is required');
    if (typeof o.reason !== 'string' || !o.reason.trim()) errs.push('`reason` is required');
    if (!DATE_RE.test(o.added || '')) errs.push('`added` must be YYYY-MM-DD');
    if (!DATE_RE.test(o.review || '')) errs.push('`review` must be YYYY-MM-DD');
    if (errs.length) fail(`malformed licenseOverrides entry: ${errs.join('; ')} — ${JSON.stringify(o)}`);
  }
  for (const e of data.exemptions) {
    const errs = [];
    if (typeof e.package !== 'string' || !e.package.trim()) errs.push('`package` is required');
    if (typeof e.reason !== 'string' || !e.reason.trim()) errs.push('`reason` is required');
    if (!DATE_RE.test(e.added || '')) errs.push('`added` must be YYYY-MM-DD');
    if (!DATE_RE.test(e.review || '')) errs.push('`review` must be YYYY-MM-DD');
    if (errs.length) fail(`malformed exemptions entry: ${errs.join('; ')} — ${JSON.stringify(e)}`);
  }
  return data;
}

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

/** Split a license-checker `name@version` key into {name, version}. */
export function splitPackageKey(key) {
  const at = key.lastIndexOf('@');
  if (at <= 0) return { name: key, version: '' };
  return { name: key.slice(0, at), version: key.slice(at + 1) };
}

function runChecker() {
  // Lazy require so importing this module (e.g. from the unit test) does not
  // pull in the scanner. Named ESM import also works, but keeping it lazy makes
  // the pure SPDX functions testable without the dependency present.
  const require = createRequire(import.meta.url);
  const { init } = require('license-checker-rseidelsohn');
  return new Promise((resolvePromise, reject) => {
    // `excludePrivatePackages` drops any scanned package marked `private`
    // (e.g. this monorepo's own root manifest if it were private). The Nx libs
    // under libs/* are not npm-installed into node_modules, so they are not
    // scanned here regardless — this flag is cheap insurance, not the mechanism
    // that excludes them.
    init({ start: ROOT, excludePrivatePackages: true }, (err, packages) => {
      if (err) reject(err);
      else resolvePromise(packages);
    });
  });
}

// ---------------------------------------------------------------------------
// Main
// ---------------------------------------------------------------------------

async function main() {
  const allowlist = loadAllowlist();
  const allowedSet = new Set(allowlist.allowedSpdx.map((s) => s.toLowerCase()));
  const unauthorizedSet = new Set(allowlist.unauthorizedSpdx.map((s) => s.toLowerCase()));
  const isAllowedLeaf = makeLeafChecker(allowedSet, unauthorizedSet);

  // Index overrides by exact name and by name@version; exemptions by exact name.
  const overrideByName = new Map();
  const overrideByKey = new Map();
  for (const o of allowlist.licenseOverrides) {
    if (o.version) overrideByKey.set(`${o.package}@${o.version}`, o);
    else overrideByName.set(o.package, o);
  }
  const exemptByName = new Map(allowlist.exemptions.map((e) => [e.package, e]));

  let packages;
  try {
    packages = await runChecker();
  } catch (err) {
    fail(`license-checker failed: ${err.message}`);
  }

  const today = new Date().toISOString().slice(0, 10);
  const violations = [];
  const overridesUsed = new Set();
  const exemptionsUsed = new Set();

  for (const key of Object.keys(packages)) {
    const { name } = splitPackageKey(key);

    if (exemptByName.has(name)) {
      exemptionsUsed.add(name);
      continue;
    }

    const override = overrideByKey.get(key) || overrideByName.get(name);
    const declared = packages[key].licenses;
    const licenseStr = override ? override.license : Array.isArray(declared) ? declared.join(' AND ') : String(declared ?? 'UNKNOWN');
    if (override) overridesUsed.add(override.version ? `${override.package}@${override.version}` : override.package);

    if (!isExpressionAllowed(licenseStr, isAllowedLeaf)) {
      violations.push({ key, license: licenseStr, overridden: Boolean(override) });
    }
  }

  // --- report applied overrides / exemptions, with expiry + drift warnings ---
  if (overridesUsed.size || exemptionsUsed.size) {
    console.log(`Applied ${overridesUsed.size} override(s), ${exemptionsUsed.size} exemption(s).`);
  }
  for (const o of allowlist.licenseOverrides) {
    const id = o.version ? `${o.package}@${o.version}` : o.package;
    if (!overridesUsed.has(id)) {
      console.log(`::warning::licenseOverrides entry ${id} did not match any scanned package — remove it (drift).`);
    } else if (o.review < today) {
      console.log(`::warning::licenseOverrides entry ${id} expired on ${o.review}. Re-confirm the license and refresh the review date.`);
    }
  }
  for (const e of allowlist.exemptions) {
    if (!exemptionsUsed.has(e.package)) {
      console.log(`::warning::exemptions entry ${e.package} did not match any scanned package — remove it (drift).`);
    } else if (e.review < today) {
      console.log(`::warning::exemptions entry ${e.package} expired on ${e.review}. Re-evaluate whether it is still needed.`);
    }
  }

  const scanned = Object.keys(packages).length;

  if (violations.length) {
    console.error('');
    console.error(`::error::${violations.length} dependency/dependencies have a disallowed or unresolved license:`);
    for (const v of violations.sort((a, b) => a.key.localeCompare(b.key))) {
      console.error(`  ${v.key} — ${v.license}${v.overridden ? ' (after override)' : ''}`);
    }
    console.error('');
    console.error('Each must be resolved (PARANOID parity — do not silence):');
    console.error('  - permissive but missing from the allowlist → add the SPDX id to allowedSpdx (reconcile with backend liccheck);');
    console.error('  - UNKNOWN / mis-detected → add a licenseOverrides entry (package, license, reason, added, review);');
    console.error('  - genuinely copyleft/proprietary → replace the dependency, or add a documented exemptions entry.');
    console.error('  See .supply-chain/license-allowlist.json and SUPPLY-CHAIN-SECURITY.md §9.');
    process.exit(1);
  }

  console.log(`license-check: OK (${scanned} packages scanned, 0 violations).`);
  process.exit(0);
}

// Run only when invoked directly, so the unit test can import the pure helpers
// without triggering a scan.
if (import.meta.url === pathToFileURL(process.argv[1] ?? '').href) {
  main();
}
