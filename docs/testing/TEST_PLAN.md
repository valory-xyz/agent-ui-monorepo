# Test Coverage Plan — agent-ui-monorepo

**Goal:** 100% coverage across all meaningful source files, delivered in 5 PRs.
**Starting state:** 2 test files exist (`generateAgentName.spec.ts`, `app.spec.tsx` smoke test).

| Phase | Status | Tests | Coverage highlights |
|---|---|---|---|
| 1 — Shared Libraries | ✅ Done | 130 passing | `util-functions` 100%, `util-constants-and-types` 100%, `ui-error-boundary` 100%, `ui-theme` 100%, `ui-pill` 100% stmts/funcs (88.9% branch — BUG-004 dead branch), `ui-chat` 92.3% stmts |
| 2 — `predict-ui` | 🔲 Pending | — | — |
| 3 — `babydegen-ui` | 🔲 Pending | — | — |
| 4 — `agentsfun-ui` | 🔲 Pending | — | — |
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

- **No `any`:** Never use `as any` or type `any` in test files. Use `unknown`, the actual class type, or a typed intermediate variable.
- **Null guards:** Instead of `result!.foo`, use `if (!result) throw new Error('...')` then access `result.foo`.
- **Fetch mocking:** Use `global.fetch = jest.fn()` (not `jest.spyOn(global, 'fetch')`) in jsdom environments.
- **Module-level env vars:** Default to `jest.resetModules()` + dynamic `require()` after setting the env var. Use `jest.isolateModules` only when testing multiple env shapes in one file and the module has no React hooks (it can break hook state). For React components, use a dedicated spec file with the env var set in `setupFilesAfterEnv`. See CLAUDE.md for the full decision tree.
- **JSX in spec files:** Use `.spec.tsx` extension whenever the file contains JSX, even if it only tests a `.ts` source.

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

## Phase 2 — `predict-ui`
**Branch:** `test/phase-2-predict-ui` | **Setup:** `process.env.REACT_APP_AGENT_NAME = 'omenstrat_trader'`

### Utilities & Constants

| File | Spec | Key cases |
|---|---|---|
| `utils/time.ts` — `getTimeAgo` | `time.spec.ts` | Minutes/hours/days/months (singular + plural); `showPostfix=false`; BUG-002: future timestamp documents negative output |
| `utils/time.ts` — `formatDuration` | *(same file)* | `0→"0m"`; `30→"0m"`; `60→"1m"`; `3600→"1h 0m"`; `86400→"1d 0h"`; `-100→"0m"` |
| `utils/urls.ts` | `urls.spec.ts` | With address → full URL; `undefined` → `undefined`; `""` → `undefined` |
| `utils/agentMap.ts` | `agentMap.spec.ts` | Use `jest.resetModules()` + dynamic `require()`. omenstrat → correct flags; polystrat → correct flags; invalid/undefined → throws (BUG-001 documented) |
| `constants/currency.ts` | `currency.spec.ts` | All 4 keys exist; every symbol is `$` |
| `constants/textMaps.ts` | `textMaps.spec.ts` | `risky` → `'danger'`/`'Risky'`; `balanced` → `'primary'`/`'Balanced'` |

### Hooks (use `renderHookWithQueryClient` + mock `fetch`)

| Hook | Key cases |
|---|---|
| `useAgentDetails` | Calls `/agent/details` + `/agent/performance`; loading/data/error states |
| `useTradeHistory` | URL includes `page` + `page_size`; data/error states |
| `usePositionDetails` | Calls `/agent/position-details/{id}`; data/error states |
| `useProfitOverTime` | URL includes `window`; all 4 window values work |
| `useTradingDetails` | Calls `/agent/trading-details`; data/error states |
| `useFeatures` | Calls `/features`; refetch interval `FIVE_MINUTES` when enabled, `FIVE_SECONDS` when not |

### Components (mock all hooks with `jest.mock`)

