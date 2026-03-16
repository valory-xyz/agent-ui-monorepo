# Test Coverage Plan — agent-ui-monorepo

**Goal:** Reach ≥ 40% test coverage across the monorepo, organized into 6 incremental PRs.
**Starting state:** 2 test files exist — `generateAgentName.spec.ts` and `app.spec.tsx` (smoke test only).
**Stack:** Jest 29 + React Testing Library + ts-jest / babel-jest + jsdom.

---

## Coverage Targets by Phase

| Phase | PR | Scope | Est. Coverage Gain | Running Total |
|---|---|---|---|---|
| 1 | PR-1 | Pure utility functions (all libs + apps) | +10% | ~10% |
| 2 | PR-2 | Shared UI component libraries | +10% | ~20% |
| 3 | PR-3 | `predict-ui` utilities, constants, simple components | +8% | ~28% |
| 4 | PR-4 | `predict-ui` complex components & hooks | +5% | ~33% |
| 5 | PR-5 | `babydegen-ui` utilities & components | +5% | ~38% |
| 6 | PR-6 | `agentsfun-ui` components & hooks | +4% | ~42% |

> Coverage percentages are estimates based on relative file counts and function density.
> Each phase is a self-contained PR — no phase depends on a prior one being merged.

---

## Prerequisites (do once before any PR)

1. **Verify test runner works** — run `yarn nx run-many --target=test --all` and confirm no config errors.
2. **Add coverage flags** — ensure each `jest.config.ts` has `collectCoverage: true` or use `--coverage` in CI.
3. **Set env vars in Jest setup** — add a root `jest.setup.ts` (or per-project) that sets:
   ```ts
   process.env.REACT_APP_AGENT_NAME = 'omenstrat_trader'; // for predict-ui tests
   process.env.IS_MOCK_ENABLED = 'false';
   ```
4. **React Query wrapper utility** — create a shared `renderWithQueryClient` test helper once and reuse across all hook tests.

---

## Phase 1 — Pure Utility Functions
**Branch:** `test/phase-1-utility-functions`
**Estimated files touched:** 8 spec files created

### 1.1 `libs/util-functions` — `delay.ts`
**File:** `libs/util-functions/src/lib/delay.spec.ts`

Test cases:
- `delay(value)` resolves with the correct value after ~2 s (use fake timers)
- `delay(value, 0)` resolves immediately
- `delay(value, 5)` uses the custom delay duration
- Works with various generic types: `delay<string>('hello')`, `delay<number>(42)`, `delay<null>(null)`
- Returns a `Promise`

```ts
// Example skeleton
jest.useFakeTimers();
it('resolves with the given value after default 2s', async () => {
  const promise = delay('hello');
  jest.advanceTimersByTime(2000);
  await expect(promise).resolves.toBe('hello');
});
```

### 1.2 `libs/util-functions` — `reactQuery.ts` (exponentialBackoffDelay)
**File:** `libs/util-functions/src/lib/reactQuery.spec.ts`

Test cases:
- `exponentialBackoffDelay(0)` returns `1000` (1s)
- `exponentialBackoffDelay(1)` returns `2000` (2s)
- `exponentialBackoffDelay(2)` returns `4000` (4s)
- `exponentialBackoffDelay(3)` returns `8000` (8s)
- `exponentialBackoffDelay(4)` returns `16000` (16s)
- `exponentialBackoffDelay(5)` returns `30000` (capped at 30s)
- `exponentialBackoffDelay(10)` returns `30000` (never exceeds cap)
- `exponentialBackoffDelay(-1)` returns `500` (negative input gracefully handled — currently returns `500`, verify behavior)

### 1.3 `libs/util-functions` — `generateAgentName.ts` (extend existing)
**File:** `libs/util-functions/src/lib/generateAgentName.spec.ts` (extend)

Additional test cases beyond what exists:
- Output always ends with exactly 2 digits
- Name segments are separated by exactly one `-`
- Short address (fewer than 22 chars) doesn't crash — uses `phoneticSyllables[0]` fallback
- Empty string input doesn't throw
- Very long address (e.g. 100 chars) is handled
- Address with all-zero bytes produces a deterministic name
- The number suffix is in range `[0, 99]`

