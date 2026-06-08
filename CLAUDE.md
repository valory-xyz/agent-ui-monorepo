# CLAUDE.md — agent-ui-monorepo

NX monorepo by Valory AG. Contains three React apps and six shared libraries for agent-based UIs.

---

## Repository Structure

```
apps/
  agentsfun-ui/   # Agents.fun social/memecoin UI            (dev 4300, preview 4400)
  babydegen-ui/  # Portfolio + withdrawal UI for Modius/Optimus  (dev 4300, preview 4400)
  predict-ui/    # Prediction-market UI for Omenstrat/Polystrat (dev 4200, preview 4300)

libs/
  ui-chat/                   # Chat (Chat, ViewChats, UnlockChat, useChats, handleChatError)
  ui-error-boundary/         # React class ErrorBoundary wrapper (renders Ant Alert fallback)
  ui-pill/                   # Pill badge + HaloDot animated halo dot
  ui-theme/                  # GlobalColors + GlobalStyles (styled-components, utility classes)
  util-constants-and-types/  # LOCAL, API_V1, AgentType, OLAS_ADDRESS, time, urls, Address type
  util-functions/            # delay, exponentialBackoffDelay, devMock, generateAgentName
```

> **Port collision:** agentsfun-ui and babydegen-ui both default to dev port 4300. They cannot run simultaneously without overriding one (`yarn nx dev <app> --port=<other>`).

### Path Aliases (tsconfig.base.json)

| Import                                        | Resolves to                                  |
| --------------------------------------------- | -------------------------------------------- |
| `@agent-ui-monorepo/ui-chat`                  | `libs/ui-chat/src/index.ts`                  |
| `@agent-ui-monorepo/ui-error-boundary`        | `libs/ui-error-boundary/src/index.ts`        |
| `@agent-ui-monorepo/ui-theme`                 | `libs/ui-theme/src/index.ts`                 |
| `@agent-ui-monorepo/ui-pill`                  | `libs/ui-pill/src/index.ts`                  |
| `@agent-ui-monorepo/util-constants-and-types` | `libs/util-constants-and-types/src/index.ts` |
| `@agent-ui-monorepo/util-functions`           | `libs/util-functions/src/index.ts`           |

---

## Common Commands

```bash
# Install dependencies
yarn install

# Dev servers
yarn nx dev agentsfun-ui       # http://localhost:4300
yarn nx dev babydegen-ui
yarn nx dev predict-ui

# Build
yarn nx build agentsfun-ui
yarn nx build babydegen-ui
yarn nx build predict-ui

# Build all publishable libraries
yarn nx run-many --target=build --projects=ui-chat,ui-pill,ui-error-boundary,ui-theme

# Test — single project
yarn nx test predict-ui
yarn nx test util-functions

# Test — all projects
yarn nx run-many --target=test --all

# Test — with coverage
yarn nx run-many --target=test --all --coverage

# Test — only affected by current changes
yarn nx affected --target=test

# Lint
yarn lint          # all projects
yarn lint:fix      # fix auto-fixable issues
yarn nx lint predict-ui   # single project
```

---

## Tech Stack

| Concern         | Tool                                                                  |
| --------------- | --------------------------------------------------------------------- |
| Monorepo        | NX 21 (targets are Nx-plugin-inferred — apps/libs `project.json` files have empty `targets: {}`) |
| Framework       | React 19 + TypeScript 5.7                                             |
| Routing         | React Router DOM 6 is in deps but **no app defines actual routes** — all three apps are single-page; agentsfun-ui wraps in `BrowserRouter` only |
| Build           | Vite 6                                                                |
| Styling         | styled-components 5 + Ant Design 5                                    |
| Data fetching   | TanStack React Query 5 (no GraphQL — every app calls REST via `fetch`; `graphql`/`graphql-request` are in root deps but unused) |
| Web3            | viem 2 — used in babydegen-ui only (`isAddress` for withdrawal validation). predict-ui and agentsfun-ui do not import it |
| Charts          | Recharts 3 (predict-ui ProfitOverTime), Chart.js 4 + react-chartjs-2 (babydegen-ui AllocationPie with custom donut-center plugin) |
| Markdown        | react-markdown + remark-gfm + rehype-raw (used by ui-chat for system messages) |
| Unit testing    | Jest 29 + React Testing Library 16                                    |
| Node utilities  | ts-jest (node env); React components: babel-jest with @nx/react/babel |
| Package manager | Yarn (frozen lockfile in CI)                                          |
| Node version    | 24 (`.nvmrc` pins `v24.15.0`; CI uses `24.x`)                         |

