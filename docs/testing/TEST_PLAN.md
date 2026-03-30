# Test Coverage Plan — agent-ui-monorepo

**Goal:** 100% coverage across all meaningful source files, delivered in 5 PRs.
**Starting state:** 2 test files exist (`generateAgentName.spec.ts`, `app.spec.tsx` smoke test).

| Phase | Status | Tests | Coverage highlights |
|---|---|---|---|
| 1 — Shared Libraries | ✅ Done | 130 passing | `util-functions` 100%, `util-constants-and-types` 100%, `ui-error-boundary` 100%, `ui-theme` 100%, `ui-pill` 100% statements/functions (88.9% branch — BUG-004 dead branch), `ui-chat` 94.2% statements |
| 2 — `predict-ui` | ✅ Done | 103 passing | 94.75% statements / 87.85% branch / 91.2% functions / 95.3% lines |
| 3 — `babydegen-ui` | ✅ Done | 79 passing | 96.15% statements / 95.12% branch / 93.18% functions / 97.89% lines |
| 4 — `agentsfun-ui` | 🔲 Pending | — | Currently 35.6% statements (smoke test only) |
| 5 — Coverage gaps | 🔲 Pending | — | — |

---

## Explicitly Skipped (no runtime logic to test)

| Category | Files |
|---|---|
| Type declarations | All `types.ts`, `env.d.ts`, `*.d.ts` |
| Barrel exports | All `index.ts` re-export files |
| SVG/image assets | `agentsfun-ui/components/svgs/`, `assets/Polymarket.tsx` |
| Plain constant objects | `constants/theme.ts`, `constants/colors.ts`, `constants/sizes.ts`, `constants/reactQueryKeys.ts`, `constants/urls.ts` (predict-ui), `ui-chat/constants.tsx` |
| CSS injection | `ui-theme/GlobalStyles.tsx` |
| Canvas plugin | `babydegen-ui/utils/chartjs/donut-center-plugin.ts` — needs `jest-canvas-mock`, defer to E2E |
| Color palette | `babydegen-ui/utils/chartjs/palette.ts` — array of strings |

---

## Test Conventions

- **File placement:** `apps/<app>/__tests__/[subpath]/file.spec.ts` — mirrors `src/` structure. Import paths: depth-1 → `../../src/`, depth-2 → `../../../src/`, depth-3 → `../../../../src/`.
- **No `any`:** Never use `as any` or type `any` in test files. Use `unknown`, the actual class type, or a typed intermediate variable.
- **Null guards:** Instead of `result!.foo`, use `if (!result) throw new Error('...')` then access `result.foo`.
- **Fetch mocking:** Use `global.fetch = jest.fn()` (not `jest.spyOn(global, 'fetch')`) in jsdom environments.
- **Module-level env vars:** Default to `jest.resetModules()` + dynamic `require()` after setting the env var. Use `jest.isolateModules` only when testing multiple env shapes in one file and the module has no React hooks (it can break hook state). For React components, use a dedicated spec file with the env var set in `setupFilesAfterEnv`. See CLAUDE.md for the full decision tree.

---

## Phase 1 — Shared Libraries ✅
**Branch:** `test/phase-1-shared-libs` | **Projects:** `util-functions`, `util-constants-and-types`, `ui-error-boundary`, `ui-pill`, `ui-theme`, `ui-chat`