### 1.4 `apps/agentsfun-ui` — `utils/date.ts`
**File:** `apps/agentsfun-ui/src/utils/date.spec.ts`

Test cases for `formatTimestampToMonthDay(timestamp: number)`:
- Unix timestamp for Jan 1 → "Jan 1"
- Unix timestamp for Dec 31 → "Dec 31"
- Unix timestamp for a mid-month date → correct month abbreviation and day
- Timestamp `0` (epoch) → "Jan 1"
- **Edge case:** passing a millisecond timestamp (accidental misuse) — document the wrong output in comments

### 1.5 `apps/predict-ui` — `utils/time.ts`
**File:** `apps/predict-ui/src/utils/time.spec.ts`

Test cases for `getTimeAgo(ms, showPostfix?)`:
- 30 minutes ago → "30 minutes ago"
- 1 minute ago → "1 minute ago" (singular)
- 2 hours ago → "2 hours ago"
- 1 hour ago → "1 hour ago" (singular)
- 3 days ago → "3 days ago"
- 1 day ago → "1 day ago" (singular)
- 2 months ago → "2 months ago"
- 1 month ago → "1 month ago" (singular)
- `showPostfix = false` → output without " ago"
- **Edge case / BUG:** future timestamp (ms > Date.now()) — see [BUGS.md](../BUGS.md) — write a test that documents current behavior

Test cases for `formatDuration(totalSeconds: number)`:
- `0` → `"0m"`
- `30` → `"0m"` (less than 1 minute)
- `60` → `"1m"`
- `90` → `"1m"`
- `3600` → `"1h 0m"`
- `5400` → `"1h 30m"`
- `86400` → `"1d 0h"`
- `93600` → `"1d 2h"`
- `172800` → `"2d 0h"`
- `-100` → `"0m"` (negative guarded by `Math.max(0, ...)`)

### 1.6 `apps/predict-ui` — `utils/urls.ts`
**File:** `apps/predict-ui/src/utils/urls.spec.ts`

Test cases for `getPolymarketProfileUrl(agentSafeAddress?)`:
- With a valid address → returns `${POLYMARKET_PROFILE_BASE_URL}/${address}`
- With `undefined` → returns `undefined`
- With empty string `""` → returns `undefined` (empty string is falsy)

### 1.7 `apps/babydegen-ui` — `utils/agentMap.ts`
**File:** `apps/babydegen-ui/src/utils/agentMap.spec.ts`

Test cases:
- With `REACT_APP_AGENT_NAME = 'modius'` → `agentType === 'modius'`, `agentName === 'Modius'`, `agentChainName === 'mode'`
- With `REACT_APP_AGENT_NAME = 'optimus'` (or anything else) → `agentType === 'optimus'`, `agentName === 'Optimus'`, `agentChainName === 'optimism'`
- With `REACT_APP_AGENT_NAME = undefined` → falls back to `'optimus'`

> Note: Re-import the module per test using `jest.resetModules()` + `require()` to test env var changes.

---

## Phase 2 — Shared UI Component Libraries
**Branch:** `test/phase-2-shared-ui-libs`
**Estimated files touched:** 6 spec files created

### 2.1 `libs/ui-error-boundary` — `ErrorBoundary.tsx`
**File:** `libs/ui-error-boundary/src/lib/ErrorBoundary.spec.tsx`

Test cases:
- Renders children when no error
- Shows default error message "Something went wrong." when a child throws
- Shows custom `message` prop when provided
- `getDerivedStateFromError` sets `hasError: true`
- `componentDidCatch` calls `console.error` (spy on it)
- After error, renders an `Alert` component with `type="error"`
- Children are not rendered after an error

```ts
// Helper — throws on first render
const ThrowOnRender = () => { throw new Error('Test error'); };
```

### 2.2 `libs/ui-pill` — `Pill.tsx`
**File:** `libs/ui-pill/src/lib/Pill.spec.tsx`

Test cases:
- Renders children text
- Default type is `'neutral'` — renders with gray background color from PILL_STYLES
- `type="primary"` — renders with blue background
- `type="danger"` — renders with red background
- `size="small"` (default) — applies small gap/padding
- `size="large"` — applies large gap/padding
- Custom `style` prop is applied to the outer Flex
- A `HaloDot` is always rendered
- `Badge` is rendered (even though hidden) for all types
- Snapshot test for each type variant