---

## Backend API

All three apps hit the **same locally-running agent process** — there is no remote API. Endpoints are built from constants in `libs/util-constants-and-types/src/lib/constants/local.ts`:

```ts
export const LOCAL  = 'http://127.0.0.1:8716';
export const API_V1 = `${LOCAL}/api/v1`;
```

| App           | Endpoints used                                                                                                                                                                |
| ------------- | ----------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| agentsfun-ui  | `LOCAL/{agent-info, features, x-activity, memecoin-activity, performance-summary, media}`                                                                                     |
| babydegen-ui  | `LOCAL/{features, portfolio, withdrawal/amount}`; `POST LOCAL/withdrawal/initiate`; `GET LOCAL/withdrawal/status/:id`                                                         |
| predict-ui    | `LOCAL/features`; `API_V1/{agent/details, agent/performance, agent/profit-over-time?window=…, agent/prediction-history?page=…, agent/position-details/:id, agent/trading-details, withdrawal}` |

`AgentType` (union: `predict | modius | optimus | agentsFun | polystrat_trader | omenstrat_trader`) is exported from `libs/util-constants-and-types/src/lib/constants/agents.ts` and consumed by `ui-chat` to switch chat presentation.

---

## Environment Variables

Each app reads env vars at build time via Vite (`define` block injects them into `process.env.*`). Copy `.env.example` → `.env` before running locally.

### `predict-ui` — required

| Variable               | Values                                   | Effect                                                                                |
| ---------------------- | ---------------------------------------- | ------------------------------------------------------------------------------------- |
| `REACT_APP_AGENT_NAME` | `omenstrat_trader` \| `polystrat_trader` | Determines agent type; warns and defaults to `omenstrat_trader` if missing or invalid |
| `IS_MOCK_ENABLED`      | `true` \| `false`                        | Use mock data instead of live API calls                                               |

### `babydegen-ui` — required

| Variable               | Values                                | Effect                          |
| ---------------------- | ------------------------------------- | ------------------------------- |
| `REACT_APP_AGENT_NAME` | `modius` \| anything else → `optimus` | Determines agent type and chain |
| `IS_MOCK_ENABLED`      | `true` \| `false`                     | Use mock data                   |

### Testing — set in Jest setup

```ts
// Required for predict-ui tests (agentMap.ts reads env at module load time)
process.env.REACT_APP_AGENT_NAME = 'omenstrat_trader';
process.env.IS_MOCK_ENABLED = 'false';
```

### How mocks are gated

Every hook follows the same pattern (see `libs/util-functions/src/lib/devMock.ts`):

```ts
const queryFn = async () => {
  const mock = devMock(() => delay(mockData));
  if (mock !== null) return mock; // IS_MOCK_ENABLED=true → returns mock with 2s delay
  return fetch(`${LOCAL}/endpoint`).then((r) => r.json());
};
```

`devMock.ts` is `istanbul ignore file` — Jest setup forces `IS_MOCK_ENABLED=false` so the mock branch never executes in tests. To exercise mock-mode code paths in tests, use `.mock.spec.ts` files (the established convention: `useFeatures.mock.spec.ts`, `usePortfolio.mock.spec.ts`, etc.) that set `IS_MOCK_ENABLED=true` before `require()`-ing the hook.

### React Query retry — single shared helper

All `useQuery`/`useMutation` calls use `exponentialBackoffDelay` from `@agent-ui-monorepo/util-functions` (`1000 * 2^failureCount`, capped at **30 seconds**). Do not roll your own.

---

## Testing