| File | Spec | Key cases |
|---|---|---|
| `util-functions/delay.ts` | `delay.spec.ts` ✅ | Resolves with value; custom duration; `delayInSeconds=0`; `null`/object/number generics; timer precision boundaries |
| `util-functions/reactQuery.ts` | `reactQuery.spec.ts` ✅ | Attempts 0–5 exact ms values; cap at 30000 for attempt 5+ |
| `util-functions/generateAgentName.ts` | `generateAgentName.spec.ts` ✅ (extended) | Format regex; determinism; different addresses differ; non-hex input; suffix range `[0,99]`; empty string; all-zeros; very long address |
| `util-constants-and-types/constants` | `constants.spec.ts` ✅ | `NA`; `UNICODE_SYMBOLS` shape + non-empty values; all 7 time constants with ascending-order invariant; `LOCAL`, `API_V1`, `GNOSIS_SCAN_URL`, `X_URL`, `X_POST_URL`, `AGENTS_FUN_URL`; `OLAS_ADDRESS` hex format |
| `ui-error-boundary/ErrorBoundary.tsx` | `ErrorBoundary.spec.tsx` ✅ | Renders children; default + custom message on throw; children hidden; `console.error` called; `getDerivedStateFromError` returns `{ hasError, errorMessage }`; recovery via key change |
| `ui-pill/Pill.tsx` | `Pill.spec.tsx` ✅ | Renders children; all 3 types' background colors; `size="small"` padding `2px 4px 2px 16px`; `size="large"` padding `6px 12px`; `HaloDot` present; BUG-004 regression (`marginLeft` always `-28px`) |
| `ui-pill/HaloDot.tsx` | `HaloDot.spec.tsx` ✅ | Renders a `div`; different `dotColor`/`size`/`haloScale` produce distinct CSS classes; matching `haloColor` (opacity 0.25) vs mismatched (opacity 0.9) produce distinct classes; default props produce same class as explicit defaults; `dotColor` injected into document styles |
| `ui-theme/GlobalColors.ts` | `GlobalColors.spec.ts` ✅ | Defined; all 12 expected keys; every value non-empty string; `WHITE`/`BLACK` exact values |
| `ui-chat/utils.ts` | `utils.spec.tsx` ✅ | Error notification shown + fallback message; `null` for empty/agent/system chats; rollback state + `updatedChats` for user string; `null` for ReactNode (BUG-003 regression); original array not mutated |
| `ui-chat/UnlockChat.tsx` | `UnlockChat.spec.tsx` ✅ | Heading + full instruction text; lock icon; `MEDIUM_GRAY` applied to icon by default; custom `iconColor` applied; different colors produce different styles |
| `ui-chat/Chat.tsx` | `Chat.spec.tsx` ✅ | Empty chats → logo; non-empty → `ViewChats`; `onSend` on click + Enter; Shift+Enter no-op; loading spinner; placeholder per `agentType`; button color/background for all 4 agent type branches; textarea font size for `small`/`large` |
| `ui-chat/ViewChats.tsx` | `ViewChats.spec.tsx` ✅ | All chats rendered; agent logo per type (all 5); user chat no logo; system chat no logo; string → ReactMarkdown; ReactNode direct render; scroll-to-bottom on change; `size="large"` |
| `ui-chat/useChats.ts` | `useChats.spec.ts` ✅ | `isPending`/`mutateAsync` shape; POSTs correct endpoint + headers + body; resolves with JSON; throws `data.error`; throws default message; throws on JSON parse failure; network error propagated; non-mock path uses `fetch` |

---

## Phase 2 — `predict-ui` ✅
**Branch:** `mohandas/ope-1376-phase-2-and-3-implement-unit-testing-for-agentsui-monorepo`
**Coverage:** 94.75% statements / 87.85% branch / 91.2% functions / 95.3% lines (103 tests)

### Bugs fixed in this phase
- **BUG-001** fixed: `agentMap.ts` IIFE replaced with `console.warn` + graceful fallback to `'omenstrat_trader'`
- **BUG-002** fixed: `getTimeAgo` guards with `Math.max(0, Date.now() - ms)` — also fixed pluralisation (`!== 1` instead of `> 1` so "0 minutes" is correct)

### Infrastructure added
- `apps/predict-ui/jest.config.ts` — project Jest config with `babel-jest` transform
- `apps/predict-ui/jest.setup.ts` — sets `REACT_APP_AGENT_NAME`, `IS_MOCK_ENABLED`, and `window.matchMedia` mock (required by Ant Design `useBreakpoint`)
- `apps/predict-ui/tsconfig.spec.json` — TypeScript config for test compilation

### Utilities & Constants

| File | Spec | Key cases |
|---|---|---|
| `utils/time.ts` — `getTimeAgo` | `time.spec.ts` ✅ | Minutes/hours/days/months (singular + plural); `showPostfix=false`; BUG-002 regression: future timestamp → "0 minutes ago" |
| `utils/time.ts` — `formatDuration` | *(same file)* ✅ | `0→"0m"`; `30→"0m"`; `60→"1m"`; `3600→"1h 0m"`; `86400→"1d 0h"`; `-100→"0m"` |
| `utils/urls.ts` | `urls.spec.ts` ✅ | With address → full URL; `undefined` → `undefined`; `""` → `undefined` |
| `utils/agentMap.ts` | `agentMap.spec.ts` ✅ | `jest.resetModules()` + dynamic `require()`. omenstrat/polystrat → correct type; invalid/undefined → warns + defaults (BUG-001 regression) |
| `constants/currency.ts` | `currency.spec.ts` ✅ | All 4 keys including `USDC.e`; every symbol is `$` |
| `constants/textMaps.ts` | `textMaps.spec.ts` ✅ | `risky` → `'Risky'`; `balanced` → `'Balanced'` |

