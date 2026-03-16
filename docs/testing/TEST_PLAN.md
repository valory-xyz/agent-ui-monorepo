# Test Coverage Plan — agent-ui-monorepo

**Goal:** 100% test coverage across the monorepo, delivered in 12 incremental PRs.
**Starting state:** 2 test files — `generateAgentName.spec.ts` (partial) and `app.spec.tsx` (smoke test only).
**Stack:** Jest 29 + React Testing Library + ts-jest / babel-jest + jsdom.

---

## Coverage Targets by Phase

| Phase | PR | Scope | Est. Coverage Gain | Running Total |
|---|---|---|---|---|
| 1 | PR-1 | Pure utility functions (all libs + apps) | +10% | ~10% |
| 2 | PR-2 | Shared UI libraries: `ui-error-boundary`, `ui-pill`, `ui-theme` | +7% | ~17% |
| 3 | PR-3 | `ui-chat` library (all 5 files) | +8% | ~25% |
| 4 | PR-4 | `predict-ui` — utilities, constants, simple display components | +10% | ~35% |
| 5 | PR-5 | `predict-ui` — data hooks | +8% | ~43% |
| 6 | PR-6 | `predict-ui` — complex components (TradeHistory, ProfitOverTime, PositionDetailsModal) | +8% | ~51% |
| 7 | PR-7 | `predict-ui` — Chat, Strategy, app shell, `agent.tsx` | +7% | ~58% |
| 8 | PR-8 | `babydegen-ui` — utilities, constants, simple UI components | +7% | ~65% |
| 9 | PR-9 | `babydegen-ui` — data hooks | +7% | ~72% |
| 10 | PR-10 | `babydegen-ui` — complex components (Allocation, Portfolio, Withdrawal) | +8% | ~80% |
| 11 | PR-11 | `agentsfun-ui` — hooks and data-fetching components | +10% | ~90% |
| 12 | PR-12 | `agentsfun-ui` — remaining components + app shells for all 3 apps | +10% | ~100% |

> Coverage percentages are estimates. Actual numbers depend on line density per file.
> Each phase is a self-contained PR — no phase depends on a prior one being merged first.

---

## Prerequisites (do once before any PR)

### 1. Verify the test runner
```bash
yarn nx run-many --target=test --all
```
Confirm all 9 projects report "no tests found" rather than config errors.

### 2. Add coverage to CI
In `.github/workflows/check-pull-request.yml`, add `--coverage` to the test step:
```yaml
- run: yarn nx run-many --target=test --all --passWithNoTests --coverage
```

### 3. Root Jest setup file
Create `jest.setup.ts` at the repo root for env vars shared across all test environments:
```ts
// jest.setup.ts
process.env.IS_MOCK_ENABLED = 'false';
process.env.REACT_APP_AGENT_NAME = 'omenstrat_trader'; // safe default for predict-ui
```
Reference it in each app's `jest.config.ts` via `setupFilesAfterFramework: ['<rootDir>/../../jest.setup.ts']`.

### 4. Shared test utilities
Create `test-utils/renderWithQueryClient.tsx` inside each app's `src/` once and reuse:
```ts
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { render, renderHook } from '@testing-library/react';
import { ReactNode } from 'react';

const makeClient = () =>
  new QueryClient({ defaultOptions: { queries: { retry: false }, mutations: { retry: false } } });

export const renderWithQueryClient = (ui: ReactNode) =>
  render(<QueryClientProvider client={makeClient()}>{ui}</QueryClientProvider>);

export const renderHookWithQueryClient = <T,>(hook: () => T) =>
  renderHook(hook, { wrapper: ({ children }) => (
    <QueryClientProvider client={makeClient()}>{children}</QueryClientProvider>
  )});
```

---

## Phase 1 — Pure Utility Functions
**Branch:** `test/phase-1-utility-functions`
**Projects:** `util-functions`, `util-constants-and-types`, `agentsfun-ui`, `predict-ui`, `babydegen-ui`

### 1.1 `libs/util-functions` — `delay.ts`
**File:** `libs/util-functions/src/lib/delay.spec.ts`

```ts
jest.useFakeTimers();
```

| Test | Input | Expected |
|---|---|---|
| Resolves with value after default 2 s | `delay('hello')` | resolves to `'hello'` after 2 s |
| Resolves with custom duration | `delay(42, 5)` | resolves after 5 s |
| `delayInSeconds = 0` resolves immediately | `delay('x', 0)` | resolves to `'x'` |
| Works with generic type `null` | `delay<null>(null)` | resolves to `null` |
| Works with generic type `object` | `delay({ a: 1 })` | resolves to `{ a: 1 }` |
| Returns a Promise | `delay(1)` | `instanceof Promise` |

### 1.2 `libs/util-functions` — `reactQuery.ts` (`exponentialBackoffDelay`)
**File:** `libs/util-functions/src/lib/reactQuery.spec.ts`

| Test | Input | Expected |
|---|---|---|
| attempt 0 | `exponentialBackoffDelay(0)` | `1000` |
| attempt 1 | `exponentialBackoffDelay(1)` | `2000` |
| attempt 2 | `exponentialBackoffDelay(2)` | `4000` |
| attempt 3 | `exponentialBackoffDelay(3)` | `8000` |
| attempt 4 | `exponentialBackoffDelay(4)` | `16000` |
| attempt 5 | `exponentialBackoffDelay(5)` | `30000` (cap) |
| attempt 10 | `exponentialBackoffDelay(10)` | `30000` (never exceeds cap) |

### 1.3 `libs/util-functions` — `generateAgentName.ts` (extend existing spec)
**File:** `libs/util-functions/src/lib/generateAgentName.spec.ts`

Additional cases on top of the 4 existing tests:
- Output ends with exactly 2 digits
- Output contains exactly one `-` separator
- Number suffix is always in range `[0, 99]`
- Empty string address doesn't throw, uses `phoneticSyllables[0]` fallback
- All-zero address `'0x' + '0'.repeat(40)` produces a deterministic name
- Extremely long address (100 chars) is handled without throwing

### 1.4 `libs/util-constants-and-types` — constants snapshot
**File:** `libs/util-constants-and-types/src/lib/constants/constants.spec.ts`

