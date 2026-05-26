---
name: triage-security
description: Triage open Dependabot security alerts on this repo (npm ecosystem only). For each alert, decide whether the vulnerable package is reachable from the deployed static-SPA bundle (any of `apps/agentsfun-ui`, `apps/babydegen-ui`, `apps/predict-ui` + the libraries they import) and, if so, whether the CVE's preconditions are satisfied by this codebase's actual usage. Allowlisted advisories (`.supply-chain/audit-allowlist.json`) are skipped. Repo-specific to agent-ui-monorepo — archetype `nx-monorepo-of-static-react-spas`.
argument-hint: "[--limit N] [--rerun-dismissed]  # --limit caps alerts processed; --rerun-dismissed walks already-dismissed alerts and reports verdict drift (no mutations)"
disable-model-invocation: true
---

# Triage Dependabot security alerts (npm / Nx monorepo of static React SPAs)

Walk every open Dependabot alert (`/repos/{owner}/{repo}/dependabot/alerts?state=open`). For each alert, classify by whether the vulnerable package is **reachable from the deployed static SPA bundles** — i.e. shipped in the per-app ZIP attached to a GitHub Release (`agentsfun-ui-build.zip`, `babydegen-ui-build.zip`, `predict-ui-build.zip`) — and, if so, whether the CVE's preconditions are satisfied by this codebase's actual usage. Then act in one pass.

Key facts that shape this skill:

- **One yarn tree.** This is an Nx monorepo with a single root `package.json` + `yarn.lock`. There are no nested `package.json` files in `apps/` or `libs/` for runtime deps — Nx hoists everything to the root. Dependabot raises one alert per advisory against `yarn.lock`; the skill consults the single allowlist and runs Signal C against the single PROD source set (the union of all three apps + their imported libs).
- **One ecosystem.** npm only. There is no Python, no Docker, no separate frontend tree. GitHub Actions advisories (if introduced) need a parallel signal set and are out of scope for this skill.
- **Deployed runtime.** Each app ships as a **static HTML/JS/CSS ZIP bundle** attached to a GitHub Release. The downstream operator (Pearl-container/agent-runtime; out of this repo) extracts the ZIP and serves it as static files behind its own HTTP server, with operator-applied Content-Security-Policy headers. **There is no Node.js server, no SSR, no Next.js runtime, no Electron main process, no filesystem write, no `spawn()`.** The renderer is pure browser code.
- **The three apps talk to a localhost backend** at `http://127.0.0.1:8716` (and `${LOCAL}/api/v1`). That backend is the locally-running agent process, **not part of this repo**. Browser-side `fetch` is the only outbound communication channel.
- **React Router DOM is in deps but no app defines routes.** All three apps are single-page. `agentsfun-ui` wraps `<BrowserRouter>` only; the other two don't even mount a router. The XSS-via-open-redirect path in `@remix-run/router` requires React Router's Framework / Data / RSC modes — none of which are reachable here. This is the **existing worked precedent** (`.supply-chain/audit-allowlist.json` entry for `@remix-run/router` GHSA-2w69-qvjg-hvjx).
- **Archetype**: fixed at `nx-monorepo-of-static-react-spas`. Surface posture differs from an Electron desktop app or a Vercel SSR deployment in two important directions:
  - **Narrower on host-resource CWEs**: command injection (no shell), runtime path traversal (no fs), arbitrary file write (no fs), tmpfile races (no tmp), long-lived listener bugs (browser tab lifecycle is short, no server side) — ALL **N/A**. These are the classes a static SPA cannot reach.
  - **Wider on browser-renderer CWEs**: XSS, prototype pollution, client-side ReDoS, untrusted-deserialization-via-JSON.parse, info disclosure via console / unhandled errors — apply by default. `ui-chat` renders Markdown via `react-markdown` + `remark-gfm` + `rehype-raw` (raw HTML enabled), which is a real XSS surface that any markdown CVE can reach.
- **Audit-allowlist integration**: `.supply-chain/audit-allowlist.json` is the single source of maintainer-accepted advisories. Each entry carries `id` (yarn audit numeric) AND `ghsa` (GHSA-xxxx-xxxx-xxxx). The skill matches by `ghsa` because that's what Dependabot exposes. If an alert's GHSA appears in the allowlist, the skill skips it.

## Decision matrix

| Classification | Confidence | Action |
| --- | --- | --- |
| Allowlisted in `.supply-chain/audit-allowlist.json` (by GHSA) | n/a | **SKIP.** Already accepted by maintainer; the skill must not override. |
| Not reachable from PROD source set (Signal C: 0 PROD imports) AND not on the always-PROD override list | n/a | Dismiss with `not_used` + audit-trail issue. |
| Reachable from PROD source set, CVE preconditions absent | **high** | Dismiss with `inaccurate` + audit-trail issue. |
| Reachable from PROD source set, CVE preconditions absent | moderate / low | Open issue + `needs-human-review`. Do NOT dismiss. |
| Reachable from PROD source set, CVE preconditions satisfied | any | Open tracking issue. Leave Dependabot alert open as canonical record. |
| Unclassifiable (no signals decisive) | n/a | Skip + stderr line. Never dismiss without evidence. |
| Ecosystem != npm | n/a | Skip as `unsupported-ecosystem` (informational, no exit-code impact). |

Conservative defaults: **when uncertain, open the issue.** A false-positive issue is one `gh issue close` away; a false-negative dismissal hides a real vuln. **`tolerable_risk` is never set by the skill** — that's a maintainer call (and `.supply-chain/audit-allowlist.json` is where it lives).

Every dismissal opens a closed audit-trail issue (§3.1c) labelled `security-audit`. `gh issue list --state closed --label security-audit` returns every dismissal the skill has ever performed.

This skill runs fully autonomously on invocation — it mutates GitHub state (dismisses alerts, opens issues). Do not invoke from conversational context; require explicit `/triage-security`.

---

## Phase 0 — Ground truth

```bash
set -euo pipefail

# 0.0 Platform check. Linux + macOS only. Native PowerShell / cmd.exe not supported.
case "$(uname -s 2>/dev/null)" in
  Linux*|Darwin*) ;;
  MINGW*|MSYS*|CYGWIN*)
    echo "WARN: running under $(uname -s) — Git Bash / MSYS path is untested." >&2 ;;
  *)
    echo "WARN: unrecognized platform $(uname -s). Skill is bash-only and may fail on this OS." >&2 ;;
esac

# 0.1 Required CLIs — fail fast.
for cmd in gh jq node grep find sed tr printf mktemp; do
  command -v "$cmd" >/dev/null 2>&1 \
    || { echo "ERROR: required CLI not found on PATH: $cmd"; exit 1; }
done

# 0.2 Confirm we're in a GitHub repo.
gh repo view --json owner,name --jq '"\(.owner.login)/\(.name)"' > /tmp/ts_repo.txt 2>/dev/null \
  || { echo "ERROR: not in a GitHub repo (gh repo view failed)"; exit 1; }
REPO=$(cat /tmp/ts_repo.txt)
echo "operating on $REPO"

# 0.3 Confirm this is agent-ui-monorepo. The skill targets this repo's layout —
# a single root yarn tree, an Nx monorepo with three SPAs under apps/ and six
# libs under libs/, plus the supply-chain scripts. Wrong-repo invocations should
# fail loud.
test -f package.json \
  || { echo "ERROR: no root package.json — skill targets agent-ui-monorepo's Nx layout"; exit 1; }
test -f nx.json \
  || { echo "ERROR: no nx.json — wrong repo or wrong working dir"; exit 1; }
test -d apps/agentsfun-ui \
  || { echo "ERROR: no apps/agentsfun-ui/ — wrong repo"; exit 1; }
test -d apps/babydegen-ui \
  || { echo "ERROR: no apps/babydegen-ui/ — wrong repo"; exit 1; }
test -d apps/predict-ui \
  || { echo "ERROR: no apps/predict-ui/ — wrong repo"; exit 1; }
test -d libs \
  || { echo "ERROR: no libs/ — wrong repo (skill targets the Nx monorepo layout)"; exit 1; }
test -f .supply-chain/audit-allowlist.json \
  || { echo "ERROR: no .supply-chain/audit-allowlist.json — supply-chain policy not in place"; exit 1; }

# 0.4 Confirm Dependabot alerts API is reachable.
gh api "repos/$REPO/dependabot/alerts?state=open&per_page=1" --jq 'length' > /dev/null 2>&1 \
  || { echo "ERROR: Dependabot alerts API unreachable on $REPO (token scope? repo permissions?)"; exit 1; }

# 0.4b Node engine version. The repo pins node 24.x via `engines` + `.nvmrc`
# (currently v24.15.0). Yarn-wrapped commands work on older node, but the
# audit:prod / audit:install-hooks scripts assume a modern node. If you're on
# the host's older node, the supply-chain scripts may misbehave.
NODE_VER=$(node -p 'process.versions.node.split(".")[0]' 2>/dev/null || echo 0)
if [[ "$NODE_VER" -lt 20 ]]; then
  echo "WARN: node $NODE_VER detected; repo declares engine 24.x in package.json + .nvmrc." >&2
  echo "      Switch via: source ~/.nvm/nvm.sh && nvm use" >&2
fi
```

### 0.5 Archetype (fixed for this repo)

The whole repo has a single archetype: **`nx-monorepo-of-static-react-spas`**. Rationale:

- The deployed artifact per app is a single static-asset ZIP attached to a GitHub Release (`agentsfun-ui-build.zip`, `babydegen-ui-build.zip`, `predict-ui-build.zip`). Vite + Nx produces a folder of `index.html`, `assets/*.js`, `assets/*.css`, fonts, images — that's the whole bundle.
- **No SSR, no Next.js runtime, no Electron, no Node.js server.** The downstream operator (Pearl container, out of repo) extracts the ZIP and serves the files behind its own HTTP server with operator-applied CSP headers (each app's README documents the required CSP).
- The renderer is pure browser code: React 19 + TypeScript + Vite 6 + Ant Design 5 + styled-components 5 + TanStack React Query 5. `viem` is used in `apps/babydegen-ui` only (`isAddress` validation in the withdrawal form). No app uses GraphQL even though `graphql` / `graphql-request` are in root deps — every app calls REST via `fetch`.
- All three apps talk to a localhost backend at `http://127.0.0.1:8716` (the agent process; out of repo) and to external read-only endpoints (CoinGecko, Omen / Polymarket subgraphs, OLAS Agents subgraph, IPFS gateway). No server-side code in this repo.
- React Router DOM 6 is in root deps but **no app defines routes** — `agentsfun-ui` wraps `<BrowserRouter>` only for context; `babydegen-ui` and `predict-ui` don't even mount a router. CVEs that require Framework / Data / RSC mode are structurally unreachable. This is the worked precedent recorded in `.supply-chain/audit-allowlist.json` for `@remix-run/router` (GHSA-2w69-qvjg-hvjx).

**Exploit-surface posture (static-SPA-specific).** The following CVE classes DO apply by default:

- **CWE-79 (XSS)** — APPLIES. `libs/ui-chat` renders agent messages as Markdown via `react-markdown` + `remark-gfm` + `rehype-raw`. **`rehype-raw` allows raw HTML** in the markdown source, so any CVE that lets attacker-controlled markdown inject HTML reaches the bundle. Inputs come from the agent backend (`/api/v1/agent/*`) — caller-influenceable through agent prompt selection. Audit `libs/ui-chat/src/lib/*` for any new sinks; check what fields `Chat` renders from the backend payload.
- **CWE-94 / CWE-95 (code injection / eval)** — APPLIES. Browser `eval` / `Function(...)` / `new Function` sinks in deps run with full DOM access in the renderer. CSP `unsafe-eval` is not granted by the operator (per per-app README), but the skill cannot rely on CSP — assume the dep evaluates.
- **CWE-1321 (prototype pollution)** — APPLIES. Object-merge gadgets in `lodash` (transitive via `babel-plugin-styled-components` — already allowlisted as build-time-only) and in other utility libs reach our code if they execute at runtime. Audit React Query cache merges, `setState` updaters that spread server responses, and any `Object.assign` over backend payloads.
- **CWE-918 (SSRF)** — APPLIES narrowly. The only outbound `fetch` destinations are: localhost backend (first-party), external subgraph / CoinGecko / IPFS gateway URLs hardcoded in `libs/util-constants-and-types/src/lib/constants/urls.ts`. **None of these are caller-controllable from app state**, so the SSRF surface is essentially nil — but a dep that follows redirects to caller-influenced URLs can still reach an attacker-controlled host through a compromised first-party endpoint.
- **CWE-502 (untrusted deserialization / parser)** — APPLIES. `JSON.parse` on backend responses (the agent process is first-party but its responses pass through several hops). `viem`'s ABI / RLP decoding (babydegen-ui only). Markdown parser (`remark-gfm`). Chart-data parsing (Recharts, Chart.js).
- **CWE-400 / CWE-770 / CWE-1333 (DoS — memory / regex / unbounded)** — APPLIES but moderate. The browser tab dies if the renderer hangs; there's no service-availability multiplier of a long-running server. Still real for usability — ReDoS in `react-markdown`'s linkify or in `remark-gfm` table parsing freezes the chat surface.
- **CWE-200 / CWE-201 / CWE-209 / CWE-532 (info leak)** — APPLIES narrowly. We do not write logs to disk (no fs). Browser `console.error` is visible to anyone with devtools open; a CVE that logs auth state or backend response headers leaks them to that surface. No "support bundle" feature exists in this repo.

The following CVE classes do NOT apply by default:

- **CWE-78 / CWE-77 / CWE-88 (command injection / shell)** — **N/A**. No `child_process`, no `spawn`, no shell access from browser code.
- **CWE-22 / CWE-23 / CWE-73 (path traversal at runtime)** — **N/A**. No filesystem in browser; `fs.readFile` / `fs.writeFile` are not callable. Build-time path-traversal in Vite / Nx tooling is DEV-only.
- **CWE-377 (insecure tmpfile)** — **N/A**. No tmp dir, no fs.
- **CWE-295 / CWE-297 / CWE-345 (TLS / cert bypass)** — **N/A from app code**. Browser handles TLS via the platform's cert store; deps cannot bypass it.
- **Next.js SSR-specific CVEs** (RSC, middleware, i18n bypass, `getServerSideProps`, `app/` router, `next/image` server runtime, `next/link` prefetch) — **N/A**. This repo uses Vite, not Next. No `next` dep at any tier.
- **Express / Koa / Fastify cookie / session / route CVEs** — **N/A**. No server in this repo.
- **Long-lived listener / native socket CVEs** — **N/A**. Browser tab is short-lived; no native sockets.
- **React Router CVEs requiring routes / loaders / actions / `redirect()` / data router / framework mode** — **N/A in this repo specifically**. No app defines any route. Existing allowlist entry for `@remix-run/router` is the worked precedent — re-attestable each review cycle.

When in doubt, fall through to §2.5's per-advisory reasoning rather than relying on the archetype alone. The archetype narrows but does not decide.

### 0.5b Always-PROD package override list

Some packages are PROD-reachable by their nature, even if Signal C's import-graph scan misses them (re-export through libs, dynamic chunk loading, factory-style usage). The following packages are **forced to PROD** regardless of Signal C results:

```bash
# Always-PROD: packages whose code paths reach the renderer bundle by design,
# even if grep can't see the import (because the lib that imports it re-exports
# only a default factory, etc.).
ALWAYS_PROD=(
  # React core
  "react" "react-dom" "react-is"

  # React Router (in deps, but no routes defined — see archetype note;
  # CVE reachability still requires per-CVE analysis. We force PROD to make
  # sure §2.5 runs and produces a real reasoning trail.)
  "react-router-dom" "react-router" "@remix-run/router"

  # Ant Design + icons — every UI surface
  "antd" "@ant-design/.*" "@ant-design/icons"

  # Styling
  "styled-components" "@fontsource/inter"

  # Data fetching + state
  "@tanstack/react-query"

  # Web3 (used in apps/babydegen-ui only — isAddress validation)
  "viem"

  # Markdown rendering (ui-chat) — XSS surface
  "react-markdown" "remark-gfm" "rehype-raw"
  "remark.*" "rehype.*" "unified" "mdast.*" "hast.*" "micromark.*"

  # Charting
  "recharts" "chart\\.js" "react-chartjs-2" "chartjs-plugin-doughnutlabel"

  # Renderer utilities
  "lucide-react" "react-jazzicon" "react-infinite-scroll-component"

  # Already-in-deps but currently unused (CLAUDE.md notes). Forced to PROD
  # defensively — if grep ever finds an import, this entry already covered it.
  "graphql" "graphql-request"
)
```

This list is conservative — better to force-PROD a lookalike than miss real exposure. Maintainers curate the list; the cost of a false-PROD is "open an issue instead of dismissing," which is the safe direction. Build-toolchain packages (`vite`, `@vitejs/plugin-react`, `nx`, `@nx/.*`, `@swc/.*`, `@babel/.*`, `@types/.*`, `eslint`, `eslint-.*`, `jest`, `jest-.*`, `ts-jest`, `babel-jest`, `prettier`, `typescript`, `vitest`, `jsdom`, `jiti`, `tslib`) are deliberately NOT forced to PROD — they're build-time and Signal C correctly classifies them DEV.

### 0.6 Load `.supply-chain/audit-allowlist.json`

Maintainer-accepted advisories live in a single file. The skill must not override these — if a GHSA is allowlisted, treat the Dependabot alert as already-triaged and skip.

```bash
ALLOWLIST=".supply-chain/audit-allowlist.json"

# Build the GHSA list. Matching is by GHSA because Dependabot exposes
# .security_advisory.ghsa_id directly; the numeric `id` field in the allowlist
# comes from `yarn audit --json` and isn't in the Dependabot payload.
: > /tmp/ts_allowlisted_ghsas.txt
if [[ -f "$ALLOWLIST" ]]; then
  jq -r '.entries[]?.ghsa // empty' "$ALLOWLIST" >> /tmp/ts_allowlisted_ghsas.txt
fi
sort -u /tmp/ts_allowlisted_ghsas.txt -o /tmp/ts_allowlisted_ghsas.txt
ALLOWLIST_COUNT=$(wc -l < /tmp/ts_allowlisted_ghsas.txt | tr -d ' ')
echo "loaded $ALLOWLIST_COUNT allowlisted GHSAs from $ALLOWLIST"
```

### 0.7 Pre-create labels (idempotent setup)

`gh issue create --label X` errors if the label doesn't already exist. Pre-create once per skill run (NOT per alert):

```bash
gh label create security             --color B60205 --description "Security vulnerability" --repo "$REPO" 2>/dev/null || true
gh label create dependabot           --color 0366D6 --description "Dependabot-reported" --repo "$REPO" 2>/dev/null || true
gh label create triage-security      --color 5319E7 --description "Opened by triage-security skill" --repo "$REPO" 2>/dev/null || true
gh label create needs-human-review   --color FBCA04 --description "Skill confidence below threshold — maintainer call required" --repo "$REPO" 2>/dev/null || true
gh label create security-audit       --color C2E0C6 --description "Permanent audit record for a triage-security dismissal (auto-closed)" --repo "$REPO" 2>/dev/null || true
```

---

## Phase 1 — Fetch alerts

```bash
TMP=$(mktemp -d)

# 1.0 Parse argv.
#   --limit N         cap on alerts processed
#   --rerun-dismissed read-only verdict-drift report against state=dismissed alerts
LIMIT=""
MODE="live"
while [[ $# -gt 0 ]]; do
  case "$1" in
    --limit) LIMIT="$2"; shift 2 ;;
    --limit=*) LIMIT="${1#*=}"; shift ;;
    --rerun-dismissed) MODE="rerun-dismissed"; shift ;;
    *) shift ;;
  esac
done
[[ -n "$LIMIT" ]] && [[ ! "$LIMIT" =~ ^[0-9]+$ ]] \
  && { echo "ERROR: --limit must be a non-negative integer, got: $LIMIT"; exit 1; }

if [[ "$MODE" == "rerun-dismissed" ]]; then
  STATE_FILTER="state=dismissed"
  echo "MODE=rerun-dismissed — read-only verdict-drift report"
else
  STATE_FILTER="state=open"
fi

# 1.1 Fetch (paginated; the per_page cap is 100 — use --paginate).
gh api "repos/$REPO/dependabot/alerts?${STATE_FILTER}&per_page=100" --paginate \
  > "$TMP/alerts.json" \
  || { echo "ERROR: failed to list Dependabot alerts"; exit 1; }
jq -e 'type == "array"' "$TMP/alerts.json" > /dev/null \
  || { echo "ERROR: Dependabot response not a JSON array"; head -20 "$TMP/alerts.json"; exit 1; }

N_ALERTS=$(jq 'length' "$TMP/alerts.json")
if [[ -n "$LIMIT" && "$LIMIT" -lt "$N_ALERTS" ]]; then
  echo "found $N_ALERTS open alerts; processing first $LIMIT per --limit"
  N_PROCESS="$LIMIT"
else
  echo "found $N_ALERTS open alerts"
  N_PROCESS="$N_ALERTS"
fi
```

### 1.2 Alert fields used

| Field | Path |
| ----- | ---- |
| Alert number | `.number` |
| Alert URL | `.html_url` |
| Severity | `.security_advisory.severity` |
| GHSA / CVE | `.security_advisory.ghsa_id`, `.security_advisory.cve_id` |
| Summary | `.security_advisory.summary` |
| Package name | `.security_vulnerability.package.name` |
| Ecosystem | `.security_vulnerability.package.ecosystem` (skip if not `npm`) |
| Vulnerable range | `.security_vulnerability.vulnerable_version_range` |
| First patched | `.security_vulnerability.first_patched_version.identifier` |
| Manifest | `.dependency.manifest_path` (always `yarn.lock` in this repo) |
| Scope | `.dependency.scope` (`runtime` or `development`) |

**Skip immediately** any alert where:

- `ecosystem` is not `npm` — bucket as `unsupported-ecosystem` (informational, no exit-code impact). The skill is npm-only. GitHub Actions alerts (if introduced) need a parallel signal set.
- `state != "open"` in live mode (defensive against pagination races).
- `auto_dismissed_at != null` (already auto-dismissed by GitHub).
- `.security_advisory.ghsa_id` appears in `/tmp/ts_allowlisted_ghsas.txt` — bucket as `allowlisted`.

---

## Phase 2 — Classify each alert

### 2.1 PROD vs DEV path sets — Nx-monorepo narrowing

**The decisive narrowing in this skill.** What ships in the per-app ZIP is the Vite-built static bundle of one app under `apps/<app>/src/**` plus whichever libs that app imports from `libs/<lib>/src/lib/**`. Anything that lives only in `__tests__/`, `scripts/`, `coverage/`, `dist/`, `.nx/` or in co-located `*.spec.*` files doesn't reach the runtime.

```bash
# PROD source set — apps + libs (everything Vite pulls into the bundle).
#
# Apps (each app builds its own ZIP).
APP_PROD_DIRS=(
  apps/agentsfun-ui/src
  apps/babydegen-ui/src
  apps/predict-ui/src
)

# Libs — all 6 are publishable / consumed by at least one app.
LIB_PROD_DIRS=(
  libs/ui-chat/src
  libs/ui-error-boundary/src
  libs/ui-pill/src
  libs/ui-theme/src
  libs/util-constants-and-types/src
  libs/util-functions/src
)

# Combined PROD source set.
PROD_DIRS=("${APP_PROD_DIRS[@]}" "${LIB_PROD_DIRS[@]}")

# DEV set — anything that doesn't ship in any app bundle.
DEV_DIRS=(
  apps/agentsfun-ui/__tests__         # apps use __tests__/ (NOT co-located)
  apps/babydegen-ui/__tests__
  apps/predict-ui/__tests__
  scripts                              # root supply-chain scripts (audit.mjs, audit-install-hooks.mjs, bundle-size.mjs, branch-protection-apply.sh)
)

# PROD file exclusion patterns (applied via grep -v after file listing):
#   - libs co-locate specs: *.spec.{ts,tsx} sit next to source in libs/*/src/lib/
#   - any *.test.{ts,tsx,js,jsx} (Nx default)
#   - any *.stories.{ts,tsx,js,jsx}
#   - paths under /node_modules/, /.nx/, /dist/, /coverage/, /__tests__/, /__mocks__/
PROD_FILE_EXCLUDES='/(node_modules|\.nx|dist|coverage|__tests__|__mocks__)/|\.(spec|test|stories)\.(ts|tsx|js|jsx)$'

# Note on apps/*/src/mocks/: these directories contain runtime mock fixtures
# gated by IS_MOCK_ENABLED env var (devMock pattern). They ship in the bundle
# even when the gate is off in production. Treat as PROD.

export APP_PROD_DIRS LIB_PROD_DIRS PROD_DIRS DEV_DIRS PROD_FILE_EXCLUDES
```

**Critical**: every grep call MUST expand arrays with `"${arr[@]}"` (quoted-each-element). The unquoted form collapses on subshell boundaries and silently returns zero hits.

**Manifest → PROD set mapping**:

| Manifest path | Ecosystem | PROD source set | Allowlist consulted |
| --- | --- | --- | --- |
| `yarn.lock` | npm | `PROD_DIRS` (apps/*/src + libs/*/src) | `.supply-chain/audit-allowlist.json` |

There is only one manifest in this repo. Every npm alert maps to the same PROD set.

### 2.2 Signal A — `dependency.scope` (reliable for direct deps in this repo)

```bash
SCOPE=$(jq -r ".[$i].dependency.scope // \"unknown\"" "$TMP/alerts.json")
```

The root `package.json` cleanly distinguishes `dependencies` from `devDependencies`, and Dependabot inherits that scope into transitive alerts. When `scope == "development"`, the package is reachable only at build/test time and is a strong candidate for dismissal. When `scope == "runtime"`, it's a candidate for §2.5 analysis.

Transitive deps inherit scope from the topmost ancestor in the dep chain. So Signal A is a strong prior, not a decision. Signal C (import-graph) refines it.

### 2.3 Signal B — manifest membership

The alert's `.dependency.manifest_path` is always `yarn.lock` in this repo, so the sibling manifest is always the root `package.json`. Walk it to bucket the package:

```bash
PKG=$(jq -r ".[$i].security_vulnerability.package.name" "$TMP/alerts.json")
MANIFEST_PATH=$(jq -r ".[$i].dependency.manifest_path" "$TMP/alerts.json")
ECOSYSTEM=$(jq -r ".[$i].security_vulnerability.package.ecosystem" "$TMP/alerts.json")

SIBLING_PKG_JSON="package.json"
SIBLING_TREE="root"

PKG_GROUP="transitive"  # default
if [[ "$ECOSYSTEM" == "npm" && -f "$SIBLING_PKG_JSON" ]]; then
  PKG_GROUP=$(node -e "
    const p = require('./$SIBLING_PKG_JSON');
    const pkg = process.argv[1];
    if ((p.dependencies||{})[pkg]) console.log('prod');
    else if ((p.devDependencies||{})[pkg]) console.log('dev');
    else if ((p.peerDependencies||{})[pkg]) console.log('peer');
    else if ((p.optionalDependencies||{})[pkg]) console.log('optional');
    else if ((p.resolutions||{})[pkg]) console.log('resolution');
    else console.log('transitive');
  " "$PKG" 2>/dev/null || echo "transitive")
fi
echo "Signal B: $PKG declared as '$PKG_GROUP' in $SIBLING_PKG_JSON"
```

For direct deps, Signal B is decisive (a `devDependencies` entry is DEV unless explicitly overridden via §0.5b). For transitive deps it returns `transitive` and Signal C decides.

### 2.4 Signal C — import-graph scan (decisive for transitive deps)

```bash
# Step 0 — per-iteration variable reset (CRITICAL under `set -u`).
VERDICT=""
CONFIDENCE=""
NEEDS_REVIEW="false"
PROD_HITS=0
DEV_HITS=0
PROD_HIT_FILES=""
DEV_HIT_FILES=""
ALWAYS_PROD_HIT=""
CLASSIFICATION_REASON=""
ADVISORY_SUMMARY=""
CWE_CHECKLIST_ANSWERS=""
SYMBOL_TRACE_RESULT=""
APPLICABILITY_REASONING=""
CWE_IDS=""
REVERSE_DEP_ROOT=""

# Step 1 — short-circuits.
#
# @types/* is TypeScript-types-only (no runtime).
if [[ "$PKG" == @types/* ]]; then
  VERDICT="DEV"
  CLASSIFICATION_REASON="@types/* is TypeScript-types-only — no runtime code ships"
fi

# Always-PROD override (see §0.5b).
ALWAYS_PROD_HIT=""
for ap_re in "${ALWAYS_PROD[@]}"; do
  if [[ "$PKG" =~ ^${ap_re}$ ]]; then
    ALWAYS_PROD_HIT="$ap_re"
    break
  fi
done
if [[ -n "$ALWAYS_PROD_HIT" ]]; then
  echo "Signal C: $PKG matches ALWAYS_PROD pattern '$ALWAYS_PROD_HIT' — forcing PROD."
  PROD_HITS=1
  PROD_HIT_FILES="(forced PROD: matches ALWAYS_PROD pattern '$ALWAYS_PROD_HIT')"
  VERDICT="PROD"
fi

# Step 2 — derive import patterns. ES modules: `import` / `import()` / `require`.
if [[ -z "$VERDICT" ]]; then
  PKG_RE=$(printf '%s' "$PKG" | sed 's/[][\\/.*^$+?{}()|]/\\&/g')

  if command -v ggrep >/dev/null 2>&1; then
    GREP=ggrep
  else
    GREP=grep
  fi
  echo "test" | "$GREP" -Pq "test" 2>/dev/null \
    || { echo "ERROR: GNU grep with -P support required (macOS: 'brew install grep')"; exit 1; }

  # Multi-line ES-module import. Covers: named, default, namespace, mixed,
  # side-effect-only, and re-exports. The `(.{0,300}?from)?` allows up to
  # 300 non-greedy chars between `import` and `from 'pkg'` (multi-line braces).
  IMPORT_RE_MULTILINE="(import|export)[[:space:]]+(.{0,300}?from[[:space:]]+)?['\"]${PKG_RE}(/[^'\"]*)?['\"]"
  # Single-line require() / dynamic import().
  IMPORT_RE_INLINE="(require\\([[:space:]]*['\"]${PKG_RE}(/[^'\"]*)?['\"]|import\\([[:space:]]*['\"]${PKG_RE}(/[^'\"]*)?['\"])"
  FILE_GLOBS=( -name "*.ts" -o -name "*.tsx" -o -name "*.js" -o -name "*.jsx" -o -name "*.mjs" -o -name "*.cjs" )
fi
```

Step 3 — grep prod vs dev:

```bash
grep_imports() {
  local -a paths=("$@")
  [[ ${#paths[@]} -gt 0 ]] || return 0
  # Resolve existing files/dirs only.
  local -a existing=()
  for p in "${paths[@]}"; do
    [[ -e "$p" ]] && existing+=("$p")
  done
  [[ ${#existing[@]} -gt 0 ]] || return 0
  {
    find "${existing[@]}" "${FILE_GLOBS[@]}" -print0 2>/dev/null \
      | xargs -0 "$GREP" -Pzlo "$IMPORT_RE_MULTILINE" 2>/dev/null
    find "${existing[@]}" "${FILE_GLOBS[@]}" -print0 2>/dev/null \
      | xargs -0 "$GREP" -lE "$IMPORT_RE_INLINE" 2>/dev/null
  } | sort -u | "$GREP" -Ev "$PROD_FILE_EXCLUDES" || true
}

if [[ -z "$VERDICT" ]]; then
  PROD_HIT_FILES=$(grep_imports "${PROD_DIRS[@]}")
  if [[ -z "$PROD_HIT_FILES" ]]; then PROD_HITS=0; else PROD_HITS=$(printf '%s\n' "$PROD_HIT_FILES" | wc -l | tr -d ' '); fi

  # DEV scan: matched spec/test/stories files in the PROD scan AND files in $DEV_DIRS.
  DEV_FROM_TESTS=""
  if [[ ${#PROD_DIRS[@]} -gt 0 ]]; then
    DEV_FROM_TESTS=$({
      find "${PROD_DIRS[@]}" \( -name "*.spec.*" -o -name "*.test.*" -o -name "*.stories.*" \) -print0 2>/dev/null \
        | xargs -0 "$GREP" -Pzlo "$IMPORT_RE_MULTILINE" 2>/dev/null
      find "${PROD_DIRS[@]}" \( -name "*.spec.*" -o -name "*.test.*" -o -name "*.stories.*" \) -print0 2>/dev/null \
        | xargs -0 "$GREP" -lE "$IMPORT_RE_INLINE" 2>/dev/null
    } | sort -u || true)
  fi
  DEV_FROM_DIRS=$(grep_imports "${DEV_DIRS[@]}")
  DEV_HIT_FILES=$(printf '%s\n%s\n' "$DEV_FROM_TESTS" "$DEV_FROM_DIRS" | sed '/^$/d' | sort -u)
  if [[ -z "$DEV_HIT_FILES" ]]; then DEV_HITS=0; else DEV_HITS=$(printf '%s\n' "$DEV_HIT_FILES" | wc -l | tr -d ' '); fi

  echo "Signal C: PROD_HITS=$PROD_HITS DEV_HITS=$DEV_HITS (manifest=$MANIFEST_PATH)"
fi

# Sanity probe — refuse to auto-dismiss a confirmed direct `dependencies` entry
# even if Signal C scored zero (defence against regex evolution bugs).
if [[ "$PKG_GROUP" == "prod" && "${PROD_HITS:-0}" -eq 0 ]]; then
  echo "WARN: $PKG is a direct \`dependencies\` entry in $SIBLING_PKG_JSON but Signal C shows 0 PROD imports — forcing PROD." >&2
  PROD_HITS=1
  PROD_HIT_FILES="(forced: direct \`dependencies\` entry in root package.json always treated as PROD)"
fi
```

Step 4 — classify:

| `PROD_HITS` | `DEV_HITS` | Signal A scope | Signal B group | Verdict |
| ----------- | ---------- | -------------- | -------------- | ------- |
| `> 0` | any | any | any | **PROD** — pkg is imported from apps/libs source; continue to §2.5 |
| `0` | `> 0` | `development` | `dev` / `transitive` | **DEV** — only in __tests__/scripts; dismiss `not_used` |
| `0` | `> 0` | `runtime` | `transitive` | **DEV (uncertain)** — surfaced in DEV scope only but scope=runtime. Open issue + `needs-human-review`. |
| `0` | `0` | `development` | any | **DEV** — pure transitive of build tooling; dismiss `not_used` |
| `0` | `0` | `runtime` | `prod` | **PROD (forced)** — sanity probe already fired. |
| `0` | `0` | `runtime` | `transitive` | **DEV** — pure transitive never imported anywhere; dismiss `not_used` |

The mixed cells are intentionally conservative: open the issue rather than auto-dismiss.

### 2.5 Exploit-surface analysis — only triggered for PROD verdicts

Only runs when Signal C returned `PROD_HITS > 0` (or `ALWAYS_PROD` matched, or the sanity probe forced PROD). This is the dominant phase — most alerts reach here for runtime deps.

- **§2.5.1 Fetch GHSA description:** `gh api "/advisories/$GHSA_ID" --jq '{summary, description, severity, cwe_ids: [.cwe_ids[]?.cwe_id]}'`.
- **§2.5.1b** Optional MITRE CWE supplementation (`curl https://cwe.mitre.org/data/definitions/${N}.json`) for sparse advisories.
- **§2.5.2** Derive a per-advisory precondition checklist (Q1, Q2, …) from the description text. Standard preconditions for the bug class against this archetype:

  | CWE | Bug class | Typical Q shape (nx-monorepo-of-static-react-spas) |
  | --- | --- | --- |
  | CWE-78 / CWE-77 / CWE-88 | Command injection / shell | **NEVER APPLIES** in PROD bundles. No browser code can shell out. (Build-time CVEs in Vite / Nx tooling are DEV — Signal C dismisses them via DEV scope.) |
  | CWE-22 / CWE-23 / CWE-73 | Path traversal at runtime | **NEVER APPLIES** in PROD bundles. No fs in browser. (Build-time tooling = DEV.) |
  | CWE-377 | Insecure tmpfile | **NEVER APPLIES**. No tmp dir, no fs. |
  | CWE-94 / CWE-95 | Code injection / eval | APPLIES. Does our code feed string input to the pkg's eval / Function-constructor sinks? Audit `libs/ui-chat/*` rendering paths and any styled-components / antd dynamic template paths. |
  | CWE-79 | XSS | APPLIES — real surface. `libs/ui-chat` renders agent-backend Markdown through `react-markdown` + `remark-gfm` + `rehype-raw` (raw HTML allowed). Audit Signal C hits — does the call site sanitize, restrict the schema, or feed attacker-influenceable markdown straight in? Check what fields are rendered and whether the agent backend's outputs are sanitized. |
  | CWE-1321 | Prototype pollution | APPLIES. Does the pkg merge / extend objects with attacker-influenced keys? Audit React Query cache merges, `setState` updates that spread server responses, `Object.assign` / `lodash.merge` paths. The build-time `lodash` via styled-components is already allowlisted (build-time only). |
  | CWE-918 | SSRF | APPLIES narrowly. Audit `libs/util-constants-and-types/src/lib/constants/urls.ts` for the hardcoded URL list. Does the pkg follow redirects or accept caller-controllable URLs? Unless app code passes user input into the dep's fetch path, the SSRF surface is essentially nil. |
  | CWE-295 / CWE-297 / CWE-345 | TLS / cert bypass | **NEVER APPLIES**. Browser handles TLS; deps cannot override. |
  | CWE-400 / CWE-770 / CWE-1333 | DoS — memory / regex / unbounded | APPLIES moderately. ReDoS in `react-markdown` linkify / `remark-gfm` table parsing freezes the chat surface. Browser tab dies if the renderer hangs but there's no service-availability multiplier. |
  | CWE-502 | Untrusted deserialization | APPLIES. JSON.parse on backend responses (`fetch().then(r => r.json())` is the dominant pattern), ABI/RLP decoding in `viem` (babydegen-ui only), Markdown parsing. Backend is first-party but its responses are not necessarily sanitized at the source. |
  | CWE-200 / CWE-201 / CWE-209 / CWE-532 | Info disclosure / logging | APPLIES narrowly. We do NOT write logs to disk. `console.error` is visible to anyone with devtools. No "support bundle" feature. A CVE that logs cookies / auth state is narrower because there's no auth and no cookies on the browser side (the backend is localhost-only). |
  | Next.js SSR-specific CVEs | — | **NEVER APPLIES**. This repo uses Vite, not Next. No `next` dep at any tier. (Confirm via `yarn why next`.) |
  | Express / Koa / Fastify cookie / session CVEs | — | **NEVER APPLIES**. No server in this repo. |
  | Electron-specific CVEs | — | **NEVER APPLIES**. No Electron in this repo. |
  | React Router CVEs requiring routes / loaders / actions / `redirect()` / Data router / Framework mode | — | **NEVER APPLIES in this repo** (worked precedent: `@remix-run/router` GHSA-2w69-qvjg-hvjx in `.supply-chain/audit-allowlist.json`). No app defines routes; `agentsfun-ui` wraps `<BrowserRouter>` only. **However**: a CVE in the imperative `<Link>` / `useNavigate` / hash-handling paths still applies if any app uses those primitives — verify before relying on the precedent. |

  Spell out which precondition fails for each Q.

  **Caveat: "preconditions absent" is the EXPLOITABILITY answer, not the recommended ACTION.** Even when a CVE is structurally unreachable, prefer to **fix via yarn resolution / pin bump** over dismissing, when:
  - Upstream has published a patched version
  - The fix is a one-line resolution or direct-dep bump (see §3.2 fix recipe)
  - No major-version conflicts in the tree (verify with `yarn why $PKG`)

  Dismissal as `inaccurate` is reserved for cases where there's no patch available, the upstream patch breaks something, or the resolution would force unacceptable cross-major churn. **The three existing entries in `.supply-chain/audit-allowlist.json` are the worked precedent for durable structural unreachability** — `@remix-run/router` (no routes), build-time `lodash` (no `_.template` call from the styled-components plugin), build-time `picomatch` (only developer-authored static glob input). When an unreachability is durable and re-attestable, prefer the allowlist over a `dismissed_reason=inaccurate` decision at the Dependabot level — the allowlist re-prompts the maintainer at the `review` date.

- **§2.5.3** Mark each Q `reachable` / `absent` / `unknown` against the calling code (read the actual `.ts` / `.tsx` / `.js` files in `PROD_HIT_FILES`).
- **§2.5.4** Vulnerable-symbol grep: extract code-like tokens from the GHSA description (functions, class.method, option keys, JSX prop names); grep `PROD_HIT_FILES` for each.
- **§2.5.5** Archetype multiplier: this repo is **nx-monorepo-of-static-react-spas** — narrower on host-resource CVEs (no shell, no fs), wider on browser-renderer CVEs (XSS via `rehype-raw`, prototype pollution via merge gadgets). The CVE doesn't need to show a narrow chain; the absence of a chain is a strong signal, but the presence of plausible chain keeps it PROD.
- **§2.5.6** Confidence tier (`high` / `moderate` / `low`). Only `high` permits autonomous `inaccurate` dismissal. Sparse-advisory cap: ≤1 derivable Q ⇒ moderate ceiling. Multi-app reachability (same pkg imported from all three apps, or from a lib that every app uses) caps at moderate — too broad to dismiss without per-app reasoning.
- **§2.5.7** Action matrix:

  | Preconditions | Confidence | Verdict | Action |
  | --- | --- | --- | --- |
  | All `reachable` | any | PROD-APPLICABLE | Open issue. If confidence != high, additionally label `needs-human-review`. |
  | Any `absent` | high | NOT-APPLICABLE | Dismiss with `inaccurate` (Phase 3.1b). |
  | Any `absent` | moderate / low | NOT-APPLICABLE (low-conf) | Open issue + `needs-human-review`. Do NOT dismiss. |
  | Any `unknown` | any | PROD-APPLICABLE | Open issue + `needs-human-review`. |

- **§2.5.8** PoC harness explicitly out-of-scope. If a `moderate` / `low` dismissal is challenged by maintainer, PoC verification is the documented escalation path.

### 2.6 Transitive reverse-resolve

For pkgs that appear in `yarn.lock` but nowhere in source, figure out which **direct** dep pulled them in. Run `yarn why` from the repo root:

```bash
PKG_SAFE="${PKG//\//_}"
yarn why "$PKG" 2>/dev/null > "$TMP/yarn_why_${PKG_SAFE}.txt"
REVERSE_DEP_ROOT=$(grep -E "Found|Reasons|Hoisted from" "$TMP/yarn_why_${PKG_SAFE}.txt" 2>/dev/null | head -3 | tr '\n' '; ')
```

The reverse-dep root tells the dismissal comment which build chain pulled the pkg in — useful context for future maintainers (the existing allowlist entries cite this kind of chain explicitly: `styled-components > babel-plugin-styled-components > lodash`).

---

## Phase 3 — Act

For each alert, take exactly one action: **skip**, **dismiss**, or **open issue**. Build a per-alert audit record so Phase 4 summary is honest.

When `MODE=rerun-dismissed`, **Phase 3.0 runs instead of 3.1 / 3.1b / 3.2 / 3.3**.

### 3.0 Rerun-dismissed report mode (read-only)

```bash
# Run §2.4 (Signal C) + §2.5 (if PROD) for the alert, producing $VERDICT and
# $NEW_REASON. Compare to recorded dismissed_reason.
RECORDED_REASON=$(jq -r ".[$i].dismissed_reason" "$TMP/alerts.json")

if [[ "$VERDICT" == "DEV" ]]; then
  NEW_REASON="not_used"
elif [[ "$VERDICT" == "NOT-APPLICABLE" && "$CONFIDENCE" == "high" ]]; then
  NEW_REASON="inaccurate"
else
  NEW_REASON="open-issue"
fi

case "${RECORDED_REASON}:${NEW_REASON}" in
  "${RECORDED_REASON}:${RECORDED_REASON}")
    AGREE+=("$ALERT_NUM $PKG $GHSA_ID ($RECORDED_REASON)") ;;
  "not_used:inaccurate" | "inaccurate:not_used")
    REFINE+=("$ALERT_NUM $PKG $GHSA_ID (was=$RECORDED_REASON now=$NEW_REASON)") ;;
  *":open-issue")
    DRIFT+=("$ALERT_NUM $PKG $GHSA_ID (was=$RECORDED_REASON now=open-issue)") ;;
  *)
    OTHER+=("$ALERT_NUM $PKG $GHSA_ID (was=$RECORDED_REASON now=$NEW_REASON)") ;;
esac
```

End-of-run: print agree/refine/drift/other counts. Never auto-reopen a dismissed alert — surface drift only. Exit `0` if `DRIFT` is empty, `1` otherwise.

### 3.1 Dismiss a DEV-only alert (`not_used`)

```bash
# Step 1 — open the closed audit-trail issue (§3.1c). Symmetric with §3.1b.
DISMISSAL_REASON="not_used"
AUDIT_URL=$(create_audit_issue)
[[ -n "$AUDIT_URL" ]] || {
  echo "ERROR: audit issue creation failed for #$ALERT_NUM — abort dismissal"
  SKIPPED+=("$ALERT_NUM:audit-create-error"); continue;
}

# Step 2 — terse 280-char comment with audit-issue URL pointer.
DISMISS_COMMENT="\`$PKG\` not imported from apps/*/src or libs/*/src PROD source. Build/test tooling only. Full analysis: $AUDIT_URL"
if [[ -z "$DEV_HIT_FILES" ]]; then
  DISMISS_COMMENT="\`$PKG\` not imported anywhere in repo. Transitive of build/test tooling. Full analysis: $AUDIT_URL"
fi
[[ ${#DISMISS_COMMENT} -gt 280 ]] && DISMISS_COMMENT="${DISMISS_COMMENT:0:277}..."

# Step 3 — dismiss.
gh api -X PATCH "repos/$REPO/dependabot/alerts/$ALERT_NUM" \
  -f state="dismissed" \
  -f dismissed_reason="not_used" \
  -f dismissed_comment="$DISMISS_COMMENT" \
  --jq '.state' \
  || { echo "ERROR: failed to dismiss alert #$ALERT_NUM"; SKIPPED+=("$ALERT_NUM:dismiss-api-error:$AUDIT_URL"); continue; }

DISMISSED+=("$ALERT_NUM $PKG $GHSA_ID (not_used)")
```

The GitHub-documented `dismissed_reason` enum is `fix_started`, `inaccurate`, `no_bandwidth`, `not_used`, `tolerable_risk`. The skill uses **two**: `not_used` and `inaccurate`. Never use `tolerable_risk` — that's the maintainer's risk-accept call (and `.supply-chain/audit-allowlist.json` is where it lives). Never use `fix_started` / `no_bandwidth`.

### 3.1b Dismiss a NOT-APPLICABLE alert (`inaccurate`, high-confidence only)

Reached only when Signal C found PROD imports AND §2.5.7 returned NOT-APPLICABLE at high confidence.

```bash
[[ "$VERDICT" == "NOT-APPLICABLE" ]] \
  || { echo "guard: only NOT-APPLICABLE reaches 3.1b"; continue; }
[[ "$CONFIDENCE" == "high" ]] \
  || { echo "guard: 3.1b requires high confidence — route to 3.2 with needs-human-review"; continue; }

DISMISSAL_REASON="inaccurate"
AUDIT_URL=$(create_audit_issue)
[[ -n "$AUDIT_URL" ]] || {
  echo "ERROR: audit issue creation failed for #$ALERT_NUM — abort dismissal"
  SKIPPED+=("$ALERT_NUM:audit-create-error"); continue;
}

DISMISS_COMMENT="\`$PKG\` CVE not applicable to nx-monorepo-of-static-react-spas runtime (high-conf, archetype posture). Full analysis: $AUDIT_URL"
[[ ${#DISMISS_COMMENT} -gt 280 ]] && DISMISS_COMMENT="${DISMISS_COMMENT:0:277}..."

gh api -X PATCH "repos/$REPO/dependabot/alerts/$ALERT_NUM" \
  -f state="dismissed" \
  -f dismissed_reason="inaccurate" \
  -f dismissed_comment="$DISMISS_COMMENT" \
  --jq '.state' \
  || {
    echo "ERROR: failed to dismiss alert #$ALERT_NUM (audit issue $AUDIT_URL was already created)"
    SKIPPED+=("$ALERT_NUM:dismiss-api-error:$AUDIT_URL"); continue;
  }

DISMISSED+=("$ALERT_NUM $PKG $GHSA_ID (inaccurate, high-conf)")
```

### 3.1c Open a closed audit-trail issue (every dismissal)

Long-form audit record. Created closed (`gh issue create` then immediate `gh issue close`) so it doesn't appear in default "open issues" views but is searchable via `gh issue list --state closed --label security-audit`.

```bash
# called as: AUDIT_URL=$(create_audit_issue)
create_audit_issue() {
  local audit_title audit_body audit_url body_analysis

  # Safety defaults — §2.5 is supposed to populate these before §3.1b, but if
  # an unset var crashes the heredoc AFTER the dismissal PATCH succeeded, the
  # alert is dismissed with no audit trail (worst failure mode). These `:=`
  # defaults are the safety net.
  : "${ADVISORY_SUMMARY:=(not populated — see §2.5.1)}"
  : "${CWE_CHECKLIST_ANSWERS:=(not populated — see §2.5.2)}"
  : "${SYMBOL_TRACE_RESULT:=(not populated — see §2.5.4)}"
  : "${APPLICABILITY_REASONING:=(not populated — see §2.5.7)}"
  : "${CONFIDENCE:=}"
  : "${SEVERITY:=}"
  : "${CVE_ID:=n/a}"
  : "${CWE_IDS:=}"
  : "${VULN_RANGE:=}"
  : "${FIRST_PATCHED:=}"
  : "${MANIFEST_PATH:=}"
  : "${DEV_HIT_FILES:=}"
  : "${PROD_HIT_FILES:=}"
  : "${PKG_GROUP:=}"
  : "${REVERSE_DEP_ROOT:=}"

  audit_title="[Security-audit][closed] ${PKG} #${ALERT_NUM} (${GHSA_ID}) — ${DISMISSAL_REASON}"
  [[ ${#audit_title} -gt 70 ]] && audit_title="${audit_title:0:67}..."

  case "$DISMISSAL_REASON" in
    not_used)
      body_analysis=$(cat <<EOF
## Classification: not reachable from apps/*/src or libs/*/src (Signal C)

The package is not reachable from the source set that ships in any of the per-app static ZIP bundles:
- Apps: \`apps/agentsfun-ui/src/**\`, \`apps/babydegen-ui/src/**\`, \`apps/predict-ui/src/**\`
- Libs: \`libs/{ui-chat,ui-error-boundary,ui-pill,ui-theme,util-constants-and-types,util-functions}/src/lib/**\`

Phase 2.5 (exploit-surface analysis) was NOT run — the verdict is mechanical: zero PROD imports means the package's code never executes in any deployed app bundle.

**Signal C scan results:**
- PROD imports found: 0
- DEV imports found at: ${DEV_HIT_FILES:-none (pure transitive of build/test tooling)}
- Signal A scope: \`${SCOPE:-unknown}\`
- Signal B group: \`${PKG_GROUP}\` (root package.json)
- Manifest: \`${MANIFEST_PATH}\`
- Reverse-dep root: ${REVERSE_DEP_ROOT:-N/A}

**Why this is a safe dismissal:** the deployed artifacts are the three per-app static ZIP bundles produced by Vite (\`agentsfun-ui-build.zip\`, \`babydegen-ui-build.zip\`, \`predict-ui-build.zip\`), each attached to a GitHub Release. They contain only the compiled output of \`apps/<app>/src/**\` plus whichever libs that app imports — pure browser HTML/JS/CSS, no Node.js runtime. Test files (\`*.spec.*\`, \`*.test.*\`, \`*.stories.*\`), \`apps/*/__tests__/\`, root \`scripts/\`, \`coverage/\`, \`dist/\`, and the Nx / Vite / Jest / ESLint / Prettier / TypeScript toolchains never ship.

**Re-evaluate if:** any file under \`apps/*/src/**\` or \`libs/*/src/lib/**\` (excluding spec files) adds an import of \`${PKG}\`, or the deployment model changes (e.g. a new app, a new lib, or a switch to an SSR framework).
EOF
)
      ;;
    inaccurate)
      body_analysis=$(cat <<EOF
## Advisory summary (§2.5.1)

${ADVISORY_SUMMARY}

## Derived precondition checklist (§2.5.2)

Each Q below is derived per-advisory from the GHSA description (and optionally §2.5.1b MITRE supplement), then answered against this codebase in §2.5.3.

${CWE_CHECKLIST_ANSWERS}

## Vulnerable-symbol trace (§2.5.4)

${SYMBOL_TRACE_RESULT}

## Decisive reasoning

${APPLICABILITY_REASONING}

## Why this is a safe dismissal

The package IS imported from PROD source (Signal C: ${PROD_HIT_FILES}), but the CVE's preconditions are not satisfied in this repo. The \`nx-monorepo-of-static-react-spas\` archetype's narrowing — each app deploys as a pure static HTML/JS/CSS bundle with no Node.js runtime, no SSR, no \`spawn()\`, no fs access, no Electron main process — eliminates the structurally-impossible preconditions; the remaining ones marked \`absent\` were verified against the calling code.

**Re-evaluate if:** an app grows server-side code (an API server, an SSR migration, an Electron wrapper), starts rendering user-supplied content beyond the existing agent-Markdown surface in \`libs/ui-chat\`, or a new dep introduces a precondition that was previously absent.
EOF
)
      ;;
    *)
      body_analysis="(unknown dismissal reason: $DISMISSAL_REASON — please review)"
      ;;
  esac

  audit_body=$(cat <<EOF
**Dismissed Dependabot alert:** #${ALERT_NUM} — ${ALERT_URL}
**Package:** \`${PKG}\` (${ECOSYSTEM})
**Severity:** ${SEVERITY}
**GHSA / CVE:** ${GHSA_ID} / ${CVE_ID}
**CWE(s):** ${CWE_IDS}
**Vulnerable range:** \`${VULN_RANGE}\` — first patched in \`${FIRST_PATCHED}\`
**Manifest:** \`${MANIFEST_PATH}\`
**Archetype:** nx-monorepo-of-static-react-spas
**Skill confidence:** ${CONFIDENCE:-n/a (not_used path)}
**Dismissal reason:** \`${DISMISSAL_REASON}\` (this audit issue is auto-closed)

${body_analysis}

## How to challenge this dismissal

If you (the maintainer) judge any answer wrong:
1. Reopen the Dependabot alert via the GitHub Security tab.
2. Reopen this audit issue and comment with the corrected analysis + evidence.
3. If the corrected analysis shows the CVE is applicable, fix via a yarn resolution / direct-dep bump (see §3.2's fix recipe). If it's a durable structural unreachability that re-attests cleanly per review cycle, add to \`.supply-chain/audit-allowlist.json\` — the three existing entries (\`@remix-run/router\`, build-time \`lodash\`, build-time \`picomatch\`) are the worked precedent.

Skill: \`.claude/skills/triage-security/SKILL.md\` — see commit log for version.
EOF
)

  audit_url=$(gh issue create --repo "$REPO" \
    --title "$audit_title" \
    --label "security,dependabot,triage-security,security-audit" \
    --body "$audit_body") || return 1

  gh issue close "$audit_url" --repo "$REPO" \
    --comment "Auto-closed — see alert ${ALERT_URL} for the live state." >/dev/null 2>&1 || true

  echo "$audit_url"
}
```

The `security-audit` label and the other four MUST be pre-created idempotently (see §0.7).

### 3.2 Open a tracking issue for an APPLICABLE alert

```bash
# Dedupe by GHSA ID across ALL states. Maintainer may have manually closed
# a prior tracking issue; searching only --state open would miss it and
# re-open a duplicate.
EXISTING=$(gh issue list --repo "$REPO" --state all --search "\"$GHSA_ID\" in:title,body" --json number,url,state --jq '.[0]')
if [[ -n "$EXISTING" ]]; then
  EXISTING_URL=$(echo "$EXISTING" | jq -r '.url')
  EXISTING_STATE=$(echo "$EXISTING" | jq -r '.state')
  echo "skip: existing $EXISTING_STATE issue for $GHSA_ID at $EXISTING_URL"
  SKIPPED+=("$ALERT_NUM:existing-issue($EXISTING_STATE):$EXISTING_URL")
  continue
fi
```

Build the title:

```bash
PKG_LOWER=$(tr '[:upper:]' '[:lower:]' <<<"$PKG")
SUM_LOWER=$(tr '[:upper:]' '[:lower:]' <<<"$SUMMARY")
RAW="$SUMMARY"
if [[ "$SUM_LOWER" == "${PKG_LOWER}: "* ]]; then
  RAW="${SUMMARY:$((${#PKG}+2))}"
elif [[ "$SUM_LOWER" == "${PKG_LOWER} "* ]]; then
  RAW="${SUMMARY:$((${#PKG}+1))}"
fi
RAW="${RAW%.}"
RAW="$(tr '[:lower:]' '[:upper:]' <<<"${RAW:0:1}")${RAW:1}"
PREFIX="[Security][${SEVERITY}] ${PKG}: "
BUDGET=$((70 - ${#PREFIX}))
if [[ ${#RAW} -gt $BUDGET ]]; then
  SUMMARY_SHORT="${RAW:0:$((BUDGET-1))}…"
else
  SUMMARY_SHORT="$RAW"
fi
TITLE="${PREFIX}${SUMMARY_SHORT}"

LABELS="security,dependabot,triage-security"
[[ "$NEEDS_REVIEW" == "true" ]] && LABELS="$LABELS,needs-human-review"

PROD_HIT_FILES_BULLETED=$(printf '%s\n' "$PROD_HIT_FILES" | sed 's/^/- `/;s/$/`/')

ISSUE_URL=$(gh issue create --repo "$REPO" \
  --title "$TITLE" \
  --label "$LABELS" \
  --body "$(cat <<EOF
## Dependabot alert

- Alert: $ALERT_URL
- Package: \`$PKG\` ($ECOSYSTEM)
- Severity: **$SEVERITY**
- GHSA: $GHSA_ID
- CVE: $CVE_ID
- CWE(s): $CWE_IDS
- Vulnerable range: \`$VULN_RANGE\`
- First patched: \`$FIRST_PATCHED\`
- Manifest: \`$MANIFEST_PATH\`

## Summary

$ADVISORY_SUMMARY

## Reachability from PROD source

The vulnerable package is imported from the following files (shipped in at least one per-app static ZIP bundle):

$PROD_HIT_FILES_BULLETED

(Scan covered \`apps/{agentsfun-ui,babydegen-ui,predict-ui}/src/**\` and \`libs/{ui-chat,ui-error-boundary,ui-pill,ui-theme,util-constants-and-types,util-functions}/src/lib/**\`. Files matching \`*.spec.*\` / \`*.test.*\` / \`*.stories.*\`, and paths under \`apps/*/__tests__/\`, \`/node_modules/\`, \`/.nx/\`, \`/coverage/\`, \`/dist/\` were excluded. Root \`scripts/\` is DEV.)

## Exploit-surface analysis

**Archetype:** nx-monorepo-of-static-react-spas (Vite + React 19 + Ant Design 5 + styled-components 5 + TanStack Query 5; static HTML/JS/CSS deployment via per-app ZIPs attached to GitHub Releases)
**Skill verdict:** $VERDICT
**Skill confidence:** $CONFIDENCE

**CWE checklist (§2.5.2):**
$CWE_CHECKLIST_ANSWERS

**Vulnerable-symbol trace (§2.5.4):**
$SYMBOL_TRACE_RESULT

**Reasoning:** $APPLICABILITY_REASONING

If this issue carries the \`needs-human-review\` label, the skill's confidence was below the threshold for autonomous dismissal. Maintainer decision: either (a) bump the dep / pin via Yarn \`resolution\` in root \`package.json\`, or (b) dismiss the linked Dependabot alert with reason \`inaccurate\` + comment naming the missing precondition, or (c) add to \`.supply-chain/audit-allowlist.json\` if the unreachability is durable.

## Suggested fix (single-tree recipe)

This repo has a **single yarn tree** at the root (Nx hoists all deps). Exact-version pins are enforced — no \`^\` or \`~\` — per \`SUPPLY-CHAIN-SECURITY.md\` and \`.npmrc\`'s \`save-exact=true\`.

Direct dep — bump the exact-version pin in root \`package.json\`.

Transitive — add a Yarn \`resolutions\` entry to root \`package.json\`. Yarn 1 forms:
1. **Unscoped** \`"pkg": "X.Y.Z"\` — forces a single version across the tree.
2. **Path-scoped** \`"**/parent/pkg": "X.Y.Z"\` — forces pkg only when nested under parent. The \`**/\` prefix is mandatory.

After any change, **delete \`yarn.lock\` and reinstall**:

\`\`\`bash
rm -f yarn.lock
yarn install
yarn audit:install-hooks:update    # regenerate install-hook allowlist if hooks changed
yarn audit:prod                    # confirm audit gate is clean (NOTE: 'audit:prod', not 'audit')
git add package.json yarn.lock .supply-chain/install-hooks.allowlist
\`\`\`

**Worked precedent** — the three existing \`.supply-chain/audit-allowlist.json\` entries from PR #105 are the durable-unreachability template:
- \`@remix-run/router\` GHSA-2w69-qvjg-hvjx — XSS via redirect requires React Router Framework / Data / RSC mode; no app defines routes.
- \`lodash\` GHSA-r5fr-rjxr-66jc — reached only via \`babel-plugin-styled-components\` at build time; \`_.template\` not invoked.
- \`picomatch\` GHSA-c2c7-rcm5-vvqj — reached only via \`babel-plugin-styled-components\` at build time; only developer-authored static globs.

If the CVE on \`$PKG\` has the same durable-unreachability shape, add an allowlist entry instead of dismissing at the Dependabot level — the allowlist re-attests at the \`review\` date.

## Why this issue exists

Triaged by the \`triage-security\` skill. The Dependabot alert remains open as the source of truth; this issue tracks the in-repo work.
EOF
)")

echo "opened: $ISSUE_URL for $GHSA_ID"
OPENED+=("$ALERT_NUM $PKG $GHSA_ID $ISSUE_URL")
```

The Dependabot alert is **not** dismissed for PROD-applicable cases — it stays open and is the canonical record.

### 3.3 Skip (unclassifiable / allowlisted / unsupported ecosystem)

```bash
if grep -qxF "$GHSA_ID" /tmp/ts_allowlisted_ghsas.txt 2>/dev/null; then
  ALLOWLISTED+=("$ALERT_NUM $PKG $GHSA_ID (already in audit-allowlist)")
  echo "SKIP #$ALERT_NUM: $PKG ($GHSA_ID) — allowlisted in .supply-chain/audit-allowlist.json"
  continue
fi

if [[ "$ECOSYSTEM" != "npm" ]]; then
  SKIPPED_ECOSYSTEM+=("$ALERT_NUM:$ECOSYSTEM")
  echo "SKIP #$ALERT_NUM: ecosystem=$ECOSYSTEM (skill is npm-only)" >&2
  continue
fi

echo "SKIP #$ALERT_NUM: $PKG ($GHSA_ID) — unclassifiable. Manual review: $ALERT_URL" >&2
SKIPPED_UNCLASS+=("$ALERT_NUM $PKG $GHSA_ID")
```

---

## Phase 4 — Summary

**Live mode only** — `--rerun-dismissed` produces its own report (§3.0).

```
=== triage-security summary for $REPO ===
Alerts seen:        $N_ALERTS
Processed:          $N_PROCESS (respects --limit)

Dismissed (DEV-only, not_used):          $N_DISMISSED_DEV
Dismissed (PROD-not-applic, inaccurate): $N_DISMISSED_INACCURATE
Issue opened (PROD-applicable):          $N_OPENED_APPLICABLE
Issue opened (needs-human-review):       $N_OPENED_REVIEW

Audit-trail issues opened (closed):      $N_AUDIT_ISSUES
Allowlisted (in audit-allowlist):        $N_ALLOWLISTED

Skipped (unsupported ecosystem):         $N_SKIPPED_ECOSYSTEM    (informational)
Skipped (unclassifiable):                $N_SKIPPED_UNCLASS      (exits 1 if > 0)

Dismissed alerts:
  #N axios     GHSA-…   (not_used — only in build/test tooling)
  ...

Opened issues:
  #N  …/issues/N  GHSA-…  react-markdown  (PROD-applicable, ui-chat)
  ...

Allowlisted (already accepted by maintainer — no action taken):
  #M  GHSA-2w69-qvjg-hvjx  @remix-run/router  (no routes defined)
  ...
```

The `needs-human-review` bucket is the primary calibration signal: if it grows over time, refine the §2.5.2 checklist derivation logic.

**Exit codes:**
- `0` if `N_SKIPPED_UNCLASS == 0` AND not in rerun-dismissed mode (or rerun mode had empty DRIFT).
- `1` if `N_SKIPPED_UNCLASS > 0` OR (rerun-dismissed mode AND DRIFT is non-empty).
- `unsupported-ecosystem` and `allowlisted` skips never affect exit code.

---

## Reference: full per-alert loop

```bash
set -euo pipefail
TMP=$(mktemp -d)
REPO=$(gh repo view --json owner,name --jq '"\(.owner.login)/\(.name)"')

# === Phase 0 setup (ALL required before the loop starts) ===
#   §0.1–§0.4b: CLI / repo / API / node-version checks
#   §0.5b: ALWAYS_PROD array (verbatim from §0.5b)
#   §0.6:  Allowlist → /tmp/ts_allowlisted_ghsas.txt
#   §0.7:  Labels pre-created
# === Phase 1 setup ===
#   argv parsed (LIMIT, MODE); alerts.json fetched; N_ALERTS / N_PROCESS computed

# ALWAYS_PROD — copy verbatim from §0.5b.
ALWAYS_PROD=(
  "react" "react-dom" "react-is"
  "react-router-dom" "react-router" "@remix-run/router"
  "antd" "@ant-design/.*" "@ant-design/icons"
  "styled-components" "@fontsource/inter"
  "@tanstack/react-query"
  "viem"
  "react-markdown" "remark-gfm" "rehype-raw"
  "remark.*" "rehype.*" "unified" "mdast.*" "hast.*" "micromark.*"
  "recharts" "chart\\.js" "react-chartjs-2" "chartjs-plugin-doughnutlabel"
  "lucide-react" "react-jazzicon" "react-infinite-scroll-component"
  "graphql" "graphql-request"
)

# PROD source set arrays — see §2.1.
APP_PROD_DIRS=( apps/agentsfun-ui/src apps/babydegen-ui/src apps/predict-ui/src )
LIB_PROD_DIRS=(
  libs/ui-chat/src libs/ui-error-boundary/src libs/ui-pill/src
  libs/ui-theme/src libs/util-constants-and-types/src libs/util-functions/src
)
PROD_DIRS=("${APP_PROD_DIRS[@]}" "${LIB_PROD_DIRS[@]}")
DEV_DIRS=(
  apps/agentsfun-ui/__tests__ apps/babydegen-ui/__tests__ apps/predict-ui/__tests__
  scripts
)
PROD_FILE_EXCLUDES='/(node_modules|\.nx|dist|coverage|__tests__|__mocks__)/|\.(spec|test|stories)\.(ts|tsx|js|jsx)$'

export ALWAYS_PROD APP_PROD_DIRS LIB_PROD_DIRS PROD_DIRS DEV_DIRS PROD_FILE_EXCLUDES

DISMISSED=(); OPENED=(); SKIPPED_ECOSYSTEM=(); SKIPPED_UNCLASS=(); ALLOWLISTED=()
AGREE=(); REFINE=(); DRIFT=(); OTHER=()

for i in $(seq 0 $((N_PROCESS-1))); do
  # === Per-iteration variable reset — CRITICAL under `set -u` ===
  VERDICT=""
  CONFIDENCE=""
  NEEDS_REVIEW="false"
  PROD_HITS=0
  DEV_HITS=0
  PROD_HIT_FILES=""
  DEV_HIT_FILES=""
  ALWAYS_PROD_HIT=""
  CLASSIFICATION_REASON=""
  ADVISORY_SUMMARY=""
  CWE_CHECKLIST_ANSWERS=""
  SYMBOL_TRACE_RESULT=""
  APPLICABILITY_REASONING=""
  CWE_IDS=""
  REVERSE_DEP_ROOT=""
  PKG_GROUP=""

  ALERT=$(jq ".[$i]" "$TMP/alerts.json")
  ALERT_NUM=$(jq -r '.number' <<<"$ALERT")
  ALERT_URL=$(jq -r '.html_url' <<<"$ALERT")
  ECOSYSTEM=$(jq -r '.security_vulnerability.package.ecosystem' <<<"$ALERT")
  PKG=$(jq -r '.security_vulnerability.package.name' <<<"$ALERT")
  SEVERITY=$(jq -r '.security_advisory.severity' <<<"$ALERT")
  GHSA_ID=$(jq -r '.security_advisory.ghsa_id' <<<"$ALERT")
  CVE_ID=$(jq -r '.security_advisory.cve_id // "n/a"' <<<"$ALERT")
  SUMMARY=$(jq -r '.security_advisory.summary' <<<"$ALERT")
  VULN_RANGE=$(jq -r '.security_vulnerability.vulnerable_version_range' <<<"$ALERT")
  FIRST_PATCHED=$(jq -r '.security_vulnerability.first_patched_version.identifier // "unknown"' <<<"$ALERT")
  MANIFEST_PATH=$(jq -r '.dependency.manifest_path' <<<"$ALERT")
  SCOPE=$(jq -r '.dependency.scope // "unknown"' <<<"$ALERT")

  # Filter 1: ecosystem
  if [[ "$ECOSYSTEM" != "npm" ]]; then
    SKIPPED_ECOSYSTEM+=("$ALERT_NUM:$ECOSYSTEM")
    continue
  fi

  # Filter 2: allowlist
  if grep -qxF "$GHSA_ID" /tmp/ts_allowlisted_ghsas.txt 2>/dev/null; then
    ALLOWLISTED+=("$ALERT_NUM $PKG $GHSA_ID")
    continue
  fi

  # … Signal A/B/C classification per Phase 2 …
  # … if PROD: Phase 2.5 exploit-surface analysis …
  # … take action per Phase 3 …
done

# … print Phase 4 summary …
```

---

## Hard rules

1. **Only act on `state=open` alerts** in live mode. `--rerun-dismissed` is strictly read-only.
2. **Skill is npm only.** Docker / GitHub Actions / pip alerts → log + skip with no exit-code impact.
3. **Skip allowlisted GHSAs** from `.supply-chain/audit-allowlist.json`. Maintainer's risk-accept calls are authoritative — the skill must not override.
4. **Conservative default: when uncertain, open an issue.** A false-positive issue is one `gh issue close` away; a false-negative dismissal hides a real vuln.
5. **Two dismissal reasons, strict criteria.** Both share a uniform audit-trail requirement.
   - **`not_used`** — Signal C proved the package is not reachable from PROD source AND not on §0.5b. Comment names the DEV paths (or "transitive of build/test tooling" for the no-imports-anywhere case).
   - **`inaccurate`** — §2.5 proved CVE preconditions absent AND §2.5.6 returned `high` confidence. Comment names which Q failed.

   **Required side-effect for both: open a closed audit-trail issue (§3.1c) BEFORE the dismissal, embed the audit URL in `dismissed_comment`.** The 280-char comment alone is never a complete audit trail.

   **Never use `tolerable_risk`, `fix_started`, `no_bandwidth`.** Risk-accept is the maintainer's call (and lives in `.supply-chain/audit-allowlist.json`).
6. **Always-PROD override is sticky.** If a package matches §0.5b, Signal C cannot down-classify it to DEV.
7. **Dedupe before opening.** Search existing issues by GHSA ID across `--state all`; never spam duplicates on repeat runs.
8. **Don't dismiss with no evidence.** Skip + log if signals are inconclusive.
9. **Print stderr lines for skips.** The summary table is for the actor; per-alert skip lines are for the paginating human reviewer.
10. **Exit non-zero only if `unclassifiable` skips happened OR rerun-dismissed mode found DRIFT.** `unsupported-ecosystem` and `allowlisted` skips are expected — exiting on them would fire on every run.
11. **Rerun-dismissed mode is strictly read-only.** No `gh api -X PATCH`, no `gh issue create`. Verdict-drift report to stdout only.

---

## Files / state mutated

| Surface | What changes |
| --- | --- |
| (rerun-dismissed mode) | Nothing — read-only report to stdout |
| Dependabot alerts — DEV-only (Signal C) | `state=dismissed`; `dismissed_reason=not_used`; comment = one-line summary + audit-issue URL |
| Dependabot alerts — PROD-but-not-applicable + high confidence | `state=dismissed`; `dismissed_reason=inaccurate`; comment = one-line summary + audit-issue URL |
| Closed audit-trail issues — one per dismissal | New issues opened **and immediately closed** with title `[Security-audit][closed] …`, labels `security,dependabot,triage-security,security-audit`. Searchable via `gh issue list --state closed --label security-audit`. |
| Repo issues — PROD-applicable | New issue, title `[Security][<sev>] <pkg>: <summary>`, labels `security,dependabot,triage-security`. Body carries the PROD reachability scan, §2.5 analysis, and the single-tree fix recipe. |
| Repo issues — PROD-not-applicable but autonomous-dismissal gate not met (moderate/low confidence) | Same as above, **additionally labeled `needs-human-review`**. Underlying Dependabot alert NOT dismissed. |
| Existing issues (dedupe match) | Skipped (no edit) |
| Labels | First-run idempotent creation of `security`, `dependabot`, `triage-security`, `needs-human-review`, `security-audit` |
| Working tree | Nothing — the skill only mutates GitHub state, not files. |

---

## When NOT to run this skill

- **Wrong repo** — the skill hard-fails Phase 0 unless `package.json` + `nx.json` + `apps/agentsfun-ui/` + `apps/babydegen-ui/` + `apps/predict-ui/` + `libs/` + `.supply-chain/audit-allowlist.json` all exist.
- **A dependency bump PR is in flight** — Signal C + Signal B read the current working tree; mid-bump state could misclassify. Land the bump first, then triage.
- **You're about to refresh `.supply-chain/audit-allowlist.json`** — do that first so the skill sees the new allowlist entries and skips them. Order is: edit allowlist → run skill → review summary.
- **Token doesn't have `security_events`** (or admin) scope on the repo — Dependabot dismissals require it. `gh auth status` should show the right scope.
- **Unsupported ecosystem alerts dominate the backlog** — current scope is npm. If alerts surface on GitHub Actions or Docker, Phase 2 needs parallel signal sets.
- **Working tree is dirty with uncommitted edits to `apps/` / `libs/`** — Signal C reads live tree, not git HEAD. Commit or stash first.
- **The current branch diverges significantly from `main`** — Dependabot alerts run on the default branch (`main`); Signal C runs against whatever branch is checked out. Make sure HEAD matches `main` for accurate classification.

### Rate-limit considerations

On a large alert backlog (~100+ open alerts), the skill makes many GitHub API calls per alert: advisory fetch (§2.5.1), dedupe search (§3.2), issue create + close (§3.1c), and the dismiss PATCH (§3.1 / §3.1b). At ~5 calls × 100 alerts = ~500 calls, you can brush against GitHub's secondary rate limit on the issues / search endpoints (~80 requests/minute).

The skill does NOT implement retry-with-backoff. If you hit a rate limit mid-run:

1. The current alert's PATCH or issue-create will fail and land in `SKIPPED` with an `api-error` tag.
2. **Re-running the skill is safe**: the §3.2 dedupe (across `--state all`) and the allowlist + dismissed-state checks at top of the loop will skip alerts already acted on.
3. Pace large runs with `--limit N` in batches of 50–80, waiting ~2 minutes between batches.

If rate-limit hits become routine, wrap `gh api` and `gh issue create` in a retry loop that sleeps 60s on a 403/429. Not implemented by default to keep the skill simple — most runs (especially `--rerun-dismissed`, which makes no mutations) won't trip the limit.

Note: per the `SUPPLY-CHAIN-SECURITY.md` policy, **"Dependabot security updates" auto-PRs are disabled** in this repo (alerts-only mode). Dependabot alert *generation* remains active — that's what feeds this skill. Don't conflate the two.

---

## Design notes

| Decision | Choice | Why |
| --- | --- | --- |
| Sources | Dependabot only | Snyk workflow exists (`.github/workflows/snyk-security.yml`) but is dormant until `SNYK_TOKEN` is configured. Gitleaks runs separately for secret-scanning. |
| Archetype | Fixed at `nx-monorepo-of-static-react-spas` | One deployment model (static ZIP attached to GitHub Release per app). One toolchain (Nx 21 + Vite 6 + React 19 + Ant Design 5 + styled-components 5 + TanStack Query 5). No per-app variation in the dependency graph — all three apps share the same root `package.json`. |
| PROD path definition | `apps/{agentsfun-ui,babydegen-ui,predict-ui}/src/**` + `libs/*/src/lib/**`; exclusion of tests by pattern (co-located in libs) and by directory (`apps/*/__tests__/`) | Mirrors what Vite actually pulls into the build. Pattern exclusion handles libs' co-located unit specs; directory exclusion handles the apps' dedicated `__tests__/` trees. |
| Allowlist matching | Single `.supply-chain/audit-allowlist.json`, keyed by **GHSA** (not numeric `id`) | Dependabot's payload exposes `ghsa_id` directly; the numeric `id` is yarn's, only available via `yarn audit --json`. The allowlist already carries both fields per its `_fields` schema. |
| Signal A weight | Reliable for direct deps; weak prior for transitives | The root `package.json` cleanly separates `dependencies` (~25 entries) from `devDependencies` (~50 entries). Dependabot inherits scope. Signal A decides for direct deps; Signal C decides for the much larger transitive layer. |
| Module resolution | Distribution name ≈ import name; `@types/*` short-circuited to DEV; `ALWAYS_PROD` override list; no other ecosystem | Asymmetric-failure protection — missing a PROD-reachable package is worse than open-issue-ing a build-tooling lookalike. |
| Fix recipe in opened issues | Single-tree fix recipe (one yarn tree); pin-bump or resolutions block in root `package.json`; existing three allowlist entries as worked precedent | Mirrors `SUPPLY-CHAIN-SECURITY.md`'s policy 1 (exact pins) and policy 5 (CI audit gate). |
| `set -u` + heredoc safety defaults | All §2.5 vars get `: "${VAR:=...}"` guards in `create_audit_issue` | Defence against the worst failure mode: dismissal PATCH succeeded → heredoc crashes on unset var → alert dismissed with no audit trail. |
| Multi-line import regex | `grep -Pzo` with `-z` (null-terminated) to span newlines | This repo's TS/JS uses multi-line named imports heavily (ESLint's `simple-import-sort` produces them). A line-by-line regex misses them and produces false `not_used` dismissals. |
| Always-PROD sanity probe | Direct `dependencies` entry with `PROD_HITS=0` forces PROD | Catches regex-evolution bugs without requiring perfect import-shape coverage. |
| Build scripts / Nx targets | DEV | `scripts/audit.mjs`, `scripts/audit-install-hooks.mjs`, `scripts/bundle-size.mjs`, `scripts/branch-protection-apply.sh` are supply-chain tooling. `vite.config.ts` / `jest.config.ts` / `eslint.config.mjs` evaluate at build time only. None ship in any per-app ZIP. |
| Snyk / Gitleaks | Out of scope for this skill | They report to GitHub Code Scanning (Snyk, when active) and stand-alone runs (Gitleaks), not to Dependabot alerts. Each has its own dashboard. |