### Hooks (mock `fetch` globally; note: hooks use `retry: 5`/`Infinity` overriding `QueryClient` defaults)

| Hook | Spec | Key cases |
|---|---|---|
| `useAgentDetails` | `useAgentDetails.spec.ts` ✅ | Calls `/agent/details` + `/agent/performance`; loading/data states |
| `useTradeHistory` | `useTradeHistory.spec.ts` ✅ | URL includes `page` + `page_size`; data state; mocks `delay` from `util-functions` (1-second pause in queryFn) |
| `usePositionDetails` | *(same file)* ✅ | Calls `/agent/position-details/{id}`; data state |
| `useProfitOverTime` | `useProfitOverTime.spec.ts` ✅ | URL includes `window`; all window values work |
| `useTradingDetails` | `useTradingDetails.spec.ts` ✅ | Calls `/agent/trading-details`; data state |
| `useFeatures` | `useFeatures.spec.ts` ✅ | Calls `/features`; `isChatEnabled` returned |

### Components (mock all hooks with `jest.mock`)

| Component | Spec | Key cases |
|---|---|---|
| `ui/Card.tsx` | `Card.spec.tsx` ✅ | Renders children; `CardV2` variant |
| `ui/Alert.tsx` | `Alert.spec.tsx` ✅ | `type="error"` and `type="warning"`; message + description |
| `ErrorState.tsx` | `ErrorState.spec.tsx` ✅ | Title, description, SVG icon |
| `AgentDetails.tsx` | `AgentDetails.spec.tsx` ✅ | ISO dates → relative time; missing props → NA |
| `Performance.tsx` | `Performance.spec.tsx` ✅ | All 6 metrics; `null` accuracy → text; `0` accuracy → "0.00%"; Intl formatting |
| `Strategy.tsx` | `Strategy.spec.tsx` ✅ | Loading skeleton; strategy name + description; no data → n/a |
| `TradeStatus.tsx` | `TradeStatus.spec.tsx` ✅ | won/lost/invalid/pending states; countdown; null profit → n/a; `Math.abs` on negative |
| `TradeHistory.tsx` | `TradeHistory.spec.tsx` ✅ | Loading/empty/data states; Polymarket button absent for omenstrat; "Yes"/"No" for prediction_side; row click opens modal |
| `Trade.tsx` | `Trade.spec.tsx` ✅ | Strategy shown/hidden; prediction tool shown/hidden; rounded scores; `placed_at` date |
| `PositionDetailsModal.tsx` | `PositionDetailsModal.spec.tsx` ✅ | Loading/error/invalid states; Won/To win/Payout labels; single vs multiple bets |
| `ProfitOverTime.tsx` | `ProfitOverTime.spec.tsx` ✅ | Loading/error/empty/data states; window switcher visibility |
| `ProfitOverTime/Chart.tsx` | `Chart.spec.tsx` ✅ | Renders with data/empty/custom currency; mocks Recharts to capture tooltip content fn; profit/loss/zero/NaN/undefined/empty payload/empty label tooltip cases |
| `Chat/SystemChat.tsx` | `SystemChat.spec.tsx` ✅ | "Strategy updated:" label; from/to pills |
| `Chat/Chat.tsx` | `Chat.spec.tsx` ✅ | Empty input → no send; loading state; sends on Enter; 3 queries invalidated on success; onSuccess adds agent reasoning/system chat; onError rolls back text input |
| `app/agent.tsx` | `agent.spec.tsx` ✅ | Loading/error/not-found/full-render; UnlockChat when chat disabled; null when features loading |
| `app/app.tsx` | `app.spec.tsx` ✅ | Smoke test |

---

## Phase 3 — `babydegen-ui` ✅
**Branch:** `mohandas/ope-1376-phase-2-and-3-implement-unit-testing-for-agentsui-monorepo`
**Coverage:** 96.15% statements / 95.12% branch / 93.18% functions / 97.89% lines (79 tests)