- `NA === 'n/a'`
- `UNICODE_SYMBOLS` has all 4 keys: `OLAS`, `EXTERNAL_LINK`, `BULLET`, `SMALL_BULLET`
- `FIVE_MINUTES` is a positive number
- `FIVE_SECONDS` is a positive number, less than `FIVE_MINUTES`
- `API_V1` is a non-empty string
- `LOCAL` is a non-empty string
- All address constants in `addresses.ts` are 42-char strings starting with `0x`
- All chars in addresses are valid hex after `0x`
- `TIME` constants (if any) are positive numbers

### 1.5 `apps/agentsfun-ui` — `utils/date.ts`
**File:** `apps/agentsfun-ui/src/utils/date.spec.ts`

`formatTimestampToMonthDay(timestamp: number)` — timestamp is Unix seconds:

| Test | Input | Expected |
|---|---|---|
| Known date | Unix for 2024-01-01 | `"Jan 1"` |
| Known date | Unix for 2024-12-31 | `"Dec 31"` |
| Mid-month | Unix for 2024-06-15 | `"Jun 15"` |
| Epoch | `0` | `"Jan 1"` |
| Single-digit day | Unix for 2024-03-05 | `"Mar 5"` |

### 1.6 `apps/predict-ui` — `utils/time.ts`
**File:** `apps/predict-ui/src/utils/time.spec.ts`

`getTimeAgo(ms, showPostfix?)`:

| Test | Setup | Expected |
|---|---|---|
| 30 minutes ago | `Date.now() - 30*60*1000` | `"30 minutes ago"` |
| 1 minute (singular) | `Date.now() - 60*1000` | `"1 minute ago"` |
| 2 hours | `Date.now() - 2*3600*1000` | `"2 hours ago"` |
| 1 hour (singular) | `Date.now() - 3600*1000` | `"1 hour ago"` |
| 3 days | `Date.now() - 3*86400*1000` | `"3 days ago"` |
| 1 day (singular) | `Date.now() - 86400*1000` | `"1 day ago"` |
| 2 months | `Date.now() - 60*86400*1000` | `"2 months ago"` |
| 1 month (singular) | `Date.now() - 30*86400*1000` | `"1 month ago"` |
| `showPostfix = false` | any | no `" ago"` suffix |
| Future timestamp (BUG-002) | `Date.now() + 60000` | document current negative output |

`formatDuration(totalSeconds)`:

| Test | Input | Expected |
|---|---|---|
| Zero | `0` | `"0m"` |
| Sub-minute | `30` | `"0m"` |
| Exactly 1 min | `60` | `"1m"` |
| 90 seconds | `90` | `"1m"` |
| 1 hour exact | `3600` | `"1h 0m"` |
| 1h 30m | `5400` | `"1h 30m"` |
| 1 day exact | `86400` | `"1d 0h"` |
| 1 day 2 hours | `93600` | `"1d 2h"` |
| 2 days | `172800` | `"2d 0h"` |
| Negative input | `-100` | `"0m"` |

### 1.7 `apps/predict-ui` — `utils/urls.ts`
**File:** `apps/predict-ui/src/utils/urls.spec.ts`

`getPolymarketProfileUrl(agentSafeAddress?)`:

| Test | Input | Expected |
|---|---|---|
| Valid address | `"0xabc..."` | `"${POLYMARKET_PROFILE_BASE_URL}/0xabc..."` |
| `undefined` | `undefined` | `undefined` |
| Empty string | `""` | `undefined` (falsy guard) |

### 1.8 `apps/babydegen-ui` — `utils/agentMap.ts`
**File:** `apps/babydegen-ui/src/utils/agentMap.spec.ts`

Use `jest.resetModules()` + dynamic `require()` per test:

| Test | `REACT_APP_AGENT_NAME` | Expected |
|---|---|---|
| Modius | `'modius'` | `agentType = 'modius'`, `agentName = 'Modius'`, `agentChainName = 'mode'` |
| Optimus (explicit) | `'optimus'` | `agentType = 'optimus'`, `agentName = 'Optimus'`, `agentChainName = 'optimism'` |
| Unknown falls back | `'unknown'` | falls back to `'optimus'` |
| Undefined falls back | `undefined` | falls back to `'optimus'` |

---

## Phase 2 — Shared UI Libraries (non-chat)
**Branch:** `test/phase-2-shared-ui-libs`
**Projects:** `ui-error-boundary`, `ui-pill`, `ui-theme`

### 2.1 `libs/ui-error-boundary` — `ErrorBoundary.tsx`
**File:** `libs/ui-error-boundary/src/lib/ErrorBoundary.spec.tsx`

```ts
// Helper component
const Throw = ({ message = 'boom' }) => { throw new Error(message); };
```

| Test | Scenario | Expected |
|---|---|---|
| Happy path | no error thrown | renders children |
| Default error message | child throws | Alert shows "Something went wrong." |
| Custom message prop | `<ErrorBoundary message="Custom error">` + throw | Alert shows "Custom error" |
| Error message from Error | child throws `new Error('My error')` | error state rendered |
| `console.error` called | child throws | `console.error` spy was called |
| Children hidden after error | child throws | children not in DOM |
| `getDerivedStateFromError` | call directly | returns `{ hasError: true, errorMessage: 'boom' }` |
| Recovery — re-render healthy children | replace thrown child with good child + key change | renders children again |

### 2.2 `libs/ui-pill` — `Pill.tsx`
**File:** `libs/ui-pill/src/lib/Pill.spec.tsx`

| Test | Scenario | Expected |
|---|---|---|
| Renders children | `<Pill>Label</Pill>` | "Label" in DOM |
| Default type `neutral` | no type prop | gray background applied |
| `type="primary"` | primary prop | blue background |
| `type="danger"` | danger prop | red background |
| `size="small"` (default) | no size prop | `gap: 4` styles |
| `size="large"` | large prop | `gap: 8` styles |
| Custom `style` applied | `style={{ margin: 10 }}` | style present on element |
| `HaloDot` always rendered | any type | `HaloDot` in output |
| `Badge` rendered (hidden) | any type | Badge element present |
| Dead code note: `hasType` always true | any usage | `marginLeft` is always `-28` (BUG-004 regression test) |

### 2.3 `libs/ui-pill` — `HaloDot.tsx`
**File:** `libs/ui-pill/src/lib/HaloDot.spec.tsx`

| Test | Scenario | Expected |
|---|---|---|
| Renders a div | default props + `dotColor` | one DOM element |
| Default size | no size | `size=6` in styled props |
| Default haloScale | no haloScale | `haloScale=2` |
| Custom dotColor | `dotColor="#FF0000"` | color applied |
| haloColor defaults to dotColor | no haloColor | `haloColor === dotColor` |
| Custom haloColor | `haloColor="#00FF00"` | explicit haloColor used |

