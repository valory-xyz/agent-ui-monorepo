# CLAUDE.md — agent-ui-monorepo

NX monorepo by Valory AG. Contains three React apps and six shared libraries for agent-based UIs.

---

## Repository Structure

```
apps/
  agentsfun-ui/   # Agents.fun social/memecoin UI (port 4300)
  babydegen-ui/   # Portfolio & withdrawal UI for Modius/Optimus agents
  predict-ui/     # Prediction-market trading UI for Omenstrat/Polystrat agents

libs/
  ui-chat/                   # Chat component (Chat, ViewChats, UnlockChat, useChats)
  ui-error-boundary/         # React class ErrorBoundary wrapper
  ui-pill/                   # Pill badge + HaloDot animation component
  ui-theme/                  # GlobalColors + GlobalStyles (styled-components)
  util-constants-and-types/  # Shared addresses, symbols, time, URL constants, TS types
  util-functions/            # delay(), exponentialBackoffDelay(), generateAgentName()

docs/
  testing/
    TEST_PLAN.md  # 6-phase test coverage plan (target: 40%)
    BUGS.md       # Bugs found during static analysis
```

### Path Aliases (tsconfig.base.json)

| Import | Resolves to |
|--------|------------|
| `@agent-ui-monorepo/ui-chat` | `libs/ui-chat/src/index.ts` |
| `@agent-ui-monorepo/ui-error-boundary` | `libs/ui-error-boundary/src/index.ts` |
| `@agent-ui-monorepo/ui-theme` | `libs/ui-theme/src/index.ts` |
| `@agent-ui-monorepo/ui-pill` | `libs/ui-pill/src/index.ts` |
| `@agent-ui-monorepo/util-constants-and-types` | `libs/util-constants-and-types/src/index.ts` |
| `@agent-ui-monorepo/util-functions` | `libs/util-functions/src/index.ts` |

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

| Concern | Tool |
|---------|------|
| Monorepo | NX 21 |
| Framework | React 19 + TypeScript 5.7 |
| Routing | React Router DOM 6 |
| Build | Vite 6 |
| Styling | styled-components 5 + Ant Design 5 |
| Data fetching | TanStack React Query 5 |
| API (agentsfun) | GraphQL via graphql-request |
| Web3 | viem 2 |
| Charts | Recharts 3 (predict-ui), Chart.js 4 (babydegen-ui) |
| Unit testing | Jest 29 + React Testing Library 16 |
| Node utilities | ts-jest (node env); React components: babel-jest with @nx/react/babel |
| Package manager | Yarn (frozen lockfile in CI) |
| Node version | 22 (see `.nvmrc`) |

---

## Environment Variables

Each app reads env vars at build time via Vite. Copy `.env.example` → `.env` before running locally.

### `predict-ui` — required

| Variable | Values | Effect |
|----------|--------|--------|
| `REACT_APP_AGENT_NAME` | `omenstrat_trader` \| `polystrat_trader` | Determines agent type; **throws at module load if missing or invalid** — see [BUGS.md](docs/testing/BUGS.md) BUG-001 |
| `IS_MOCK_ENABLED` | `true` \| `false` | Use mock data instead of live API calls |

### `babydegen-ui` — required

| Variable | Values | Effect |
|----------|--------|--------|
| `REACT_APP_AGENT_NAME` | `modius` \| anything else → `optimus` | Determines agent type and chain |
| `IS_MOCK_ENABLED` | `true` \| `false` | Use mock data |

### Testing — set in Jest setup

```ts
// Required for predict-ui tests (agentMap.ts throws without this)
process.env.REACT_APP_AGENT_NAME = 'omenstrat_trader';
process.env.IS_MOCK_ENABLED = 'false';
```

---

## Testing

Test infrastructure is already configured per project. See [docs/testing/TEST_PLAN.md](docs/testing/TEST_PLAN.md) for the full 12-phase coverage plan targeting 100%.
The plan is broken into incremental PRs so coverage climbs steadily: phases 1–4 reach ~35%, phases 5–8 reach ~65%, phases 9–12 reach ~100%.

### Test file placement

Place spec files next to the source file they test:

```
src/lib/utils.ts
src/lib/utils.spec.ts   ✓
```

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

Use `jest.resetModules()` + dynamic `require()` — do NOT use static imports:

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

---

## Known Bugs

Documented in [docs/testing/BUGS.md](docs/testing/BUGS.md):

| ID | Severity | Summary |
|----|----------|---------|
| BUG-001 | Critical | `predict-ui/agentMap.ts` IIFE throws at module load if env var is missing |
| BUG-002 | Medium | `getTimeAgo()` returns negative strings for future timestamps |
| BUG-003 | Medium | `handleChatError` silently drops ReactNode user messages on error |
| BUG-004 | Low | `Pill` `hasType` is always `true` — dead code branch |
| BUG-005 | Low | `donut-center-plugin.ts` `onload` race condition + stale context |

---

## CI/CD

Workflows in `.github/workflows/`:

| Workflow | Trigger | What it does |
|----------|---------|--------------|
| `check-pull-request.yml` | All PRs | Lint + test all projects (with `--passWithNoTests`) |
| `agentsfun-ui-build.yml` | Tag `v*-agentsfun` | Build + create GitHub release with zip artifact |
| `babydegen-ui-build.yml` | Tag `v*-babydegen` | Build + release |
| `predict-ui-build.yml` | Tag `v*-predict` | Build + release |
| `gitleaks.yml` | All pushes | Secret scanning |

To release an app, push a tag in the format `v{version}-{app}`, e.g. `v1.2.0-predict`.