### 2.3 `libs/ui-pill` — `HaloDot.tsx`
**File:** `libs/ui-pill/src/lib/HaloDot.spec.tsx`

Test cases:
- Renders a `div`
- Default `size=6`, `haloScale=2` applied correctly (inspect styled-component props)
- Custom `dotColor` is applied
- `haloColor` defaults to `dotColor` when not provided
- Custom `haloColor` overrides default
- Opacity is `0.25` when `haloColor === dotColor` (same color → transparent halo)
- Opacity is `0.9` when `haloColor !== dotColor`

### 2.4 `libs/ui-chat` — `utils.ts`
**File:** `libs/ui-chat/src/lib/utils.spec.ts`

Test cases for `handleChatError({ error, chats })`:
- Shows a notification with `error.message`
- Shows "Failed to send chat." when `error.message` is empty
- Returns `null` when `chats` is empty
- Returns `null` when last chat is `type: 'agent'`
- Returns `null` when last chat is `type: 'system'`
- Returns rollback state when last chat is `type: 'user'` with string text
  - `updatedChats` is `chats.slice(0, -1)`
  - `restoredText` equals the user's string
- Returns `null` when last chat is `type: 'user'` with ReactNode text (JSX) — **documents BUG-003**
- `chats` array is not mutated

### 2.5 `libs/ui-theme` — `GlobalColors.ts`
**File:** `libs/ui-theme/src/lib/GlobalColors.spec.ts`

Test cases:
- `GLOBAL_COLORS` object is defined and exported
- All expected color keys exist (BLUE_TRANSPARENT_20, RED_TRANSPARENT_20, GRAY_TRANSPARENT_20, etc.)
- Each color value is a valid CSS color string (hex, rgba)
- Object is frozen / values don't change at runtime

### 2.6 `libs/util-constants-and-types` — constants validation
**File:** `libs/util-constants-and-types/src/lib/constants/constants.spec.ts`

Test cases:
- `UNICODE_SYMBOLS` has all expected keys (OLAS, EXTERNAL_LINK, BULLET, SMALL_BULLET)
- `NA` equals `'n/a'`
- `FIVE_MINUTES` is a positive number (in ms)
- `API_V1` is a non-empty string
- `LOCAL` is a non-empty string
- All exported address constants are valid Ethereum addresses (42 chars, starts with `0x`, hex chars)
- `AGENT_CONFIG` entries (if any) have required fields

---

## Phase 3 — `predict-ui` Utilities, Constants & Simple Components
**Branch:** `test/phase-3-predict-ui-utils-and-simple`
**Setup required:** `process.env.REACT_APP_AGENT_NAME = 'omenstrat_trader'` in test setup

### 3.1 `predict-ui/src/utils/agentMap.ts`
**File:** `apps/predict-ui/src/utils/agentMap.spec.ts`

> **Important:** This module throws at load time if the env var is invalid — see [BUGS.md](../BUGS.md) BUG-001.
> Use `jest.resetModules()` + dynamic `require()` to test different env values.

Test cases:
- `REACT_APP_AGENT_NAME = 'omenstrat_trader'` → `agentType === 'omenstrat_trader'`, `isOmenstratAgent === true`, `isPolystratAgent === false`
- `REACT_APP_AGENT_NAME = 'polystrat_trader'` → `agentType === 'polystrat_trader'`, `isOmenstratAgent === false`, `isPolystratAgent === true`
- `REACT_APP_AGENT_NAME = 'invalid'` → throws `Error` with message containing "Invalid REACT_APP_AGENT_NAME"
- `REACT_APP_AGENT_NAME = undefined` → throws `Error`

### 3.2 `predict-ui/src/constants/currency.ts`
**File:** `apps/predict-ui/src/constants/currency.spec.ts`

Test cases:
- `CURRENCY['USD'].symbol === '$'`
- `CURRENCY['USDC'].symbol === '$'`
- `CURRENCY['USDT'].symbol === '$'`
- `CURRENCY['USDC.e'].symbol === '$'`
- `CurrencyCode` type includes all 4 keys (verified via TypeScript)
- No extra keys exist in `CURRENCY`