### 2.4 `libs/ui-theme` — `GlobalColors.ts`
**File:** `libs/ui-theme/src/lib/GlobalColors.spec.ts`

- `GLOBAL_COLORS` is defined and exported
- Keys include: `BLUE_TRANSPARENT_20`, `RED_TRANSPARENT_20`, `GRAY_TRANSPARENT_20`, `WHITE`, `BLACK`, `WHITE_TRANSPARENT_10`, `POLYSTRAT_BACKGROUND`, `NEUTRAL_GRAY`, `DARK_GRAY`, `MEDIUM_GRAY`
- Every value is a non-empty string

### 2.5 `libs/ui-theme` — `GlobalStyles.tsx`
**File:** `libs/ui-theme/src/lib/GlobalStyles.spec.tsx`

- `GlobalStyles` renders without throwing (smoke test)
- Accepts optional `tooltipBorderColor` prop without crashing
- `tooltipBorderColor = undefined` renders without crashing

---

## Phase 3 — `ui-chat` Library
**Branch:** `test/phase-3-ui-chat`

### 3.1 `libs/ui-chat` — `constants.tsx`
**File:** `libs/ui-chat/src/lib/constants.spec.ts`

- `LOGO_MAP` is defined and exported
- `LOGO_MAP` has exactly 5 keys: `modius`, `optimus`, `omenstrat_trader`, `polystrat_trader`, `agentsFun`
- Every value is a non-empty string (module path to image asset)

### 3.2 `libs/ui-chat` — `UnlockChat.tsx`
**File:** `libs/ui-chat/src/lib/UnlockChat.spec.tsx`

| Test | Scenario | Expected |
|---|---|---|
| Renders heading | default | "Update agent's goal" visible |
| Renders lock icon | default | `LockOutlined` present |
| Renders instruction text | default | "Add your Gemini API key..." text visible |
| `type="secondary"` prop | secondary | Title receives `type="secondary"` |
| Custom `iconColor` | `iconColor="#FF0000"` | icon color applied |
| Default iconColor | no prop | `GLOBAL_COLORS.MEDIUM_GRAY` used |

### 3.3 `libs/ui-chat` — `Chat.tsx`
**File:** `libs/ui-chat/src/lib/Chat.spec.tsx`

| Test | Scenario | Expected |
|---|---|---|
| Renders heading | any agentType | "Update agent's goal" visible |
| Empty chats shows EmptyChat | `chats=[]` | agent logo shown, ViewChats not shown |
| Non-empty chats shows ViewChats | `chats` with entries | ViewChats rendered |
| Textarea renders | default | textarea in DOM |
| Textarea placeholder — agentsFun | `agentType="agentsFun"` | "Describe the agent's persona" |
| Textarea placeholder — other | `agentType="modius"` | "Give the agent custom guidance" |
| `onCurrentTextChange` called on input | user types | callback invoked with new value |
| `onSend` called on button click | click send button | `onSend` called |
| `onSend` called on Enter key | press Enter in textarea | `onSend` called |
| Enter + Shift does NOT send | press Shift+Enter | `onSend` NOT called |
| Loading state shows spinner on button | `isLoading=true` | button has loading state |
| Button style — omenstrat | `agentType="omenstrat_trader"` | white background button style |
| Button style — polystrat | `agentType="polystrat_trader"` | white background button style |
| Button style — modius | `agentType="modius"` | black text button style |
| Button style — other | `agentType="agentsFun"` | white text button style |
| Size prop — large | `size="large"` | large font applied to textarea |

### 3.4 `libs/ui-chat` — `ViewChats.tsx`
**File:** `libs/ui-chat/src/lib/ViewChats.spec.tsx`

| Test | Scenario | Expected |
|---|---|---|
| Renders all chats | 3 chat entries | 3 items in DOM |
| User chat — right alignment | `type: 'user'` | `alignSelf: flex-end` style |
| Agent chat has logo | `type: 'agent'` | agent logo image rendered |
| System chat indented | `type: 'system'` | spacer div rendered instead of logo |
| String text renders as markdown | `text: '**bold**'` | bold text via `ReactMarkdown` |
| ReactNode text renders directly | `text: <span>JSX</span>` | JSX rendered |
| Scrolls to bottom on new messages | add new message | `scrollTop` set to `scrollHeight` |
| Margin — large size | `size="large"` | `margin: 24px 0` |
| Margin — small size | `size="small"` | `margin: 16px 0` |
| polystrat/omenstrat background | `agentType="polystrat_trader"` | `WHITE_TRANSPARENT_10` background |
| agentsFun background | `agentType="agentsFun"` | `NEUTRAL_GRAY` background |
| modius/optimus background | `agentType="modius"` | `DARK_GRAY` background |

### 3.5 `libs/ui-chat` — `useChats.ts`
**File:** `libs/ui-chat/src/lib/useChats.spec.ts`

| Test | Scenario | Expected |
|---|---|---|
| Mock enabled → resolves with mockChat | `IS_MOCK_ENABLED='true'` | mutation resolves with `mockChat` |
| Real API — success | `fetch` resolves ok | resolves with parsed JSON |
| Real API — non-ok response with `error` field | `{ error: 'Custom error' }` | throws `Error('Custom error')` |
| Real API — non-ok response without `error` field | 500 no body | throws default message |
| Real API — non-ok response with invalid JSON body | 500 invalid JSON | throws default message (JSON parse swallowed) |
| Calls correct endpoint | any | `POST /configure_strategies` with JSON body `{ prompt }` |
| Returns `{ isPending, mutateAsync }` | default | correct shape |

### 3.6 `libs/ui-chat` — `utils.ts`
**File:** `libs/ui-chat/src/lib/utils.spec.ts`

| Test | Scenario | Expected |
|---|---|---|
| Shows error notification | error thrown | `notification.error` called with `error.message` |
| Fallback notification | empty error message | "Failed to send chat." shown |
| Empty chats → `null` | `chats=[]` | returns `null` |
| Last chat is `'agent'` → `null` | last type is agent | returns `null` |
| Last chat is `'system'` → `null` | last type is system | returns `null` |
| User chat with string → rollback | `type: 'user', text: 'hello'` | `{ updatedChats, restoredText: 'hello' }` |
| `updatedChats` is `chats.slice(0, -1)` | 3 chats, last is user | `updatedChats.length === 2` |
| User chat with ReactNode → `null` (BUG-003) | `type: 'user', text: <span/>` | returns `null` — documents bug |
| Original `chats` array not mutated | any | original array unchanged |