### Bugs fixed in this phase
- **BUG-005** fixed: `donut-center-plugin.ts` — added `if (chart.canvas)` guard in `onload` callback to prevent ctx use after chart destroy

### Infrastructure added
- `apps/babydegen-ui/jest.config.ts` — project Jest config
- `apps/babydegen-ui/jest.setup.ts` — sets `REACT_APP_AGENT_NAME=modius`, `IS_MOCK_ENABLED=false`, and `window.matchMedia` mock

### Utilities & Hooks

| File | Spec | Key cases |
|---|---|---|
| `utils/agentMap.ts` | `agentMap.spec.ts` ✅ | modius/optimus/undefined; `agentName`, `agentChainName`; no throw on any input |
| `hooks/usePortfolio` | `usePortfolio.spec.ts` ✅ | Calls `/portfolio`; data state |
| `hooks/useFeatures` | `useFeatures.spec.ts` ✅ | Calls `/features`; `isChatEnabled` returned |
| `WithdrawAgentsFunds/useFunds` | `useFunds.spec.ts` ✅ | Calls `/withdrawal/amount`; data state |
| `WithdrawAgentsFunds/useWithdrawFunds` | `useWithdrawFunds.spec.ts` ✅ | `initiateWithdraw` POSTs to `/withdrawal/initiate`; status query enabled after ID set; `isError` on failure |

### Components

| Component | Spec | Key cases |
|---|---|---|
| `ui/CardTitle.tsx` | `CardTitle.spec.tsx` ✅ | Renders string and ReactNode `text` prop |
| `ui/Pill.tsx` | `Pill.spec.tsx` ✅ | Children; type variants; size variants; custom style |
| `components/ErrorBoundary.tsx` | `ErrorBoundary.spec.tsx` ✅ | Children/default/custom message; `getDerivedStateFromError`; `console.error` called |
| `Portfolio/Portfolio.tsx` | `Portfolio.spec.tsx` ✅ | Title; loading skeleton; balance; ROI; See breakdown button disabled without data |
| `Portfolio/BreakdownModal.tsx` | `BreakdownModal.spec.tsx` ✅ | Title when open; no data → "No data available."; table rows with data; closed → no render |
| `Allocation/Allocation.tsx` | `Allocation.spec.tsx` ✅ | Title rendered; smoke test |
| `Allocation/AllocationAssets.tsx` | `AllocationAssets.spec.tsx` ✅ | Empty array → null; single/multiple assets; correct badge count |
| `Allocation/AllocationPie.tsx` | `AllocationPie.spec.tsx` ✅ | Loading skeleton; Doughnut with valid data + correct labels; fallback for null/invalid allocations. Mocks `react-chartjs-2` and `donut-center-plugin` |
| `Allocation/AllocationTable.tsx` | `AllocationTable.spec.tsx` ✅ | Loading spinner; column headers; row per allocation; APR with % suffix; empty state |
| `Strategy/Strategy.tsx` | `Strategy.spec.tsx` ✅ | Loading skeleton; N/A without trading_type; Balanced/Risky pills; "No protocols" |
| `WithdrawAgentsFunds/WithdrawAgentsFunds.tsx` | `WithdrawAgentsFunds.spec.tsx` ✅ | Initial title/button; shows `WithdrawInvestedFunds` + updated title after click |
| `WithdrawAgentsFunds/WithdrawInvestedFunds.tsx` | `WithdrawInvestedFunds.spec.tsx` ✅ | Default state: funds amount, n/a fallback, loading skeleton, address validation, initiate call; failed/completed/initiated/withdrawing states; transaction link |
| `Chat/SystemChat.tsx` | `SystemChat.spec.tsx` ✅ | "Trading strategy updated:" label; from/to pills; "Operating protocols updated:"; N/A for empty |
| `Chat/Chat.tsx` | `Chat.spec.tsx` ✅ | Empty/whitespace input guards; user message added; input cleared; mutateAsync called; onSuccess: reasoning→agent chat, trading type→system chat, protocols→system chat, no-push on empty/null; onError: notification + rollback |
| `App.tsx` | `App.spec.tsx` ✅ | Smoke test |

---

## Phase 4 — `agentsfun-ui`
**Branch:** `test/phase-4-agentsfun-ui`

### Utilities & Hooks