### 3.3 `predict-ui/src/constants/textMaps.ts`
**File:** `apps/predict-ui/src/constants/textMaps.spec.ts`

Test cases:
- `TRADING_TYPE_MAP['risky'].displayName === 'Risky'`
- `TRADING_TYPE_MAP['risky'].type === 'danger'`
- `TRADING_TYPE_MAP['balanced'].displayName === 'Balanced'`
- `TRADING_TYPE_MAP['balanced'].type === 'primary'`
- Both entries exist

### 3.4 `predict-ui/src/components/TradeHistory/TradeStatus.tsx`
**File:** `apps/predict-ui/src/components/TradeHistory/TradeStatus.spec.tsx`

Test cases:
- `status="won"` with `net_profit=10` → displays "Won $10", green color
- `status="lost"` with `net_profit=5` → displays "Lost $5", pink color
- `status="invalid"` → displays "Invalid", yellow color
- `status="pending"` with `bet_amount=20` → displays "Traded $20", neutral color
- `status="pending"` with `remaining_seconds=3600` → displays "1h 0m" (countdown via `formatDuration`)
- `status="pending"` with `remaining_seconds=0` → displays "0m"
- `net_profit=null` → displays `NA` ("n/a")
- `currency="USDC"` → symbol is `$`
- `currency` falls back to `$` for unknown currency
- `extra` prop renders additional content before the text
- Custom `styles` prop is applied to the Tag

### 3.5 `predict-ui/src/components/Performance.tsx`
**File:** `apps/predict-ui/src/components/Performance.spec.tsx`

Test cases:
- Renders "Performance" heading
- Displays `all_time_funds_used` with `$` prefix
- Displays `all_time_profit` with `$` prefix
- Displays `funds_locked_in_markets`
- Displays `available_funds`
- Displays `predictions_made` formatted with `Intl.NumberFormat`
- `prediction_accuracy: null` → renders as text "Will appear with the first resolved market."
- `prediction_accuracy: 0.534` → renders "53.40%"
- `prediction_accuracy: 0` → renders "0.00%"
- All 6 performance items are rendered
- ROI tooltip on `all_time_profit` shows correct ROI percentage
- Currency symbol comes from `CURRENCY[currency].symbol`

---

## Phase 4 — `predict-ui` Complex Components & Hooks
**Branch:** `test/phase-4-predict-ui-complex`
**Setup required:** React Query `QueryClientProvider` wrapper, `fetch` mock via `jest.spyOn(global, 'fetch')`

### 4.1 `predict-ui` — `TradeHistory.tsx`
**File:** `apps/predict-ui/src/components/TradeHistory/TradeHistory.spec.tsx`

Test cases:
- Shows loading spinner while data is loading
- Shows "No data yet" when `items` is empty
- Renders table with correct columns: Market, Prediction, Status
- "Yes" prediction renders as "Yes", "No" renders as "No"
- Clicking a row opens `PositionDetailsModal`
- Pagination triggers re-fetch with new page number
- `PolymarketButtonSection` is only shown when `isPolystratAgent === true`
- `PolymarketButtonSection` renders correct URL from `agentSafeAddress`
- `PolymarketButtonSection` is hidden when `agentSafeAddress` is undefined

Mocking strategy:
```ts
// Mock hooks
jest.mock('../../hooks/useTradeHistory', () => ({ useTradeHistory: jest.fn() }));
jest.mock('../../hooks/useAgentDetails', () => ({ useAgentDetails: jest.fn() }));
```

### 4.2 `predict-ui` — `ProfitOverTime.tsx`
**File:** `apps/predict-ui/src/components/ProfitOverTime/ProfitOverTime.spec.tsx`

Test cases:
- Shows spinner while loading
- Shows "No data yet" when `points` is empty
- Shows error message on `isError`
- Renders `Chart` when data is available
- Window switcher (Segmented) is only shown when `points.length > 0`
- Selecting a different window option calls `setCurrentWindow`
- Default window is `'7d'`

### 4.3 `predict-ui` — `ProfitOverTime/Chart.tsx` (pure render)
**File:** `apps/predict-ui/src/components/ProfitOverTime/Chart.spec.tsx`