---

## Phase 4 — `predict-ui` Utilities, Constants & Simple Components
**Branch:** `test/phase-4-predict-ui-utils`
**Setup:** `process.env.REACT_APP_AGENT_NAME = 'omenstrat_trader'` in jest setup

### 4.1 `predict-ui/utils/agentMap.ts`
**File:** `apps/predict-ui/src/utils/agentMap.spec.ts`

> Use `jest.resetModules()` + dynamic `require()` — see BUG-001.

| Test | Env | Expected |
|---|---|---|
| omenstrat | `'omenstrat_trader'` | `agentType = 'omenstrat_trader'`, `isOmenstratAgent = true`, `isPolystratAgent = false` |
| polystrat | `'polystrat_trader'` | `agentType = 'polystrat_trader'`, `isOmenstratAgent = false`, `isPolystratAgent = true` |
| Invalid value | `'invalid'` | throws `Error` with "Invalid REACT_APP_AGENT_NAME" |
| Undefined | `undefined` | throws `Error` |

### 4.2 `predict-ui/constants/currency.ts`
**File:** `apps/predict-ui/src/constants/currency.spec.ts`

- All 4 keys exist: `USD`, `USDC`, `USDT`, `USDC.e`
- Every symbol is `'$'`
- Every name is `'US Dollar'`
- No additional keys

### 4.3 `predict-ui/constants/textMaps.ts`
**File:** `apps/predict-ui/src/constants/textMaps.spec.ts`

- `TRADING_TYPE_MAP['risky'].displayName === 'Risky'`
- `TRADING_TYPE_MAP['risky'].type === 'danger'`
- `TRADING_TYPE_MAP['balanced'].displayName === 'Balanced'`
- `TRADING_TYPE_MAP['balanced'].type === 'primary'`

### 4.4 `predict-ui/constants/reactQueryKeys.ts`
**File:** `apps/predict-ui/src/constants/reactQueryKeys.spec.ts`

- `REACT_QUERY_KEYS` object exported
- All keys are non-empty strings with no duplicates

### 4.5 `predict-ui/constants/sizes.ts`
**File:** `apps/predict-ui/src/constants/sizes.spec.ts`

- `CHART_HEIGHT` is a positive number

### 4.6 `predict-ui/constants/urls.ts`
**File:** `apps/predict-ui/src/constants/urls.spec.ts`

- `POLYMARKET_PROFILE_BASE_URL` is a non-empty string

### 4.7 `predict-ui/components/ErrorState.tsx`
**File:** `apps/predict-ui/src/components/ErrorState.spec.tsx`

| Test | Scenario | Expected |
|---|---|---|
| Renders title | `title="Error"` | "Error" visible |
| Renders description | `description="Details"` | "Details" visible |
| Renders icon | `icon={Frown}` | SVG element rendered |
| Custom icon renders | `icon={Unplug}` | renders without crash |

### 4.8 `predict-ui/components/ui/Alert.tsx`
**File:** `apps/predict-ui/src/components/ui/Alert.spec.tsx`

- Renders with `type="error"` and `message`
- Renders with `type="warning"` and `description`
- Custom `style` prop applied
- All Ant Design Alert props pass through

### 4.9 `predict-ui/components/ui/Card.tsx`
**File:** `apps/predict-ui/src/components/ui/Card.spec.tsx`

- Renders children
- `$gap` prop applied as flex `gap` CSS
- `$padding` prop applied as padding CSS
- Default styling present (background, border-radius)

### 4.10 `predict-ui/components/AgentDetails.tsx`
**File:** `apps/predict-ui/src/components/AgentDetails.spec.tsx`

| Test | Scenario | Expected |
|---|---|---|
| Renders "Created:" label | with `createdAt` | "Created:" visible |
| Renders "Last active:" label | with `lastActiveAt` | "Last active:" visible |
| ISO string → `getTimeAgo` output | valid ISO date | time-ago string shown |
| `createdAt` missing → `NA` | `createdAt=undefined` | "n/a" shown for created |
| `lastActiveAt` missing → `NA` | `lastActiveAt=undefined` | "n/a" shown for last active |
| Both missing → both `NA` | no props | both "n/a" |

### 4.11 `predict-ui/components/Performance.tsx`
**File:** `apps/predict-ui/src/components/Performance.spec.tsx`

| Test | Scenario | Expected |
|---|---|---|
| Renders "Performance" heading | any data | heading visible |
| `all_time_funds_used` displayed | `metrics.all_time_funds_used = 150` | "$150" visible |
| `all_time_profit` displayed | `metrics.all_time_profit = 25` | "$25" visible |
| `funds_locked_in_markets` displayed | | correctly shown |
| `available_funds` displayed | | correctly shown |
| `predictions_made` formatted | `stats.predictions_made = 1500` | "1,500" (Intl formatted) |
| `prediction_accuracy = null` → text variant | | "Will appear with the first resolved market." |
| `prediction_accuracy = 0.534` → "53.40%" | | "53.40%" |
| `prediction_accuracy = 0` → "0.00%" | | "0.00%" |
| ROI in tooltip | `metrics.roi = 0.12` | "12.00%" in tooltip text |

---

## Phase 5 — `predict-ui` Data Hooks
**Branch:** `test/phase-5-predict-ui-hooks`

All hooks use `renderHookWithQueryClient` wrapper and `jest.spyOn(global, 'fetch')`.

### 5.1 `useAgentDetails` hook
**File:** `apps/predict-ui/src/hooks/useAgentDetails.spec.ts`

| Test | Scenario | Expected |
|---|---|---|
| Initial loading state | before fetch resolves | `isLoading = true` |
| Returns agent details on success | fetch returns `mockAgentDetails` | `data.agentDetails` populated |
| Returns performance on success | fetch returns `mockPerformance` | `data.performance` populated |
| `isError = true` when agent details fails | fetch rejects | `isError = true` |
| `isError = true` when performance fails | fetch rejects | `isError = true` |
| Calls `/agent/details` | | correct URL |
| Calls `/agent/performance` | | correct URL |

### 5.2 `useTradeHistory` hook
**File:** `apps/predict-ui/src/hooks/useTradeHistory.spec.ts`

