/**
 * Unit tests for the pure SPDX evaluation in license-check.mjs. The evaluator
 * is the bug-prone part of the gate, so it is tested independently of the
 * scanner. Run: `yarn license-check:test` (Node's built-in test runner — no
 * added dependency).
 */

import assert from 'node:assert/strict';
import { test } from 'node:test';

import {
  evaluateExpression,
  isExpressionAllowed,
  makeLeafChecker,
  normalizeLicense,
  splitPackageKey,
} from './license-check.mjs';

// Mirror of .supply-chain/license-allowlist.json (the subset the fixtures need).
const ALLOWED = new Set(
  ['MIT', 'ISC', 'Apache-2.0', 'BSD-2-Clause', 'BSD-3-Clause', '0BSD', 'MPL-2.0', 'BlueOak-1.0.0', 'CC0-1.0', 'CC-BY-3.0', 'CC-BY-4.0', 'OFL-1.1', 'Python-2.0', 'WTFPL'].map((s) => s.toLowerCase()),
);
const UNAUTHORIZED = new Set(['GPL-2.0', 'GPL-3.0', 'GPL-3.0-or-later', 'LGPL-3.0', 'AGPL-3.0', 'MPL-1.1'].map((s) => s.toLowerCase()));
const leaf = makeLeafChecker(ALLOWED, UNAUTHORIZED);
const allowed = (expr) => isExpressionAllowed(expr, leaf);

test('normalizeLicense strips guess marker, lowercases, trims', () => {
  assert.equal(normalizeLicense('MIT*'), 'mit');
  assert.equal(normalizeLicense('  Apache-2.0 '), 'apache-2.0');
  assert.equal(normalizeLicense('CC-BY-4.0**'), 'cc-by-4.0');
});

test('every distinct license string actually present in the tree is allowed', () => {
  // Captured from license-checker-rseidelsohn against the installed tree.
  const present = [
    '(Apache-2.0 OR MPL-1.1)',
    '(MIT AND CC-BY-3.0)',
    '(MIT OR Apache-2.0)',
    '(MIT OR CC0-1.0)',
    '(WTFPL OR MIT)',
    '0BSD',
    'Apache-2.0',
    'Apache-2.0 AND MIT',
    'BSD-2-Clause',
    'BSD-3-Clause',
    'BlueOak-1.0.0',
    'CC-BY-3.0',
    'CC-BY-4.0',
    'CC0-1.0',
    'ISC',
    'MIT',
    'MIT AND ISC',
    'MIT*',
    'MPL-2.0',
    'OFL-1.1',
    'Python-2.0',
  ];
  for (const lic of present) assert.equal(allowed(lic), true, `expected allowed: ${lic}`);
});

test('OR passes when any disjunct is allowed, even if the other is unauthorized', () => {
  assert.equal(allowed('(Apache-2.0 OR MPL-1.1)'), true); // harmony-reflect
  assert.equal(allowed('MPL-1.1 OR MIT'), true);
  assert.equal(allowed('GPL-3.0 OR MIT'), true);
});

test('AND fails unless every conjunct is allowed', () => {
  assert.equal(allowed('MIT AND ISC'), true);
  assert.equal(allowed('MIT AND CC-BY-3.0'), true);
  assert.equal(allowed('MIT AND GPL-3.0'), false);
  assert.equal(allowed('(MIT AND GPL-3.0)'), false);
});

test('AND binds tighter than OR', () => {
  // MIT OR (GPL-3.0 AND GPL-2.0)  =>  true via the MIT disjunct
  assert.equal(allowed('MIT OR GPL-3.0 AND GPL-2.0'), true);
  // (GPL-3.0 AND MIT) OR GPL-2.0  =>  false (both branches fail)
  assert.equal(allowed('GPL-3.0 AND MIT OR GPL-2.0'), false);
});

test('bare disallowed and unauthorized ids fail', () => {
  assert.equal(allowed('GPL-3.0'), false);
  assert.equal(allowed('AGPL-3.0'), false);
  assert.equal(allowed('MPL-1.1'), false);
  assert.equal(allowed('SEE LICENSE IN LICENSE'), false);
});

test('unauthorized precedence: an id in both sets is still denied', () => {
  const both = makeLeafChecker(new Set(['gpl-3.0', 'mit']), new Set(['gpl-3.0']));
  assert.equal(isExpressionAllowed('GPL-3.0', both), false);
  assert.equal(isExpressionAllowed('GPL-3.0 OR MIT', both), true);
});

test('fail-closed on UNKNOWN, WITH exceptions, and malformed expressions', () => {
  assert.equal(allowed('UNKNOWN'), false);
  assert.equal(allowed('Apache-2.0 WITH LLVM-exception'), false);
  assert.equal(allowed('(MIT OR'), false);
  assert.equal(allowed('MIT)'), false);
  assert.equal(allowed('()'), false);
  assert.equal(allowed(''), false);
  assert.equal(allowed('MIT ISC'), false); // missing operator
});

test('evaluateExpression throws (not returns) on malformed input', () => {
  assert.throws(() => evaluateExpression('(MIT', leaf));
  assert.throws(() => evaluateExpression('MIT AND', leaf));
});

test('splitPackageKey handles scoped and unscoped names', () => {
  assert.deepEqual(splitPackageKey('react@19.2.1'), { name: 'react', version: '19.2.1' });
  assert.deepEqual(splitPackageKey('@fontsource/inter@5.2.8'), { name: '@fontsource/inter', version: '5.2.8' });
  assert.deepEqual(splitPackageKey('noversion'), { name: 'noversion', version: '' });
});