Test cases:
- Renders a `ResponsiveContainer`
- Does not crash with empty `data` array
- Renders correct number of chart points
- Tooltip text: positive value → "Profit of $X.XX"
- Tooltip text: negative value → "Loss of $X.XX"
- Tooltip text: `0` value → "No Profit or Loss"
- Tooltip text: `NaN` value → `NA`
- Tooltip date formats correctly

### 4.4 `predict-ui` — `PositionDetailsModal.tsx`
**File:** `apps/predict-ui/src/components/TradeHistory/PositionDetailsModal/PositionDetailsModal.spec.tsx`

Test cases:
- Shows skeleton loader while loading
- Shows error alert when `error` is truthy
- Renders `InvalidMarketAlert` when `status === 'invalid'`
- `formatCurrency` with positive value → `$X.XXX`
- `formatCurrency` with `null` → `NA` ("n/a")
- Shows "Won", "To win", or "Payout" label based on status
- Renders each `TradeDetails` entry in a `Collapse` item
- "Trade" label shown for single bet, "Trade 1", "Trade 2" for multiple
- `onClose` called when modal cancel is triggered
- Shows "No trades found." when `bets` is empty array

### 4.5 `predict-ui` — `useTradeHistory` hook
**File:** `apps/predict-ui/src/hooks/useTradeHistory.spec.ts`

Test cases (using `renderHook` + `QueryClientProvider`):
- Returns `{ isLoading: true }` on initial render
- Returns data after successful fetch
- Calls correct API URL with `page` and `pageSize` params
- `usePositionDetails` calls `/agent/position-details/{id}`
- Returns error state when fetch fails (response not ok)
- Uses mock data when `IS_MOCK_ENABLED === 'true'`

### 4.6 `predict-ui` — `useProfitOverTime` hook
**File:** `apps/predict-ui/src/hooks/useProfitOverTime.spec.ts`

Test cases:
- Calls `/agent/profit-over-time?window=7d` by default
- Calls correct URL for each `AgentWindow` value
- Returns data on success
- Returns error state on fetch failure

---

## Phase 5 — `babydegen-ui` Utilities & Components
**Branch:** `test/phase-5-babydegen-ui`

### 5.1 `babydegen-ui` — `utils/agentMap.ts`
**File:** `apps/babydegen-ui/src/utils/agentMap.spec.ts`
(Already covered in Phase 1 section 1.7 — can be part of this PR instead)

### 5.2 `babydegen-ui` — `utils/chartjs/palette.ts`
**File:** `apps/babydegen-ui/src/utils/chartjs/palette.spec.ts`

Test cases:
- Color palette array is defined and non-empty
- All entries are valid CSS color strings

### 5.3 `babydegen-ui` — `constants/textMaps.ts`
**File:** `apps/babydegen-ui/src/constants/textMaps.spec.ts`

Test cases:
- All expected text map entries exist
- Values are non-empty strings

### 5.4 `babydegen-ui` — `components/Portfolio/Portfolio.tsx`
**File:** `apps/babydegen-ui/src/components/Portfolio/Portfolio.spec.tsx`

Test cases:
- Renders portfolio heading
- Shows loading state
- Displays portfolio data when loaded
- Shows empty state when no portfolio data

### 5.5 `babydegen-ui` — `components/WithdrawAgentsFunds/useFunds.ts`
**File:** `apps/babydegen-ui/src/components/WithdrawAgentsFunds/useFunds.spec.ts`

Test cases:
- Returns loading state on initial render
- Returns withdrawal fund data after successful fetch
- Refetch interval is `1000` ms when no data, `5000` when data exists
- Calls `/withdrawal/amount` endpoint
- Returns error on failed fetch

### 5.6 `babydegen-ui` — `components/WithdrawAgentsFunds/useWithdrawFunds.ts`
**File:** `apps/babydegen-ui/src/components/WithdrawAgentsFunds/useWithdrawFunds.spec.ts`

Test cases:
- `initiateWithdraw(address)` calls `POST /withdrawal/initiate` with correct body
- After initiation, `withdrawId` is set from response
- Status query is disabled until `withdrawId` is set (`enabled: !!withdrawId`)
- Status query calls `/withdrawal/status/{id}`
- `isLoading` is true while either mutation or status query is pending
- `isError` is true when either mutation or status query fails
- `data` is returned from status query
- When status is `'completed'`, refetch interval stops (`false`)
- When status is not `'completed'`, refetch interval is `2000` ms
- `withdrawId` is reset to `null` on error

