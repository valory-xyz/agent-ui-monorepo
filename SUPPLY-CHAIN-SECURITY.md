# Supply Chain Security

This document describes how `agent-ui-monorepo` protects itself against npm supply-chain attacks — the scenario where a dependency (direct or transitive) is compromised and a malicious version is published.

It complements [`SECURITY.md`](./SECURITY.md), which covers reporting vulnerabilities in our own code, and mirrors the policy applied across the Valory frontend stack ([`agents-fun`](https://github.com/valory-xyz/agents-fun), [`townhall-kpis`](https://github.com/valory-xyz/townhall-kpis), [`olas-website`](https://github.com/valory-xyz/olas-website), [`pearl-website`](https://github.com/valory-xyz/pearl-website), [`autonolas-frontend-mono`](https://github.com/valory-xyz/autonolas-frontend-mono)).

**The deliverable for this repo is a build artifact — a ZIP file attached to a GitHub Release, downloaded and served by a downstream agent container.** Runtime CSP, security headers, and runtime secret handling are the deployer's concern. This document covers the build-time provenance story: what enters the dependency graph, how it's audited, and what to do when something goes wrong.

## Threat model

The attacks we care about:

1. **Malicious publish** — a maintainer account is compromised (or a maintainer goes rogue) and a bad version of a legitimate package is published. Recent examples: `ua-parser-js` (2021), `node-ipc` protestware (2022), the `tj-actions/changed-files` token-exfil incident (2025), the `shai-hulud` npm worm (2025).
2. **Typosquatting / dependency confusion** — a look-alike name is installed instead of the intended package.
3. **Postinstall script abuse** — a compromised package runs arbitrary code during `yarn install`, exfiltrating env vars or tokens from the build environment. For this repo the blast radius is the CI runner's `GITHUB_TOKEN` and any developer's machine running `yarn install`, not production runtime credentials (the apps have no runtime secrets of their own — they fetch from `127.0.0.1:8716` on the host they're deployed to).
4. **Transitive compromise** — a deep, rarely-audited dependency is the attack vector. The React 19 + Ant Design + viem + Nx 21 transitive tree is large.

## Policies

### 1. Exact version pinning in `package.json`

All direct dependencies in [`package.json`](./package.json) are pinned to **exact versions** — no `^`, no `>=`, no floating major. Tildes (`~`) remain on a handful of `@swc/*` entries pending a follow-up phase. Enforced locally by `save-exact=true` in [`.npmrc`](./.npmrc).

**Why:** `^` allows minor and patch updates. If a compromised patch is published and someone runs `yarn add <other-pkg>` or a fresh `yarn install` against a stale lockfile, the bad version can enter the tree silently. Exact pins make every version change an explicit, reviewable `package.json` diff.

**How to update a dependency:** bump the exact version in `package.json`, run `yarn install`, review the `yarn.lock` diff, and commit both files in the same PR. Never run `yarn upgrade` without re-pinning the result.

If you need to override a transitive dep (e.g. to clear a CVE before the direct dep ships a fix), use a Yarn `resolutions` entry with an **exact** version, not a range. Reference the advisory ID in the PR description.

### 2. Single lockfile, treated as source of truth

[`yarn.lock`](./yarn.lock) is the canonical lockfile. The `packageManager` field in [`package.json`](./package.json) pins Yarn `1.22.22`; every CI workflow activates that version explicitly via `corepack enable` + `corepack prepare yarn@1.22.22 --activate` with a trailing assertion that fails the job if activation didn't stick. **Without corepack activation the `packageManager` pin is silently ignored** — CI would fall back to whichever yarn the runner image ships with.

`package-lock.json` and `pnpm-lock.yaml` are not present and must not be added — a stray `npm install` or `pnpm install` that lands a second lockfile would conflict with `yarn.lock`. CI installs with `yarn install --frozen-lockfile`, which fails if `package.json` and `yarn.lock` disagree, catching any silent resolution drift at build time.

### 3. Lockfile review in PRs

Any PR that touches `yarn.lock` requires a reviewer to confirm:

- The diff is proportionate to the `package.json` change. A one-line `package.json` change that produces a 5,000-line lockfile diff is a red flag.
- No unexpected packages appear. Look for unfamiliar names, typos of known packages, or recently-published versions on high-traffic names.
- Resolved URLs point to the official registry (`registry.yarnpkg.com` / `registry.npmjs.org`), not a fork or mirror. Automated by the `lockfile-lint` step in [`supply-chain.yml`](./.github/workflows/supply-chain.yml) — see [§5](#5-audit-in-ci).

Dependabot **version-update PRs are intentionally disabled** (no `.github/dependabot.yml`). Dependency bumps happen on demand via manual PRs, with the same review checklist. Dependabot **security alerts** (advisories against `yarn.lock`) remain enabled at the repo level — see **Security tab → Dependabot alerts** for the canonical list. This policy must not be re-toggled in Settings without an explicit team decision; the policy violation it introduces is auto-PRs that bypass the review checklist above.

### 4. Cooldown window on updates

Prefer dependency versions that are **at least 7 days old**. Most malicious publishes are caught and unpublished within hours to days.

Reviewer responsibility: when a PR bumps to a version less than 7 days old, defer the merge unless the bump is for a disclosed security advisory. Verify the publish date with `npm view <pkg> time` or the npm page.

Vulnerability discovery does not depend on the 7-day rule. Already-disclosed CVEs are caught by the `audit` job in [`supply-chain.yml`](./.github/workflows/supply-chain.yml) on every PR (see [§5](#5-audit-in-ci)). GitHub also sends passive Dependabot alerts (Security tab / email) for advisories affecting our lockfile regardless of any repo configuration.

### 5. Audit in CI

Five jobs gate every PR:

- **`Check Pull Request / lint`** ([`check-pull-request.yml`](./.github/workflows/check-pull-request.yml)) — `yarn install --frozen-lockfile`, `nx run-many --target=lint --all`, `nx run-many --target=test --all`. The existing lint/test backbone.

- **`Supply Chain / audit` — production tree, blocking on high/critical** — delegates to [`scripts/audit.mjs`](./scripts/audit.mjs), which runs `yarn audit --groups dependencies --json` and gates on its own logic instead of Yarn 1.x's bitmask exit code. `--groups dependencies` restricts to the production tree — `devDependencies` (ESLint / Prettier / TypeScript / types / Nx tooling) generate substantial transitive-advisory noise and do not ship to users. An unlisted high/critical advisory against a production dependency blocks merge; the PR author must either (a) bump the dep, (b) add an exact-pinned Yarn `resolutions` entry per [§1](#1-exact-version-pinning-in-packagejson) with the advisory ID in the PR description, or (c) add the advisory to [`.supply-chain/audit-allowlist.json`](./.supply-chain/audit-allowlist.json) with a reason and review date. Allowlist entries whose `review` date has passed generate a `::warning::` in CI output but do not fail the job — the warning is how the team is kept honest about re-evaluating suppressions. **The audit job runs without `yarn install`** — `yarn audit` queries the npm advisory database against `yarn.lock` directly, so node_modules is unnecessary; skipping install means a compromised postinstall cannot run inside the gate that exists to detect compromised postinstalls.

- **`Supply Chain / install-hooks`** — runs [`scripts/audit-install-hooks.mjs`](./scripts/audit-install-hooks.mjs) to enumerate every package in `node_modules` with a non-trivial `preinstall` / `install` / `postinstall` script and diff that set against [`.supply-chain/install-hooks.allowlist`](./.supply-chain/install-hooks.allowlist). Two failure modes: (1) a new name in the tree not in the allowlist, (2) a stale allowlist entry not in the tree. Install runs with `--ignore-scripts` so the audit fires before any hook executes on the runner. This turns the "a new package with a postinstall just entered my dep graph" scenario into an explicit allowlist diff that a reviewer has to sign off on, rather than a silent change buried in `yarn.lock`. Run `yarn audit:install-hooks:update` locally after any dependency change and commit the regenerated allowlist with the `package.json` / `yarn.lock` diff.

- **`Supply Chain / lockfile-lint`** — `npx lockfile-lint` validates every `resolved` URL in `yarn.lock`: HTTPS-only, allowed registry hosts (`registry.yarnpkg.com`, `registry.npmjs.org`). Catches the dependency-confusion class where a malicious lockfile edit redirects `resolved` to an attacker-controlled host.

- **`Gitleaks / scan`** ([`gitleaks.yml`](./.github/workflows/gitleaks.yml)) — full-history secret scan against [`.gitleaks.toml`](./.gitleaks.toml). The CLI is downloaded directly from the official GitHub release; version + SHA256 are pinned in the workflow, and the download is `sha256sum -c`-verified before extraction. Currently pinned at `8.30.1`.

A sixth job, **`Supply chain checks passed`** (the Supply Chain workflow's aggregator), depends on `audit` + `install-hooks` + `lockfile-lint` via `needs:` + `if: always()`. Branch protection (Phase 3 of the supply-chain plan) should require this context plus `All checks passed` (the Check Pull Request workflow's own aggregator over lint + test) plus `Run Gitleaks` — cross-workflow `needs:` is not supported, so the three workflows are separate required-check contexts. The two aggregator job names are deliberately distinct so each context resolves to exactly one job.

**Why a wrapper and not stock `yarn audit`.** Yarn 1.x `yarn audit` exits with a severity bitmask (`1`=info, `2`=low, `4`=moderate, `8`=high, `16`=critical) rather than a threshold comparison — `--level high` filters the *printed* output but does not affect the exit code. On top of that, there is no native way to suppress a specific advisory that cannot be fixed. [`scripts/audit.mjs`](./scripts/audit.mjs) handles both: it parses the JSON output, applies the high/critical gate explicitly, and consults the allowlist. Revisit on a future Yarn Berry migration.

**Why the script name is `audit:prod` and not `audit`.** Yarn 1.x ships a built-in `yarn audit` subcommand that takes priority over a same-named entry in `package.json` `scripts`, so naming the wrapper `audit` would silently bypass [`scripts/audit.mjs`](./scripts/audit.mjs) and run the stock command instead — skipping the allowlist and the production-tree filter. The `audit:prod` name makes the collision impossible.

### 6. Avoid postinstall-heavy dependencies

When adding a new dependency, check:

- Does it have a `postinstall` / `preinstall` / `install` script? (`yarn why <pkg>` + inspect its `package.json`)
- If yes, is the script necessary, and is the package well-known?
- Prefer alternatives with no install scripts for new additions.

**Known live install-hook surface.** As of this writing, the tree carries four packages with non-trivial install hooks:

| Package | Hook | Why it's there |
| --- | --- | --- |
| [`@swc/core`](https://www.npmjs.com/package/@swc/core) | `postinstall: node postinstall.js` | SWC compiler native bindings (used by Nx tooling). Postinstall validates the platform-specific native module loaded correctly. |
| [`esbuild`](https://www.npmjs.com/package/esbuild) | `postinstall: node install.js` | esbuild's platform-specific native binary install step. Reaches the tree via `vitest > esbuild` and `vite-node > esbuild`. |
| [`nx`](https://www.npmjs.com/package/nx) | `postinstall: node ./bin/post-install` | Nx workspace post-install: writes the Nx daemon socket / cache directory. Reaches the tree via `@nx/workspace`. |
| [`styled-components`](https://www.npmjs.com/package/styled-components) | `postinstall: node ./postinstall.js` | Pure printf banner (Open Collective ask). No real side effects, but the script is non-trivial enough that the regex in `audit-install-hooks.mjs` flags it. |

The full set is enumerated in [`.supply-chain/install-hooks.allowlist`](./.supply-chain/install-hooks.allowlist) and a new entry in the tree fails CI until explicitly added — see the `install-hooks` job in [§5](#5-audit-in-ci).

**Repo-specific watches** (high-value attack targets in our tree):

- [`react-router-dom`](https://www.npmjs.com/package/react-router-dom) — every app pulls it in. The transitive `@remix-run/router` line has historically generated advisories (most recently CVE-2026-22029, currently allowlisted because the affected Framework/Data/RSC modes are not used here). Scrutinize bumps.
- [`viem`](https://www.npmjs.com/package/viem) — EVM RPC client used in `babydegen-ui` for client-side withdrawal-address validation. Wallet/signing libraries are high-value targets; scrutinize bumps even more carefully than the rest of the tree.
- [`styled-components`](https://www.npmjs.com/package/styled-components) — pinned at the old 5.x line. Its `babel-plugin-styled-components` transitive deps (`lodash`, `picomatch`) are the source of two allowlisted highs. A v6 migration is parked work; pinning lowers compromise risk because the version is older and well-vetted, but the transitive tree is harder to patch.
- [`antd`](https://www.npmjs.com/package/antd) — large transitive surface (over 100 packages). Used by every app. Patch bumps tend to be small but should be reviewed for unexpected new transitive deps.
- [`vite`](https://www.npmjs.com/package/vite) + [`@vitejs/plugin-react`](https://www.npmjs.com/package/@vitejs/plugin-react) — build-time plugins execute arbitrary code during `vite build`. A compromised version can rewrite emitted bundles. Build-time exposure is exactly the install-hook attack class, but at a higher level.
- [`@nx/*`](https://www.npmjs.com/package/nx) — monorepo tooling. Pinned at 21.1.3 / 21.2.0. Its `post-install` hook + plugin model means compromise here would run during every `yarn install` and every `nx ...` invocation.

### 7. Secrets hygiene in the build environment

This repo's apps **have no runtime secrets**. Each app boots and fetches from `http://127.0.0.1:8716` (a backend running on the same host as the agent that serves the bundle). There are no API keys, deploy tokens, or wallet credentials baked into the build.

The build environment does see one secret:

| Name | Purpose | Scope | Where read |
| --- | --- | --- | --- |
| `secrets.GITHUB_TOKEN` | Auto-provisioned token used by `softprops/action-gh-release` to create the GitHub Release on tag pushes | CI (release workflows only) | [`.github/workflows/agentsfun-ui-build.yml`](./.github/workflows/agentsfun-ui-build.yml), [`babydegen-ui-build.yml`](./.github/workflows/babydegen-ui-build.yml), [`predict-ui-build.yml`](./.github/workflows/predict-ui-build.yml) |

Permissions are scoped at the job level (`permissions: contents: write` only on the release job; top-level is `contents: read`). The token cannot push commits, create branches, comment on PRs, or modify settings.

Build-time env vars passed via Vite `define`:

| Name | Source | Sensitivity |
| --- | --- | --- |
| `REACT_APP_AGENT_NAME` | Tag suffix (`v*-modius`, `v*-optimus`, `v*-basius`, `v*-omenstrat-trader`, `v*-polystrat-trader`, `v*-agentsfun`) → mapped in release workflow | Public — inlined into the bundle |
| `IS_MOCK_ENABLED` | `.env` (developer-local) | Public — inlined into the bundle |

Neither is a secret. Listed for completeness so an auditor can confirm nothing sensitive leaked into `define`.

**No long-lived secrets in `env:` at the workflow or job level.** A compromised `postinstall` running on the runner could read whatever env vars are exported when it executes. The release workflows export `REACT_APP_AGENT_NAME` *only*; the audit and install-hook jobs export nothing. This is the reason the `audit` job has no `yarn install` step at all (see [§5](#5-audit-in-ci)): if there were any non-public secret in the audit environment, a malicious postinstall could see it.

**`pull_request_target`** is not used by any workflow and must not be used on PRs from forks (it exposes repo secrets to fork-controlled code).

`.npmrc` / `.yarnrc` auth tokens are not committed. [`.gitignore`](./.gitignore) covers `.env`, `.env.local`.

### 8. Dependency review on every new addition

Before adding a new direct dependency:

- Weekly download count on npm — very low numbers on a "popular-sounding" name is a typosquat red flag.
- GitHub repo exists, is active, has reasonable star count and contributor history.
- Maintainer is the expected one (check publish history: `npm view <pkg> time`).
- No recently transferred ownership unless it's a known, announced transfer.
- For wallet / signing / crypto libraries (anything that interacts with `viem`), additionally confirm the audit status on the project's site and check Socket.dev / Snyk advisories.
- Does it have install hooks? If yes, those have to be added to [`install-hooks.allowlist`](./.supply-chain/install-hooks.allowlist) with reviewer sign-off.

### 9. License allowlist gate

Every installed dependency's license must resolve against a checked-in allowlist, mirroring the backend [`valory-xyz/tomte`](https://github.com/valory-xyz/tomte) `liccheck` `[Licenses]` posture: permissive + weak-copyleft authorized; strong copyleft (`GPL`/`AGPL`/`LGPL-3.0`) and `MPL-1.1` unauthorized; **PARANOID** — an unknown or unresolved license **fails**, it is never silently skipped.

- **Script:** [`scripts/license-check.mjs`](./scripts/license-check.mjs) (`yarn license-check`). Uses `license-checker-rseidelsohn` (a maintained `license-checker` fork that reads real `LICENSE` files, reducing spurious `UNKNOWN`s) via its programmatic API, then evaluates each package's SPDX expression against the allowlist. SPDX `OR` passes if any disjunct is allowed; `AND` requires all conjuncts; a trailing `*` (the fork's "guessed from a LICENSE file" marker) is stripped; matching is case-insensitive. The recursive-descent evaluator is unit-tested in [`scripts/license-check.test.mjs`](./scripts/license-check.test.mjs) (`yarn license-check:test`, Node's built-in runner — no added dependency).
- **Fail-closed:** any expression we cannot confidently resolve — an `UNKNOWN`, an unrecognized id, a `WITH` exception, or a malformed string — counts as a violation. An explicit `unauthorizedSpdx` entry also wins over `allowedSpdx`, so a copyleft id can never pass even if mistakenly also listed as allowed.
- **Config:** [`license-allowlist.json`](./.supply-chain/license-allowlist.json), same reason+review discipline as the audit allowlist. `licenseOverrides` correct a mis-detected/`UNKNOWN` package's license; `exemptions` skip a genuinely-disallowed one with justification. Both are **empty today — the tree is 0 violations**, so the gate is a *ratchet*: it locks in the current clean state and trips when a future PR introduces a copyleft/unknown dependency.
- **Resolve a violation** (do not silence): permissive-but-missing → add the SPDX id to `allowedSpdx` (reconcile against the backend `liccheck` list); mis-detected/`UNKNOWN` → add a `licenseOverrides` entry; genuinely copyleft/proprietary → replace the dependency, or add a documented `exemptions` entry.
- **CI:** the `license-check` job in [`supply-chain.yml`](./.github/workflows/supply-chain.yml) installs with `--ignore-scripts` (the gate only reads files) and is wired into the `Supply chain checks passed` aggregator, so it is a required check via the existing branch-protection context — no separate context needed.
- **Dev-only — cannot affect any app.** `license-checker-rseidelsohn` is a `devDependency`, never bundled into a build. The gate changes no `dependencies`/`resolutions`; worst case is a failed CI job.

## Response playbook — "a dependency we use was just disclosed as compromised"

When a malicious npm publish (Shai-Hulud-style worm, `ua-parser-js`-style, etc.) hits a package in our dep tree, follow this. **Time-to-mitigate is the metric** — not thoroughness of investigation. Get the bad version out of the build first, then dig in.

### 1. Identify exposure (≤5 min)

```bash
yarn why <pkg>             # direct or transitive?
yarn list --pattern <pkg>  # which versions are in our lockfile?
```

Record:
- Direct dep or transitive? Which path(s)?
- Version(s) currently in our `yarn.lock`.
- Was the bad version published before or after the `resolved` URL in our lockfile?

If our lockfile predates the bad version → we are not shipping it in any production build, but a fresh `yarn install` on any dev machine could pull it.

### 2. Check the time window (≤5 min)

```bash
npm view <pkg>@<bad-version> time
```

For each environment, when was the last `yarn install` / build?
- **Latest release ZIPs**: check the GitHub Releases page for each app. If any release tag was cut *after* the bad version was published, that artifact may contain compromised code. Yank the release (`gh release delete`) and rebuild.
- **CI**: check Actions runs that ran `yarn install` since the bad version was published.
- **Dev machines**: assume any developer who ran `yarn install` since publish has been exposed.

### 3. Pin to a safe version (≤15 min)

Edit `package.json`:
- For a direct dep: bump to a known-good version (the prior-known-good or the post-fix version).
- For a transitive dep: add a `resolutions` entry with an **exact** version (no `^`, no `>=` — per [§1](#1-exact-version-pinning-in-packagejson)).

```bash
yarn install        # let it update the lockfile
yarn audit:prod     # confirm advisory clears
```

Reference the advisory ID in the commit message:
```
fix(deps): pin <pkg> to <safe-version> to clear GHSA-xxxx-xxxx-xxxx
```

Open and merge the PR with one reviewer (incident exception to the usual review process — document the exception in the PR description).

### 4. Rotate every secret the build environment could have seen (≤30 min)

If the compromised version ran on any CI job since the bad version was published, rotate:
- The auto-provisioned `GITHUB_TOKEN` — actually rotates on every workflow run, but verify no long-lived PATs were attached to the build account.
- Any deploy tokens or org-level secrets attached to the runner (none currently, per [§7](#7-secrets-hygiene-in-the-build-environment) — verify this is still true).

If the compromised version ran on a dev machine, the developer should rotate their personal GitHub PATs and any wallet keys / dev keystores on that machine.

### 5. Rebuild releases (≤15 min)

For each app whose release ZIP was built from a compromised tree:
1. Delete the affected GitHub Release(s) (`gh release delete <tag>`) — including the artifact ZIP.
2. Tag a new patch release once the fix is merged (`git tag v<x.y.z+1>-<app>`).
3. Push the tag; the existing build workflow rebuilds and publishes a fresh ZIP.

Notify downstream consumers (agent containers that bundle the ZIP) that the artifact has been rotated.

### 6. Post-mortem (within 1 week)

Write up:
- **What** package, which version range was bad.
- **How** we detected it (advisory feed / Slack / GitHub alert / customer report — be honest).
- **Time-to-detect** from publish.
- **Time-to-mitigate** from detect.
- **What leaked** if anything (best-effort estimate based on what env vars / files the postinstall could reach).
- **Process gaps** — could our CI gates have caught this earlier? Should we add a control?

Update this document with anything learned. If a new control is warranted, open a follow-up issue/PR within 2 weeks while the incident is fresh.

### Pre-incident: drill this once a year

Pick a real recent advisory. Walk through steps 1–3 as if it had hit your repo. Time it. The metric you care about is "could we have shipped a fix in under 30 minutes." If not, the bottleneck (slow CI, no on-call, no rotation runbook) is itself a finding.

## Dependabot vs. CI scope

GitHub's Dependabot **alerts** scan the entire `yarn.lock` and surface advisories in both `dependencies` and `devDependencies` on the Security tab, while the CI `audit` job intentionally only gates on the production tree (`--groups dependencies`). The Security tab will routinely list dev-tree advisories that are not, by policy, fix-required.

**Dependabot security updates and version updates are disabled.** No `.github/dependabot.yml` exists, and the Settings → Code security toggle for "Dependabot security updates" is OFF. The org-wide policy is **alerts-only**. Re-enabling auto-PRs is a team decision, not a "left off by mistake" — historical context: auto-PRs created review-queue noise faster than they were merged, often duplicating bumps the team had already evaluated.

### Verify the alerts-only state in 5 seconds

A future maintainer (or this one, on a different machine) can confirm the policy is still in place without admin UI access. All four commands need only a `gh` CLI auth with `repo` scope:

```bash
# 1. No .github/dependabot.yml on the remote main (no version-update auto-PRs).
gh api repos/valory-xyz/agent-ui-monorepo/contents/.github/dependabot.yml \
  >/dev/null 2>&1 && echo '⚠️  dependabot.yml exists — review per policy' \
                   || echo '✅ no dependabot.yml on remote'

# 2. No open Dependabot PRs.
test "$(gh pr list --repo valory-xyz/agent-ui-monorepo --author 'app/dependabot' \
                   --state open --json number --jq 'length')" = "0" \
  && echo '✅ no open dependabot PRs' \
  || echo '⚠️  open dependabot PRs found — investigate'

# 3. Dependabot ALERTS are on (this endpoint returns alert data when enabled).
gh api repos/valory-xyz/agent-ui-monorepo/dependabot/alerts --paginate \
   --jq 'length' >/dev/null 2>&1 \
  && echo '✅ dependabot alerts endpoint returns data — alerts on' \
  || echo '⚠️  dependabot alerts endpoint failed — alerts may be off'

# 4. Dependabot SECURITY UPDATES (the auto-PR toggle) are off.
# `status` is a read-only special variable in zsh — use a different name.
http_code="$(gh api -i repos/valory-xyz/agent-ui-monorepo/automated-security-fixes \
             2>&1 | head -1 | awk '{print $2}')"
case "$http_code" in
  204) echo '⚠️  automated-security-fixes ENABLED — toggle off in Settings → Code security' ;;
  404) echo '✅ automated-security-fixes disabled (auto-PR toggle off)' ;;
    *) echo "?  unexpected HTTP $http_code — check Settings → Code security manually" ;;
esac
```

Expected output (current state):
```
✅ no dependabot.yml on remote
✅ no open dependabot PRs
✅ dependabot alerts endpoint returns data — alerts on
✅ automated-security-fixes disabled (auto-PR toggle off)
```

If anything other than ✅ appears on lines 1 or 4, the policy has drifted and a code owner (CODEOWNERS already covers `/.github/` and the policy doc) should be looped in.

## Current gaps / TODO

This file lands as part of Phase 2 of the supply-chain hardening plan. Items here track what's still outstanding.

- [x] Pin all direct dependencies in [`package.json`](./package.json) to exact versions (carets stripped Phase 1.2); lock Node 24 via [`.nvmrc`](./.nvmrc) + `engines`.
- [x] Add a `packageManager` field to [`package.json`](./package.json) pinning `yarn@1.22.22` and activate it via Corepack in every CI workflow that runs yarn.
- [x] Add [`.npmrc`](./.npmrc) with `ignore-scripts=true`, `save-exact=true`, `engine-strict=true`.
- [x] Add [`scripts/audit.mjs`](./scripts/audit.mjs) + [`.supply-chain/audit-allowlist.json`](./.supply-chain/audit-allowlist.json) and the `audit:prod` script. Wire as the supply-chain CI audit job.
- [x] Add [`scripts/audit-install-hooks.mjs`](./scripts/audit-install-hooks.mjs) + [`.supply-chain/install-hooks.allowlist`](./.supply-chain/install-hooks.allowlist) + the `install-hooks` job. Allowlist seeded with the four legitimate install-hook packages currently in the tree.
- [x] Add [`scripts/license-check.mjs`](./scripts/license-check.mjs) + [`.supply-chain/license-allowlist.json`](./.supply-chain/license-allowlist.json) + the `license-check` job (backend `liccheck` parity, PARANOID, fail-closed). Tree is 0 violations; wired into the `Supply chain checks passed` aggregator as a required check. See [§9](#9-license-allowlist-gate).
- [x] Add `lockfile-lint` to CI to enforce HTTPS-only registry hosts and integrity hashes in `yarn.lock`.
- [x] Harden the Gitleaks workflow: pinned to `v8.30.1` with `sha256sum -c` verification of the downloaded binary; full-history scan.
- [x] Add `all-checks-passed` aggregator job to keep branch-protection wiring simple when re-enabled.
- [x] Add [`.github/CODEOWNERS`](./.github/CODEOWNERS) for supply-chain-relevant paths.
- [x] All workflows declare explicit `permissions:` blocks (top-level `contents: read`; per-job `contents: write` only on the release workflows for `softprops/action-gh-release`).
- [x] All GitHub Actions are SHA-pinned, not tag-pinned.
- [ ] **Disable Dependabot security updates** + close stale `dependabot/npm_and_yarn/*` PRs. Manual GitHub-side action; tracked under the supply-chain plan's Phase 1.7.
- [ ] **Re-enable branch protection on `main`** once `Supply chain checks passed` has run green for a week. Required checks: `Supply chain checks passed` + `All checks passed` + `Run Gitleaks`. **Require review from Code Owners** — without this, [`.github/CODEOWNERS`](./.github/CODEOWNERS) is decorative. Tracked under the supply-chain plan's Phase 3.6.
- [ ] **Weekly cron audit** with Slack/Issue failure notification. Tracked under the supply-chain plan's Phase 3.4.
- [ ] **Snyk parity** with other Valory repos. Tracked under the supply-chain plan's Phase 3.5.
- [ ] **Strip tildes (`~`)** on the remaining `@swc-node/register`, `@swc/cli`, `@swc/core`, `@swc/helpers`, `jsdom`, `typescript` entries. Plan 1.2 was scoped to carets only; tildes carry the same patch-bump-on-clean-install risk.
- [ ] Migrate `styled-components` 5.3.6 → 6.x to clear the allowlisted `babel-plugin-styled-components` transitives (`lodash`, `picomatch`). Major-version migration; non-trivial.
- [ ] Bump `react-router-dom` 6.29.0 → 6.30.2+ to clear the allowlisted `@remix-run/router` advisory. Patch bump within v6, low risk.

## References

- [GitHub advisory database](https://github.com/advisories)
- [Socket.dev](https://socket.dev/) — supply chain scanner with postinstall script detection
- [`agents-fun` PR #48](https://github.com/valory-xyz/agents-fun/pull/48) — the org's reference supply-chain hardening PR; this document mirrors its structure.
- [`townhall-kpis` SUPPLY-CHAIN-SECURITY.md](https://github.com/valory-xyz/townhall-kpis/blob/main/SUPPLY-CHAIN-SECURITY.md) — sibling repo doc; consult for fields not covered here (e.g. the per-secret enumeration for runtime apps).
- [`lockfile-lint`](https://github.com/lirantal/lockfile-lint) — validates `resolved` URLs, HTTPS, and integrity hashes in `yarn.lock`.
- [Dependency confusion — Alex Birsan's original writeup](https://medium.com/@alex.birsan/dependency-confusion-4a5d60fec610)