| Test | Scenario | Expected |
|---|---|---|
| Returns loading on mount | | `isLoading = true` |
| Fetches correct URL | `page=1, pageSize=10` | `/agent/prediction-history?page=1&page_size=10` |
| Returns data on success | | `data.items` array |
| Returns error on 4xx | response `ok=false` | error state |

### 5.3 `usePositionDetails` hook
**File:** `apps/predict-ui/src/hooks/useTradeHistory.spec.ts` (same file)

| Test | Scenario | Expected |
|---|---|---|
| Calls `/agent/position-details/{id}` | `id = "abc"` | correct URL |
| Returns data on success | | `data.question` present |
| Returns error on failure | response not ok | error state |

### 5.4 `useProfitOverTime` hook
**File:** `apps/predict-ui/src/hooks/useProfitOverTime.spec.ts`

| Test | Scenario | Expected |
|---|---|---|
| Default window `7d` | | `/agent/profit-over-time?window=7d` |
| Window `30d` | `window='30d'` | correct URL |
| Window `lifetime` | `window='lifetime'` | correct URL |
| Returns data on success | | `data.points` array |
| Returns error on failure | | error state |

### 5.5 `useTradingDetails` hook
**File:** `apps/predict-ui/src/hooks/useTradingDetails.spec.ts`

- Calls `/agent/trading-details`
- Returns `{ trading_type, trading_type_description }`
- Returns error on failure

### 5.6 `useFeatures` hook (predict-ui)
**File:** `apps/predict-ui/src/hooks/useFeatures.spec.ts`

| Test | Scenario | Expected |
|---|---|---|
| Calls `/features` | default | correct URL |
| Returns `isChatEnabled` | | feature flag present |
| Refetch interval — chat enabled | `isChatEnabled=true` | interval = `FIVE_MINUTES` |
| Refetch interval — chat disabled | `isChatEnabled=false` | interval = `FIVE_SECONDS` |
| Returns error on failure | | error state |

---

## Phase 6 — `predict-ui` Complex Components
**Branch:** `test/phase-6-predict-ui-complex`

Mock all hooks at the module level with `jest.mock(...)`.

### 6.1 `TradeHistory.tsx`
**File:** `apps/predict-ui/src/components/TradeHistory/TradeHistory.spec.tsx`

| Test | Scenario | Expected |
|---|---|---|
| Loading spinner | `isLoading=true` | Spin visible |
| Empty state | `items=[]` | "No data yet." visible |
| Table columns | data present | Market, Prediction, Status columns |
| "Yes" side | `prediction_side='yes'` | "Yes" text |
| "No" side | `prediction_side='no'` | "No" text |
| Row click opens modal | click row | `PositionDetailsModal` rendered |
| Modal closes | click cancel in modal | modal unmounted |
| Pagination `total` | `total=25` | pagination rendered |
| Page change | click page 2 | `currentPage` updates |
| Polymarket button — polystrat | `isPolystratAgent=true` | "View on Polymarket" visible |
| Polymarket button hidden — omenstrat | `isPolystratAgent=false` | button not rendered |
| Polymarket URL | valid `agentSafeAddress` | href contains address |
| No Polymarket URL | no `agentSafeAddress` | button not rendered |

### 6.2 `TradeStatus.tsx`
**File:** `apps/predict-ui/src/components/TradeHistory/TradeStatus.spec.tsx`

| Test | Scenario | Expected |
|---|---|---|
| `status='won'` | `net_profit=10` | "Won $10" |
| `status='lost'` | `net_profit=5` | "Lost $5" |
| `status='invalid'` | any | "Invalid" |
| `status='pending'` without `remaining_seconds` | `bet_amount=20` | "Traded $20" |
| `status='pending'` with `remaining_seconds=3600` | | "1h 0m" |
| `remaining_seconds=0` | | "0m" |
| `net_profit=null` | | "n/a" |
| `currency='USDC'` | | symbol `$` |
| Unknown currency fallback | `currency='XYZ'` | `$` fallback |
| `extra` prop | `extra=<ClockIcon/>` | extra rendered before text |
| Custom `styles` | `styles={{ color: 'red' }}` | applied to Tag |
| `Math.abs` on negative profit | `net_profit=-5, status='lost'` | "Lost $5" (positive) |

### 6.3 `PositionDetailsModal.tsx`
**File:** `apps/predict-ui/src/components/TradeHistory/PositionDetailsModal/PositionDetailsModal.spec.tsx`

| Test | Scenario | Expected |
|---|---|---|
| Loading skeleton | `isLoading=true` | Skeleton rendered |
| Error alert | `error` present | Alert with error message |
| Invalid market alert | `status='invalid'` | `InvalidMarketAlert` rendered |
| Total amount shown | `total_bet=100` | "$100.000" |
| Won label | `status='won'` | "Won" label |
| `To win` label | `status='pending'` | "To win" label |
| Payout label | `status='invalid'` | "Payout" label |
| `formatCurrency` null → NA | `total_bet=null` | "n/a" |
| Bets collapse | `bets` array | Collapse items rendered |
| Single bet label | one bet | "Trade" (not "Trade 1") |
| Multiple bets labels | two bets | "Trade 1", "Trade 2" |
| No bets | `bets=[]` | "No trades found." |
| `onClose` called | cancel button | callback called |
| External market link | `external_url` present | anchor tag with href |

### 6.4 `Trade.tsx`
**File:** `apps/predict-ui/src/components/TradeHistory/PositionDetailsModal/Trade.spec.tsx`

| Test | Scenario | Expected |
|---|---|---|
| `strategy` shown | `strategy='risky'` | "Risky" visible |
| `strategy=null` hidden | | "Strategy" row not shown |
| `prediction_tool` shown | `prediction_tool='GPT-4'` | "GPT-4" visible |
| `prediction_tool=null` hidden | | prediction tool row not shown |
| Intelligence scores shown | `implied_probability=65.4` | "65%" (Math.round) |
| `confidence_score` rounded | `confidence_score=72.7` | "73%" |
| `utility_score` rounded | `utility_score=50.0` | "50%" |
| `placed_at` date shown | `placed_at='2024-01-15T10:00:00Z'` | formatted date visible |
| `placed_at=null` hidden | | date row not shown |
| `isLast=true` removes bottom margin | | no `marginBottom: 20` |

### 6.5 `ProfitOverTime.tsx`
**File:** `apps/predict-ui/src/components/ProfitOverTime/ProfitOverTime.spec.tsx`