---

## Phase 6 — `agentsfun-ui` Components & Hooks
**Branch:** `test/phase-6-agentsfun-ui`

### 6.1 `agentsfun-ui` — `components/ui/Card.tsx`, `ErrorState.tsx`, `EmptyState.tsx`
**File:** `apps/agentsfun-ui/src/components/ui/Card.spec.tsx` etc.

Test cases:
- Card renders children
- ErrorState shows error message
- EmptyState shows placeholder content

### 6.2 `agentsfun-ui` — `app/app.tsx` (extend existing smoke test)
**File:** `apps/agentsfun-ui/src/app/app.spec.tsx` (extend)

Extend the existing test:
- Route to `/` renders expected top-level elements
- Route to an unknown path shows 404 or redirects

### 6.3 `agentsfun-ui` — `components/Performance.tsx`
**File:** `apps/agentsfun-ui/src/components/Performance.spec.tsx`

Test cases:
- Renders all performance metric items
- Shows loading state
- Shows error state

### 6.4 `agentsfun-ui` — `hooks/useFeatures.ts` (pattern applies to all apps)
**File:** `apps/agentsfun-ui/src/hooks/useFeatures.spec.ts`

Test cases:
- Returns feature flags from API response
- Returns default (all disabled) on error
- Correct API endpoint called

### 6.5 `agentsfun-ui` — `components/MemecoinActivity.tsx`
**File:** `apps/agentsfun-ui/src/components/MemecoinActivity.spec.tsx`

Test cases:
- Renders with mock data
- Shows loading state
- Shows empty state when no activity

---

## Testing Infrastructure Notes

### React Query Wrapper (add once to a shared test utility)
```ts
// test-utils/renderWithQueryClient.tsx
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { render } from '@testing-library/react';
import { ReactNode } from 'react';

export const renderWithQueryClient = (ui: ReactNode) => {
  const queryClient = new QueryClient({
    defaultOptions: { queries: { retry: false } },
  });
  return render(<QueryClientProvider client={queryClient}>{ui}</QueryClientProvider>);
};
```

### Hook Testing
```ts
import { renderHook, waitFor } from '@testing-library/react';
// Wrap with QueryClientProvider via `wrapper` option
```

### Mocking `fetch`
```ts
global.fetch = jest.fn().mockResolvedValue({
  ok: true,
  json: () => Promise.resolve(mockData),
});
```

### Mocking `process.env` for module-level constants
```ts
// Must be done before the import using jest.resetModules()
beforeEach(() => {
  jest.resetModules();
  process.env.REACT_APP_AGENT_NAME = 'omenstrat_trader';
});
// Then use dynamic require()
const { agentType } = require('../utils/agentMap');
```

### NX commands
```bash
# Run tests for a specific project
yarn nx test predict-ui

# Run all tests with coverage
yarn nx run-many --target=test --all --coverage

# Run only changed projects
yarn nx affected --target=test
```

---

## What is NOT in scope for 40% target

The following are intentionally deferred (would push toward 100% but are lower ROI for the initial phases):

- `libs/ui-chat` — `Chat.tsx`, `ViewChats.tsx`, `UnlockChat.tsx`, `useChats.ts` — complex GraphQL + websocket interactions
- Full E2E tests for withdrawal flow in `babydegen-ui`
- `libs/ui-theme` — `GlobalStyles.tsx` — styled-components global CSS injection
- Chart rendering pixel/snapshot tests for `recharts` / `chart.js` components
- App-level route integration tests for `babydegen-ui` and `predict-ui`

These can be addressed in a Phase 7+ to push from 40% → 60% → 80%+.

---

## Definition of Done per Phase

- [ ] All new spec files pass locally via `yarn nx test <project>`
- [ ] No `console.error` from unhandled async in tests (use `act()`)
- [ ] No `act()` warnings from React Testing Library
- [ ] CI pipeline (`check-pull-request.yml`) passes
- [ ] Coverage report shows measurable gain for that project
- [ ] New tests follow existing patterns (babel-jest for React, ts-jest for Node utilities)