| Component | Key cases |
|---|---|
| `ui/Card.tsx` | Renders children; `$gap` and `$padding` props applied |
| `ui/Alert.tsx` | Renders with `type="error"` and `type="warning"`; passes through props |
| `ErrorState.tsx` | Title, description, icon all rendered |
| `AgentDetails.tsx` | ISO dates → `getTimeAgo` output; missing props → "n/a" |
| `Performance.tsx` | All 6 metrics rendered; `null` accuracy → text variant; `0` accuracy → "0.00%"; numbers Intl-formatted |
| `Strategy.tsx` | Loading skeleton; strategy name + description shown; `null` data → "n/a" |
| `TradeStatus.tsx` | won/lost/invalid/pending states; `remaining_seconds` → countdown; `null` profit → "n/a"; `Math.abs` on negative profit |
| `TradeHistory.tsx` | Loading/empty/data states; row click opens modal; pagination; Polymarket button conditional on `isPolystratAgent` |
| `Trade.tsx` | Strategy shown/hidden; prediction tool shown/hidden; intelligence scores rounded; `placed_at` date formatted |
| `PositionDetailsModal.tsx` | Loading/error/invalid states; won/to-win/payout labels; single vs multiple bets; `onClose` callback |
| `ProfitOverTime.tsx` | Loading/error/empty/data states; window switcher hidden when no data |
| `ProfitOverTime/Chart.tsx` | Tooltip: positive/negative/zero/NaN/undefined values; missing label → "n/a" |
| `Chat/SystemChat.tsx` | "Strategy updated:" label; from/to Pills with correct types |
| `Chat/Chat.tsx` | Empty/whitespace → no send; valid text sends and clears; user message added; `reasoning` → agent chat; strategy change → system chat; error → rollback; 3 queries invalidated on success |
| `app/agent.tsx` | Loading/error/not-found/full-render states; chat enabled/disabled/loading |
| `app/app.tsx` | Smoke test; `ErrorBoundary` + `AntdConfigProvider` present |

---

## Phase 3 — `babydegen-ui`
**Branch:** `test/phase-3-babydegen-ui`

### Utilities & Hooks

| File | Key cases |
|---|---|
| `utils/agentMap.ts` | modius/optimus/fallback; use `jest.resetModules()` |
| `hooks/usePortfolio` | Calls `/portfolio`; refetch 1000 ms → 5000 ms when data arrives |
| `hooks/useFeatures` | Same as predict-ui useFeatures |
| `useFunds` | Calls `/withdrawal/amount`; refetch interval logic |
| `useWithdrawFunds` | `initiateWithdraw` POSTs correctly; sets `withdrawId`; status query enabled only after ID; completed stops polling; error resets `withdrawId` |

### Components

| Component | Key cases |
|---|---|
| `ui/CardTitle.tsx` | Renders `text` prop |
| `ui/Pill.tsx` | Passes children + props to shared `Pill` |
| `components/ErrorBoundary.tsx` | Same cases as Phase 1 `ErrorBoundary` |
| `Portfolio/Portfolio.tsx` | Loading/data/error states; balance displayed |
| `Portfolio/BreakdownModal.tsx` | Opens/closes; data rendered; empty state |
| `Allocation/Allocation.tsx` | Smoke test — renders all sub-components |
| `Allocation/AllocationTable.tsx` | Rows rendered with mock data |
| `Allocation/AllocationPie.tsx` | Renders without crash |
| `Allocation/AllocationAssets.tsx` | Asset list rendered |
| `Strategy/Strategy.tsx` | Strategy name + description; loading state |
| `WithdrawAgentsFunds/WithdrawAgentsFunds.tsx` | Balance shown; input present; submit calls `initiateWithdraw`; loading/error/completed states |
| `WithdrawAgentsFunds/WithdrawInvestedFunds.tsx` | Renders relevant info |
| `Chat/SystemChat.tsx` | Same as predict-ui `TradingStrategy` |
| `Chat/Chat.tsx` | Same cases as predict-ui Chat; agent type `modius`/`optimus` |
| `App.tsx` | `isChatEnabled` → Chat+Strategy; disabled → UnlockChat; loading → neither |

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