| Test | Scenario | Expected |
|---|---|---|
| Loading spinner | `isLoading=true` | Spin visible |
| Error state | `isError=true` | "Failed to load profit data." |
| Empty state | `points=[]` | "No data yet." visible |
| Chart rendered | data present | Chart component rendered |
| Segmented switcher visible | data present | window options rendered |
| Segmented hidden when no data | `points=[]` | Segmented not rendered |
| Default window `7d` | | `7d` option selected |
| Selecting `30d` | click `30D` | window updated to `30d` |

### 6.6 `ProfitOverTime/Chart.tsx`
**File:** `apps/predict-ui/src/components/ProfitOverTime/Chart.spec.tsx`

| Test | Scenario | Expected |
|---|---|---|
| Renders without crash | any data | no throw |
| Empty data | `data=[]` | renders (no crash) |
| Tooltip — positive value | `value=10.5` | "Profit of $10.50" |
| Tooltip — negative value | `value=-5.0` | "Loss of $5.00" |
| Tooltip — zero | `value=0` | "No Profit or Loss" |
| Tooltip — NaN | `value=NaN` | "n/a" |
| Tooltip — non-number | `value=undefined` | "n/a" |
| Tooltip date | `label=new Date('2024-06-01')` | formatted date string |
| Tooltip — no label | `label=undefined` | "n/a" |
| Currency fallback | `currency` undefined | `$` symbol used |

---

## Phase 7 — `predict-ui` Chat, Strategy & App Shell
**Branch:** `test/phase-7-predict-ui-shell`

### 7.1 `predict-ui/components/Chat/SystemChat.tsx` (`TradingStrategy`)
**File:** `apps/predict-ui/src/components/Chat/SystemChat.spec.tsx`

| Test | Scenario | Expected |
|---|---|---|
| Renders "Strategy updated:" label | any | label visible |
| `from` Pill rendered | `from='risky'` | "Risky" Pill shown |
| `to` Pill rendered | `to='balanced'` | "Balanced" Pill shown with arrow |
| Both types resolve from map | risky→balanced | correct `displayName` used |

### 7.2 `predict-ui/components/Chat/Chat.tsx`
**File:** `apps/predict-ui/src/components/Chat/Chat.spec.tsx`

Mock `useChats` and `useQueryClient`.

| Test | Scenario | Expected |
|---|---|---|
| Renders `UiChat` component | mount | UiChat in DOM |
| Empty input → no send | `currentText=''`, click send | `mutateAsync` NOT called |
| Whitespace only → no send | `currentText='   '` | `mutateAsync` NOT called |
| Valid input → send | type text + click send | `mutateAsync` called with text |
| Input cleared after send | after send | textarea is empty |
| User message added to chats | send `'hello'` | `'hello'` visible in chat |
| `reasoning` → agent chat added | `data.reasoning = 'text'` | agent message in chat |
| Strategy update → system chat | `data.previous_trading_type` + `data.trading_type` | `TradingStrategy` rendered in chat |
| Error → rollback | mutation rejects | last user message restored in textarea |
| Error with no string text → no restore | ReactNode chat text + error | textarea stays empty (BUG-003) |
| Queries invalidated on success | success | `queryClient.invalidateQueries` called 3× |

### 7.3 `predict-ui/components/Strategy.tsx`
**File:** `apps/predict-ui/src/components/Strategy.spec.tsx`

Mock `useTradingDetails`.

| Test | Scenario | Expected |
|---|---|---|
| Loading skeleton | `isLoading=true` | Skeleton rendered |
| Renders "Strategy" heading | any | heading visible |
| Strategy name shown | `trading_type='risky'` | "Risky" visible |
| Strategy description shown | `trading_type_description='...'` | description text |
| `null` strategy → `NA` | `data=undefined` | "n/a" shown |
| Tooltip on info icon | hover | tooltip text visible |

### 7.4 `predict-ui/app/agent.tsx` (`Agent`, `AgentLoader`, `AgentError`, `AgentNotFound`, `ChatContent`)
**File:** `apps/predict-ui/src/app/agent.spec.tsx`

Mock `useAgentDetails` and `useFeatures`.

| Test | Scenario | Expected |
|---|---|---|
| Loading → `AgentLoader` | `isLoading=true` | Skeleton elements visible |
| Error → `AgentError` | `isError=true` | "Error loading data" visible |
| No agentDetails → `AgentNotFound` | `data.agentDetails=null` | "Agent not found" visible |
| Full render | all data present | all sub-components rendered |
| Chat enabled → Chat component | `isChatEnabled=true` | Chat rendered |
| Chat disabled → `UnlockChat` | `isChatEnabled=false` | UnlockChat rendered |
| Features loading → null | `useFeatures isLoading=true` | ChatContent renders nothing |

### 7.5 `predict-ui/app/app.tsx`
**File:** `apps/predict-ui/src/app/app.spec.tsx`

- Renders without crash with `REACT_APP_AGENT_NAME` set
- Contains `ErrorBoundary`
- Contains `AntdConfigProvider`
- Background image set for omenstrat, none for polystrat

---

## Phase 8 — `babydegen-ui` Utilities, Constants & Simple UI
**Branch:** `test/phase-8-babydegen-ui-utils`

### 8.1 `babydegen-ui/utils/chartjs/palette.ts`
**File:** `apps/babydegen-ui/src/utils/chartjs/palette.spec.ts`

- Color array exported and non-empty
- Every entry is a non-empty string

### 8.2 `babydegen-ui/constants/textMaps.ts`
**File:** `apps/babydegen-ui/src/constants/textMaps.spec.ts`

- All expected text map entries exist
- Values are non-empty strings

### 8.3 `babydegen-ui/constants/colors.ts`
**File:** `apps/babydegen-ui/src/constants/colors.spec.ts`

- All color constants defined
- Every value is a non-empty string

### 8.4 `babydegen-ui/ui/CardTitle.tsx`
**File:** `apps/babydegen-ui/src/ui/CardTitle.spec.tsx`

- Renders the `text` prop
- Applies correct typography

### 8.5 `babydegen-ui/ui/Pill.tsx` (wrapper)
**File:** `apps/babydegen-ui/src/ui/Pill.spec.tsx`

- Renders children
- Passes props through to shared `Pill` component

### 8.6 `babydegen-ui/components/ErrorBoundary.tsx`
**File:** `apps/babydegen-ui/src/components/ErrorBoundary.spec.tsx`