| File | Key cases |
|---|---|
| `utils/date.ts` | Known dates map to correct "Mon D" strings; epoch → "Jan 1" |
| `hooks/useAgentDetails` | Calls correct endpoint; returns `{ name, username, personaDescription }`; loading/error |
| `hooks/useFeatures` | Same pattern as other apps |
| `hooks/usePerformance` | Calls correct endpoint; loading/data/error |
| `hooks/useXActivity` | Calls correct endpoint; loading/data/error |
| `hooks/useMemecoinActivity` | Calls correct endpoint; loading/data/error |
| `hooks/useGeneratedMedia` | Calls correct endpoint; loading/data/error |

### Components

| Component | Key cases |
|---|---|
| `ui/Card.tsx` | Renders children |
| `ui/ErrorState.tsx` | Shows `message` prop |
| `ui/EmptyState.tsx` | Renders placeholder content |
| `Persona.tsx` | Loading skeleton; error state; name + username link + description shown; X URL correct; expand/collapse for long description |
| `Performance.tsx` | Loading/error/data states; metrics rendered |
| `MemecoinActivity.tsx` | Loading/empty/data states |
| `XActivity.tsx` | Loading/empty/data states |
| `AiGeneratedMedia.tsx` | Loading/empty/data states |
| `Chat/Chat.tsx` | Same as predict-ui Chat for `agentType='agentsFun'` |
| `ErrorBoundary.tsx` | Same as Phase 1 `ErrorBoundary` |
| `app/app.tsx` | Extend existing test; chat enabled/disabled; ErrorBoundary present |

---

## Phase 5 — Coverage Gaps & Mock Data Validation
**Branch:** `test/phase-5-coverage-gaps`

Sweep for any files missed or partially covered in phases 1–4:

| Area | Action |
|---|---|
| Mock data shape validation | Each app's `mocks/` — structural check that exports match their TypeScript types |
| `util-constants-and-types` address format | All blockchain addresses match `^0x[0-9a-fA-F]{40}$` |
| Constants cross-check | `FIVE_SECONDS < FIVE_MINUTES`; all `REACT_QUERY_KEYS` values unique |
| `ui-chat/useChats` edge cases | Server returns 200 but invalid JSON → graceful error |
| `predict-ui/useAgentDetails` combined state | Both queries failing simultaneously → `isError=true` |
| `predict-ui/AgentDetails` internal `getTime` | `getTime(undefined) === null`; valid ISO → non-null |
| `babydegen-ui/useWithdrawFunds` refetch | status `'processing'` → still polls; completed → stops |
| Coverage report audit | Run `--coverage` and add targeted tests for any file still below 80% |

---

## Infrastructure

### One-time setup
```ts
// jest.setup.ts (root)
process.env.IS_MOCK_ENABLED = 'false';
process.env.REACT_APP_AGENT_NAME = 'omenstrat_trader';
```

### Reusable helpers (add to each app's `src/test-utils.tsx`)
```ts
// React Query wrapper
export const renderWithQueryClient = (ui: ReactNode) =>
  render(<QueryClientProvider client={new QueryClient({ defaultOptions: { queries: { retry: false } } })}>{ui}</QueryClientProvider>);

// Hook wrapper
export const renderHookWithQueryClient = <T,>(hook: () => T) =>
  renderHook(hook, { wrapper: ({ children }) =>
    <QueryClientProvider client={new QueryClient({ defaultOptions: { queries: { retry: false } } })}>{children}</QueryClientProvider> });
```

### Testing modules that throw at load (BUG-001 pattern)
```ts
beforeEach(() => {
  jest.resetModules();
  process.env.REACT_APP_AGENT_NAME = 'omenstrat_trader';
});

it('loads with correct agentType', () => {
  const { agentType } = require('../utils/agentMap'); // dynamic — re-evaluates after resetModules
  expect(agentType).toBe('omenstrat_trader');
});
```

### Suppress ErrorBoundary noise
```ts
beforeEach(() => jest.spyOn(console, 'error').mockImplementation(() => {}));
afterEach(() => jest.restoreAllMocks());
```

---

## Definition of Done (per PR)

- All new specs pass locally via `yarn nx test <project>`
- No `act()` warnings
- CI (`check-pull-request.yml`) passes
- Coverage report shows measurable gain
- Each known bug (BUG-001–005 in `BUGS.md`) has either a fix or a regression test