Test infrastructure is already configured per project. **All 9 projects (3 apps + 6 libs) are at 100% statements/branches/functions/lines** with `collectCoverageFrom` explicitly configured in every `jest.config.ts` so no source file is silently excluded. Intentional exclusions (type-only files, entry points, plain constant objects, canvas-dependent plugin) are commented inline in each jest config.

### Test file placement

**Apps use `__tests__/`; libs co-locate.** This is intentional and consistent across the monorepo — match the pattern when adding new tests.

**Apps** — mirror `src/` under `__tests__/`:

```
apps/predict-ui/src/hooks/useFeatures.ts
apps/predict-ui/__tests__/hooks/useFeatures.spec.ts   ✓
```

Import paths from `__tests__/[subpath]/file.spec.ts` back into `src/`:

- depth 1 (`__tests__/hooks/`) → `../../src/hooks/foo`
- depth 2 (`__tests__/components/Chat/`) → `../../../src/components/Chat/foo`
- depth 3 (`__tests__/components/TradeHistory/PositionDetailsModal/`) → `../../../../src/...`

**Libs** — spec files sit next to source in `src/lib/`:

```
libs/ui-chat/src/lib/Chat.tsx
libs/ui-chat/src/lib/Chat.spec.tsx   ✓
```

Use `.spec.tsx` whenever the file contains JSX, even if the source under test is a `.ts` file.

### Test environments

- **React components** (`apps/`, UI libs): `jest-environment-jsdom` + `babel-jest` with `@nx/react/babel`
- **Pure utilities** (`util-functions`, `util-constants-and-types`): `jest-environment-node` + `ts-jest`

### React Query wrapper (reuse in hook/component tests)

```ts
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { render } from '@testing-library/react';

export const renderWithQueryClient = (ui: ReactNode) => {
  const queryClient = new QueryClient({
    defaultOptions: { queries: { retry: false } },
  });
  return render(<QueryClientProvider client={queryClient}>{ui}</QueryClientProvider>);
};
```

### Testing modules with env-var-dependent module-level code

**Standard pattern — `jest.resetModules()` + dynamic `require()`:**

Set the env var, then call `jest.resetModules()` so the next `require()` re-evaluates the module fresh. Do NOT use static imports.

```ts
beforeEach(() => {
  jest.resetModules();
  process.env.REACT_APP_AGENT_NAME = 'omenstrat_trader';
});

it('sets omenstrat agent', () => {
  const { agentType } = require('../utils/agentMap');
  expect(agentType).toBe('omenstrat_trader');
});
```

**`jest.isolateModules` — only when you need multiple env shapes in one file and the module under test has no React hooks:**

`jest.isolateModules` gives each callback its own module registry, so you can test different env values in the same file without cross-contamination. However it can break React hook state; **do not use it for modules that render components or call hooks**.

**React components that read env at import time:** create a dedicated spec file per env shape and set the env var in `setupFilesAfterEnv` (or the Jest `globals` config). This avoids both `resetModules` churn and hook-state issues.

### Mocking fetch

```ts
global.fetch = jest.fn().mockResolvedValue({
  ok: true,
  json: () => Promise.resolve(mockData),
});
afterEach(() => jest.restoreAllMocks());
```

---

## Project Conventions

- **Styling:** styled-components for layout/structure; Ant Design components for UI primitives (Button, Table, Modal, etc.)
- **State:** TanStack React Query for all server state — no Redux or Zustand
- **Hooks:** each app has its own `hooks/` directory; shared data types live in `util-constants-and-types`
- **Mock data:** every app has a `mocks/` directory used when `IS_MOCK_ENABLED=true`; reuse these in tests
- **Error handling:** use the shared `ErrorBoundary` from `ui-error-boundary` at the app shell level
- **Retry logic:** use `exponentialBackoffDelay` from `util-functions` for all React Query `retryDelay`
- **Imports:** ESLint enforces `simple-import-sort` — run `yarn lint:fix` before committing
- **Formatting:** Prettier with single quotes (`.prettierrc`)
- **TypeScript:** Never use `any` or `as any` — use `unknown`, a proper type, or a typed intermediate variable