- Same cases as Phase 2.1 — confirms app-level wrapper works

### 8.7 `babydegen-ui/components/Strategy/Strategy.tsx`
**File:** `apps/babydegen-ui/src/components/Strategy/Strategy.spec.tsx`

Mock `useChats` and `useTradingDetails` (or equivalent).
- Renders strategy section heading
- Renders current trading type
- Renders description

### 8.8 `babydegen-ui/components/Chat/SystemChat.tsx`
**File:** `apps/babydegen-ui/src/components/Chat/SystemChat.spec.tsx`

- Same cases as predict-ui `TradingStrategy` (Phase 7.1) if structure is identical
- Confirm labels and Pill rendering

---

## Phase 9 — `babydegen-ui` Data Hooks
**Branch:** `test/phase-9-babydegen-ui-hooks`

### 9.1 `usePortfolio`
**File:** `apps/babydegen-ui/src/hooks/usePortfolio.spec.ts`

| Test | Scenario | Expected |
|---|---|---|
| Loading on mount | | `isLoading=true` |
| Calls `/portfolio` | | correct URL |
| Returns data | | `data` populated |
| Error on failure | | error state |
| Refetch interval: no data → 1000 ms | | correct interval |
| Refetch interval: data present → 5000 ms | | correct interval |

### 9.2 `useFeatures` (babydegen-ui)
**File:** `apps/babydegen-ui/src/hooks/useFeatures.spec.ts`

- Same cases as predict-ui `useFeatures` (Phase 5.6)
- Confirm same `/features` endpoint and refetch logic

### 9.3 `useFunds`
**File:** `apps/babydegen-ui/src/components/WithdrawAgentsFunds/useFunds.spec.ts`

| Test | Scenario | Expected |
|---|---|---|
| Calls `/withdrawal/amount` | | correct URL |
| Returns data | | `data` populated |
| Error on failure | | error state |
| Refetch: no data → 1000 ms | | correct interval |
| Refetch: data present → 5000 ms | | correct interval |

### 9.4 `useWithdrawFunds`
**File:** `apps/babydegen-ui/src/components/WithdrawAgentsFunds/useWithdrawFunds.spec.ts`

| Test | Scenario | Expected |
|---|---|---|
| `initiateWithdraw(address)` POSTs to `/withdrawal/initiate` | | correct URL + body |
| Response sets `withdrawId` | | status query becomes enabled |
| Status query calls `/withdrawal/status/{id}` | | correct URL |
| `isLoading` while mutation pending | | true |
| `isLoading` while status query pending | | true |
| `isError` on mutation error | | true |
| `isError` on status error | | true |
| Completed status stops refetch | `status='completed'` | `refetchInterval=false` |
| Non-completed status refetches | `status='pending'` | `refetchInterval=2000` |
| `withdrawId` reset on error | mutation error | status query disabled |
| `data` returned | | `data.status` accessible |

---

## Phase 10 — `babydegen-ui` Complex Components
**Branch:** `test/phase-10-babydegen-ui-complex`

### 10.1 `Portfolio/Portfolio.tsx`
**File:** `apps/babydegen-ui/src/components/Portfolio/Portfolio.spec.tsx`

Mock `usePortfolio`.

- Loading state shows skeleton/spinner
- Data rendered (portfolio name, balances)
- Error state shown on failure
- "Allocation" heading or breakdown link present

### 10.2 `Portfolio/BreakdownModal.tsx`
**File:** `apps/babydegen-ui/src/components/Portfolio/BreakdownModal.spec.tsx`

- Modal opens when triggered
- Data shown in modal
- Modal closes on cancel
- Empty state handled

### 10.3 `Allocation/AllocationTable.tsx`, `AllocationPie.tsx`, `AllocationAssets.tsx`, `Allocation.tsx`
**Files:** Individual spec files per component.

- Each sub-component renders without crash with mock data
- Table shows correct rows
- Pie chart renders (smoke test — full chart rendering not required)
- Assets list renders

### 10.4 `WithdrawAgentsFunds/WithdrawAgentsFunds.tsx`
**File:** `apps/babydegen-ui/src/components/WithdrawAgentsFunds/WithdrawAgentsFunds.spec.tsx`

Mock `useFunds` and `useWithdrawFunds`.

| Test | Scenario | Expected |
|---|---|---|
| Renders withdrawal heading | mount | heading visible |
| Shows available balance | `data` present | balance visible |
| Address input present | | input field rendered |
| Submit calls `initiateWithdraw` | enter address + submit | mutation called |
| Loading state | `isLoading=true` | loading indicator |
| Error state | `isError=true` | error message shown |
| Status progress | `data.status='pending'` | progress/status shown |
| Completed state | `data.status='completed'` | success message |

### 10.5 `WithdrawInvestedFunds.tsx`
**File:** `apps/babydegen-ui/src/components/WithdrawAgentsFunds/WithdrawInvestedFunds.spec.tsx`

- Renders component
- Shows relevant info

### 10.6 `babydegen-ui/components/Chat/Chat.tsx`
**File:** `apps/babydegen-ui/src/components/Chat/Chat.spec.tsx`

- Same cases as predict-ui `Chat.tsx` (Phase 7.2) adjusted for agent type `modius`/`optimus`

### 10.7 `babydegen-ui/App.tsx`
**File:** `apps/babydegen-ui/src/App.spec.tsx`

Mock all hooks.

- Renders without crash
- `isChatEnabled=true` shows `Strategy` + `Chat`
- `isChatEnabled=false` shows `UnlockChat`
- `isLoading` returns nothing (not shows unlock)
- All main sections rendered: Portfolio, Allocation, Withdrawal

---

## Phase 11 — `agentsfun-ui` Hooks & Data-Fetching Components
**Branch:** `test/phase-11-agentsfun-ui-hooks`

### 11.1 `agentsfun-ui/hooks/useAgentDetails.ts`
**File:** `apps/agentsfun-ui/src/hooks/useAgentDetails.spec.ts`

- Calls correct API endpoint for agent details
- Returns `{ name, username, personaDescription }`
- Loading and error states

### 11.2 `agentsfun-ui/hooks/useFeatures.ts`
**File:** `apps/agentsfun-ui/src/hooks/useFeatures.spec.ts`

- Same cases as predict-ui `useFeatures`

### 11.3 `agentsfun-ui/hooks/usePerformance.ts`
**File:** `apps/agentsfun-ui/src/hooks/usePerformance.spec.ts`