### What this skill encodes from the repo's existing precedent

`.supply-chain/audit-allowlist.json` (added in the supply-chain rollout, PRs #102–#105) carries three entries that demonstrate the durable-unreachability pattern this skill defers to:

- **`@remix-run/router` GHSA-2w69-qvjg-hvjx** — XSS via redirect requires React Router Framework / Data / RSC modes. Every app in the monorepo uses Declarative Mode only and defines no routes. Re-attestable.
- **`lodash` GHSA-r5fr-rjxr-66jc** — reached via `styled-components 5.3.6 > babel-plugin-styled-components > lodash`. Build-time only. The vulnerable `_.template` sink is not invoked by the styled-components plugin and doesn't accept untrusted input.
- **`picomatch` GHSA-c2c7-rcm5-vvqj** — reached via the same `babel-plugin-styled-components` chain. The ReDoS path requires untrusted glob input; the plugin matches only developer-authored, static patterns at build time.

Empirical learnings carried into this skill:

- **The allowlist's `ghsa` field is the durable identifier.** Yarn 1's numeric `id` (also stored in the allowlist for the `audit:prod` script) is implementation-detail; Dependabot exposes `ghsa_id` and that's what the skill matches on.
- **`.supply-chain/audit-allowlist.json` is the preferred surface for durable structural unreachability.** Reserve `dismissed_reason=inaccurate` for one-off cases. If the same precondition argument applies to multiple advisories on the same package across many review cycles, add to the allowlist and let the gate re-attest at the `review:` date.
- **The allowlist's `review:` date is a re-attestation cue, not an expiry.** `scripts/audit.mjs` prints a `::warning::` on expired entries but doesn't fail. When the date hits, the maintainer re-reads the entry's `reason` against current code and either bumps the date or removes the entry.
- **The `audit:prod` script (NOT `audit`) is the canonical local check.** Yarn 1's built-in `yarn audit` subcommand shadows same-named scripts in `package.json` — the wrapper is renamed for that reason. After any dep change, run `yarn audit:prod` + `yarn audit:install-hooks` before opening a PR.

Operationally: **structural-unreachability cases on React Router CVEs (any CVE that requires routes / loaders / actions / `redirect()` / Data router / Framework mode) belong in the allowlist**, not the Dependabot dismissed-list — the "no routes defined" premise re-attests cleanly each cycle. Other CVEs — `lodash` prototype pollution (runtime), `viem` ABI decoding, `react-markdown` / `rehype-raw` XSS, anything in `antd` / `styled-components` actively rendered — generally don't have a durable unreachability argument and should be fixed by bump.

---