---

## Per-app notes

### `agentsfun-ui`
- Single-page dashboard: Persona → Performance → XActivity → MemecoinActivity → ChatContent (gated by `useFeatures().isChatEnabled`) → AiGeneratedMedia.
- Background: pastel radial + conic gradients in `src/app/app.tsx`. Custom Ant Design theme in `src/constants/theme.ts` (primary `#2F54EB`).
- IPFS media is served from `gateway.autonolas.tech/ipfs/`; external links go to X (`X_URL`, `X_POST_URL`) and Agents.fun (`AGENTS_FUN_URL`).

### `babydegen-ui`
- Sections: Portfolio (with breakdown modal) → Allocation (Chart.js donut + Ant Table) → StrategyAndChat (gated) → WithdrawAgentsFunds.
- `src/utils/agentMap.ts` keys off `REACT_APP_AGENT_NAME`: `modius` → display "Modius" on **Mode** chain; anything else → "Optimus" on **Optimism**. Each agent has its own primary color, network logo (`mode-network.png`/`optimism-network.png`), and pie-chart palette (`src/utils/chartjs/palette.ts`).
- **AllocationPie uses a custom Chart.js plugin** (`src/utils/chartjs/donut-center-plugin.ts`) that loads the chain logo image and calls `chart.update()` once it resolves. This file is excluded from coverage (requires `jest-canvas-mock` or E2E).
- **Withdrawal state machine** in `useWithdrawFunds.ts`: POST `/withdrawal/initiate` captures `withdrawId` → query `/withdrawal/status/:id` is gated by `enabled: !!withdrawId` and polls every 2s until `status === 'completed'`. Address validated client-side with `viem`'s `isAddress`.

### `predict-ui`
- Layout (no router): AgentDetails → Performance → ProfitOverTime (Recharts) → TradeHistory (paginated with PositionDetailsModal) → Strategy → ChatContent (gated) → WithdrawLockedFunds.
- `REACT_APP_AGENT_NAME` ∈ {`omenstrat_trader`, `polystrat_trader`}; falls back to `omenstrat_trader` with a console warning if missing/invalid. Theme + background image + market label (`"Omen"` vs `"Polymarket"`) switch on the value.
- `src/env.d.ts` augments `ImportMetaEnv`. `src/hooks/useTradeHistory.ts` adds an artificial 1s delay for pagination UX.
- **Withdrawal state machine** in `useWithdrawLockedFunds.ts`: states `idle → armed → selling → complete/errored`. POST `/withdrawal` arms the flow; the GET query polls every 2s while `armed` or `selling`; on terminal state, the hook invalidates the performance query so `funds_locked_in_markets` refreshes.
- External: `POLYMARKET_PROFILE_BASE_URL`, `OMEN_SUBGRAPH_URL`, `OLAS_AGENTS_SUBGRAPH_URL`, OLAS-on-xDAI price via CoinGecko.

---

## CI/CD

Workflows in `.github/workflows/` — every workflow that runs `yarn` reads Node from `.nvmrc` (currently `v24.15.0`) and activates Corepack-pinned `yarn@1.22.22` before installing. The `packageManager` pin in `package.json` is silently ignored without that activation.

| Workflow                 | Trigger                                            | What it does                                                   |
| ------------------------ | -------------------------------------------------- | -------------------------------------------------------------- |
| `check-pull-request.yml` | PRs to any branch                                  | `nx run-many --target=lint` + `nx run-many --target=test --passWithNoTests`. **No build, no typecheck.** |
| `agentsfun-ui-build.yml` | Tag `v*-agentsfun`                                 | Builds and releases `agentsfun-ui-build.zip`                   |
| `babydegen-ui-build.yml` | Tag `v*-modius` **or** `v*-optimus`                | Sets `REACT_APP_AGENT_NAME` from the tag suffix, builds, and releases `babydegen-ui-build.zip` |
| `predict-ui-build.yml`   | Tag `v*-omenstrat-trader` **or** `v*-polystrat-trader` | Sets `REACT_APP_AGENT_NAME` (`omenstrat_trader`/`polystrat_trader`), builds, and releases `predict-ui-build.zip` |
| `gitleaks.yml`           | PRs to any branch                                  | Downloads gitleaks `v8.30.1` (SHA256-verified) and scans full history against `.gitleaks.toml` |