- Calls correct endpoint
- Returns performance metrics

### 11.4 `agentsfun-ui/hooks/useXActivity.ts`
**File:** `apps/agentsfun-ui/src/hooks/useXActivity.spec.ts`

- Calls correct endpoint
- Returns X activity data

### 11.5 `agentsfun-ui/hooks/useMemecoinActivity.ts`
**File:** `apps/agentsfun-ui/src/hooks/useMemecoinActivity.spec.ts`

- Calls correct endpoint
- Returns memecoin activity data

### 11.6 `agentsfun-ui/hooks/useGeneratedMedia.ts`
**File:** `apps/agentsfun-ui/src/hooks/useGeneratedMedia.spec.ts`

- Calls correct endpoint
- Returns generated media data
- Loading and error states

### 11.7 `agentsfun-ui/components/Persona.tsx`
**File:** `apps/agentsfun-ui/src/components/Persona.spec.tsx`

Mock `useAgentDetails`.

| Test | Scenario | Expected |
|---|---|---|
| Loading state | `isLoading=true` | `PersonaLoading` skeleton rendered |
| Error state | `isError=true` | error message shown |
| Agent name shown | `data.name='AgentX'` | "AgentX" visible |
| Username link | `data.username='agentx'` | "@agentx" button visible |
| X link href | click username | opens `${X_URL}/agentx` |
| Persona description shown | `data.personaDescription='...'` | description text visible |
| Empty description | `personaDescription=''` | no crash |
| Expand/collapse description | long text | expand button present |

### 11.8 `agentsfun-ui/components/Performance.tsx`
**File:** `apps/agentsfun-ui/src/components/Performance.spec.tsx`

Mock `usePerformance`.

- Loading state shows skeleton
- Error state shown
- Performance metrics rendered correctly

### 11.9 `agentsfun-ui/components/MemecoinActivity.tsx`
**File:** `apps/agentsfun-ui/src/components/MemecoinActivity.spec.tsx`

Mock `useMemecoinActivity`.

- Loading state
- Empty state when no activity
- Activity items rendered

---

## Phase 12 — `agentsfun-ui` Remaining Components + App Shells
**Branch:** `test/phase-12-final`

### 12.1 `agentsfun-ui/components/XActivity.tsx`
**File:** `apps/agentsfun-ui/src/components/XActivity.spec.tsx`

Mock `useXActivity`.

- Loading/error/empty/data states

### 12.2 `agentsfun-ui/components/AiGeneratedMedia.tsx`
**File:** `apps/agentsfun-ui/src/components/AiGeneratedMedia.spec.tsx`

Mock `useGeneratedMedia`.

- Loading/error/empty/data states
- Media items rendered

### 12.3 `agentsfun-ui/components/Chat/Chat.tsx`
**File:** `apps/agentsfun-ui/src/components/Chat/Chat.spec.tsx`

- Same cases as predict-ui Chat (Phase 7.2) for `agentType='agentsFun'`

### 12.4 `agentsfun-ui/components/ErrorBoundary.tsx`
**File:** `apps/agentsfun-ui/src/components/ErrorBoundary.spec.tsx`

- Same cases as Phase 2.1

### 12.5 `agentsfun-ui/components/svgs/Chart.tsx`, `Heart.tsx`
**Files:** `Chart.spec.tsx`, `Heart.spec.tsx`

- Each SVG renders without crash
- Returns an `<svg>` element
- Accepts and passes through common SVG props

### 12.6 `agentsfun-ui/components/ui/Card.tsx`, `ErrorState.tsx`, `EmptyState.tsx`
**Files:** Individual spec files.

- Card renders children, custom styles applied
- ErrorState shows `message` prop
- EmptyState shows placeholder content

### 12.7 `agentsfun-ui/app/app.tsx` (extend existing smoke test)
**File:** `apps/agentsfun-ui/src/app/app.spec.tsx`

- Renders without crash (already exists — extend)
- `isChatEnabled=true` shows Chat
- `isChatEnabled=false` shows UnlockChat
- `useFeatures` loading → renders without Chat section
- ErrorBoundary wraps content

### 12.8 `agentsfun-ui` mock data validation
**File:** `apps/agentsfun-ui/src/mocks/mocks.spec.ts`

- All mock files export non-null data
- Shapes match TypeScript types (structural check)

---

## Testing Infrastructure Reference

### NX commands
```bash
yarn nx test predict-ui                            # single project
yarn nx test util-functions -- --coverage          # single with coverage
yarn nx run-many --target=test --all --coverage    # all projects
yarn nx affected --target=test                     # only changed projects
```

### Mock fetch
```ts
beforeEach(() => {
  jest.spyOn(global, 'fetch').mockResolvedValue({
    ok: true,
    json: () => Promise.resolve(mockData),
  } as Response);
});
afterEach(() => jest.restoreAllMocks());
```

### Env-var-dependent modules (`jest.resetModules`)
```ts
beforeEach(() => {
  jest.resetModules();
  process.env.REACT_APP_AGENT_NAME = 'omenstrat_trader';
});
it('loads module', () => {
  const { agentType } = require('../utils/agentMap');
  expect(agentType).toBe('omenstrat_trader');
});
```

### Suppress `console.error` in ErrorBoundary tests
```ts
beforeEach(() => jest.spyOn(console, 'error').mockImplementation(() => {}));
afterEach(() => jest.restoreAllMocks());
```

---

## What Intentionally Remains at ~0% (unless time allows)

| Item | Reason |
|---|---|
| Pixel-perfect chart snapshots (Recharts/Chart.js) | Flaky — SVG output varies by environment |
| `GlobalStyles.tsx` CSS injection in DOM | Verifiable via smoke test only |
| `donut-center-plugin.ts` canvas drawing | Requires canvas mock setup (`jest-canvas-mock`) |
| E2E / integration flows across multiple pages | Scope: unit + component tests only |

> These can be addressed in a follow-up milestone with E2E tooling (Playwright/Cypress).

---

## Definition of Done per Phase

- [ ] All new spec files pass locally via `yarn nx test <project>`
- [ ] No `act()` warnings from React Testing Library
- [ ] No unhandled promise rejections in tests
- [ ] CI pipeline (`check-pull-request.yml`) passes
- [ ] Coverage report shows measurable gain vs prior baseline
- [ ] Known bugs (BUG-001 through BUG-005 in `BUGS.md`) are either fixed or have a regression test documenting current behavior
