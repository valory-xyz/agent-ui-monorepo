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
    TEST_PLAN.md  # 5-phase test coverage plan (target: 100%)
    BUGS.md       # Bugs found during static analysis
```

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
| Monorepo        | NX 21                                                                 |
| Framework       | React 19 + TypeScript 5.7                                             |
| Routing         | React Router DOM 6                                                    |
| Build           | Vite 6                                                                |
| Styling         | styled-components 5 + Ant Design 5                                    |
| Data fetching   | TanStack React Query 5                                                |
| API (agentsfun) | GraphQL via graphql-request                                           |
| Web3            | viem 2                                                                |
| Charts          | Recharts 3 (predict-ui), Chart.js 4 (babydegen-ui)                    |
| Unit testing    | Jest 29 + React Testing Library 16                                    |
| Node utilities  | ts-jest (node env); React components: babel-jest with @nx/react/babel |
| Package manager | Yarn (frozen lockfile in CI)                                          |
| Node version    | 22 (see `.nvmrc`)                                                     |

---

## Environment Variables

Each app reads env vars at build time via Vite. Copy `.env.example` → `.env` before running locally.

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

---

## Testing

Test infrastructure is already configured per project. See [docs/testing/TEST_PLAN.md](docs/testing/TEST_PLAN.md) for the current 6-phase coverage plan.
Current status: phases 1–6 are complete, with final 100% coverage achieved for `predict-ui`, `babydegen-ui`, and `agentsfun-ui`.

### Test file placement

Place spec files in the app's `__tests__/` directory, mirroring the `src/` structure:

```
src/hooks/useFeatures.ts
__tests__/hooks/useFeatures.spec.ts   ✓
```

Import paths from `__tests__/[subpath]/file.spec.ts` back into `src/`:

- depth 1 (`__tests__/hooks/`) → `../../src/hooks/foo`
- depth 2 (`__tests__/components/Chat/`) → `../../../src/components/Chat/foo`
- depth 3 (`__tests__/components/TradeHistory/PositionDetailsModal/`) → `../../../../src/...`

Use `.spec.tsx` extension whenever the file contains JSX, even if the source under test is a `.ts` file.

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

## Known Bugs

Documented in [docs/testing/BUGS.md](docs/testing/BUGS.md):

| ID      | Severity             | Summary                                                                           |
| ------- | -------------------- | --------------------------------------------------------------------------------- |
| BUG-003 | ~~Medium~~ **Fixed** | `EachChat` split to discriminated union; `handleChatError` simplified             |
| BUG-004 | ~~Low~~ **Fixed**    | `Pill` `type` made optional; `<Pill>` without type now gets `marginLeft: 0`       |
| BUG-005 | Low (partial)        | `donut-center-plugin.ts` ctx-after-destroy guarded; `onload` race deferred to E2E |

---

## CI/CD

Workflows in `.github/workflows/`:

| Workflow                 | Trigger            | What it does                                        |
| ------------------------ | ------------------ | --------------------------------------------------- |
| `check-pull-request.yml` | All PRs            | Lint + test all projects (with `--passWithNoTests`) |
| `agentsfun-ui-build.yml` | Tag `v*-agentsfun` | Build + create GitHub release with zip artifact     |
| `babydegen-ui-build.yml` | Tag `v*-babydegen` | Build + release                                     |
| `predict-ui-build.yml`   | Tag `v*-predict`   | Build + release                                     |
| `gitleaks.yml`           | All pushes         | Secret scanning                                     |

To release an app, push a tag in the format `v{version}-{app}`, e.g. `v1.2.0-predict`.

## Plans

- Make the plan extremely concise. Sacrifice grammar for the sake of concision.
- At the end of each plan, give me a list of unresolved questions to answer, if any.