Releases are created with `softprops/action-gh-release@v1` + `generate_release_notes: true`. The same tag may be matched by `babydegen` and `predict` workflows — **the agent identity comes from the tag suffix, not from a separate `babydegen`/`predict` namespace**.

## Supply chain & security

Policy lives in [`SUPPLY-CHAIN-SECURITY.md`](SUPPLY-CHAIN-SECURITY.md). Quick map of the moving parts so future sessions don't re-derive them:

- **Audit gate (`yarn audit:prod`).** Wraps `yarn audit --groups dependencies --json` because Yarn 1.x's `--level high` filters output, not exit code. Lives at [`scripts/audit.mjs`](scripts/audit.mjs); allowlist at [`.supply-chain/audit-allowlist.json`](.supply-chain/audit-allowlist.json) — every entry needs `reason` + `review` (YYYY-MM-DD).
- **Install-hook gate (`yarn audit:install-hooks`).** Walks `node_modules` for non-trivial `pre/install/postinstall` scripts and diffs against [`.supply-chain/install-hooks.allowlist`](.supply-chain/install-hooks.allowlist). Regenerate with `yarn audit:install-hooks:update` after any dep change.
- **License gate (`yarn license-check`).** Backend `liccheck` parity, PARANOID/fail-closed: every installed dep's SPDX license must resolve against [`.supply-chain/license-allowlist.json`](.supply-chain/license-allowlist.json) or the job fails. Lives at [`scripts/license-check.mjs`](scripts/license-check.mjs) (uses the `license-checker-rseidelsohn` **devDep**); the SPDX evaluator is unit-tested via `yarn license-check:test` (Node built-in runner, no added dep). Tree is **0 violations** today — the gate is a ratchet. See [`SUPPLY-CHAIN-SECURITY.md`](SUPPLY-CHAIN-SECURITY.md) §9.
- **CI gates wired in `.github/workflows/`:** `supply-chain.yml` (audit + install-hooks + lockfile-lint + license-check + all-checks-passed aggregator + weekly Mon 07:17 UTC cron with Issue-based failure alert), `gitleaks.yml` (v8.30.1, SHA256-verified download), `bundle-size.yml` (warn-only PR comment on ±10% delta), `snyk-security.yml` (dormant until `SNYK_TOKEN` is set + Snyk org adds the repo), `check-pull-request.yml` (lint + test). Three release workflows delegate to `_build-app.yml` reusable workflow.
- **Naming gotcha:** the audit script is `audit:prod`, **never `audit`**. Yarn 1.x's built-in `yarn audit` subcommand shadows same-named entries in `package.json` scripts.
- **Dependabot:** alerts-only policy. No `.github/dependabot.yml`, "Dependabot security updates" disabled in Settings. Don't re-enable auto-PRs without team agreement — the policy and history are documented in `SUPPLY-CHAIN-SECURITY.md`.
- **Branch protection** ([`scripts/branch-protection-apply.sh`](scripts/branch-protection-apply.sh)). Required contexts: `All checks passed` (Check Pull Request aggregator), `Supply chain checks passed` (Supply Chain aggregator), `Run Gitleaks`. Cross-workflow `needs:` is unsupported, hence three separate contexts with deliberately distinct names.
- **Tools that look like dependencies but aren't:** `lockfile-lint` is invoked via `npx --yes` in `supply-chain.yml` to avoid committing it to `package.json`. `gitleaks` is downloaded + SHA256-verified per-run.

If `yarn audit:prod` starts failing locally, the first thing to check is whether the `.supply-chain/audit-allowlist.json` entry's `review` date has passed (warning) or a new advisory was published (blocking).

## Plans

- Make the plan extremely concise. Sacrifice grammar for the sake of concision.
- At the end of each plan, give me a list of unresolved questions to answer, if any.
