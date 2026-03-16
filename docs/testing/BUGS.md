# Bugs Found During Test Planning

Bugs identified by static analysis while mapping out the test plan.
Each has a severity rating: **Critical** / **Medium** / **Low**.

---

## BUG-001 — `predict-ui/agentMap.ts` Throws at Module Load Time
**Severity:** Critical
**File:** `apps/predict-ui/src/utils/agentMap.ts`

### Description
`agentType` is computed via an IIFE that unconditionally throws a runtime `Error` if
`REACT_APP_AGENT_NAME` is not exactly `"omenstrat_trader"` or `"polystrat_trader"`.

```ts
export const agentType: AgentType = (() => {
  const name = process.env.REACT_APP_AGENT_NAME;
  if (name === 'omenstrat_trader') return 'omenstrat_trader';
  if (name === 'polystrat_trader') return 'polystrat_trader';
  throw new Error(
    `Invalid REACT_APP_AGENT_NAME: "${name}". Expected "omenstrat_trader" or "polystrat_trader".`
  );
})();
```

### Impact
- **Every module that imports from `agentMap.ts`** will fail to load if the env var is not set at import time — this includes `TradeHistory.tsx`, `TradeStatus` indirectly, and any component test.
- CI jobs that do not inject `REACT_APP_AGENT_NAME` will have cascading failures across all `predict-ui` tests.
- If the env var is accidentally missing in a production build, the entire app will be blank (uncaught exception during module evaluation).

### Reproduction
```ts
// Without env var set:
import { agentType } from './agentMap'; // throws immediately
```

### Suggested Fix
Gracefully handle missing/invalid env var with a fallback default and a warning, or check at the component level rather than module evaluation time:

```ts
// Option A: fallback with warning
const name = process.env.REACT_APP_AGENT_NAME;
if (name !== 'omenstrat_trader' && name !== 'polystrat_trader') {
  console.warn(`Invalid REACT_APP_AGENT_NAME: "${name}". Defaulting to "omenstrat_trader".`);
}
export const agentType: AgentType =
  name === 'polystrat_trader' ? 'polystrat_trader' : 'omenstrat_trader';
```

---

## BUG-002 — `predict-ui/utils/time.ts` — `getTimeAgo` Returns Negative Values for Future Timestamps
**Severity:** Medium
**File:** `apps/predict-ui/src/utils/time.ts`

### Description
`getTimeAgo(ms)` computes `Date.now() - ms` without guarding against the case where `ms` is in the future (`ms > Date.now()`). All intermediate values (`differenceInMinutes`, `differenceInHours`, etc.) will be negative, causing the returned string to read e.g. **"-1 minutes ago"**.

```ts
export const getTimeAgo = (ms: number, showPostfix = true) => {
  const differenceInMs = Date.now() - ms; // negative if ms is future

  const differenceInMinutes = Math.floor(differenceInMs / (1000 * 60)); // e.g. -1
  ...
  return `${differenceInMinutes} minute${differenceInMinutes > 1 ? 's' : ''}${postfix}`;
  // → "-1 minute ago"
};
```

### Impact
If the server returns a timestamp slightly ahead of the client clock (clock skew) or returns a future event timestamp, the UI will display a negative time string.

### Reproduction
```ts
const futureMs = Date.now() + 5 * 60 * 1000; // 5 minutes from now
getTimeAgo(futureMs); // → "-4 minutes ago" or similar
```

### Suggested Fix
```ts
const differenceInMs = Math.max(0, Date.now() - ms);
```

---

## BUG-003 — `ui-chat/utils.ts` — `handleChatError` Silently Drops Non-String ReactNode Messages
**Severity:** Medium
**File:** `libs/ui-chat/src/lib/utils.ts`

### Description
When a chat send fails, `handleChatError` attempts to roll back the last user message. However, when the last chat's `text` is a `ReactNode` (i.e., JSX, not a string), the function returns `null` without restoring any text — the user's input is silently discarded.

```ts
export const handleChatError = ({ error, chats }: HandleChatErrorParams) => {
  ...
  if (typeof lastChat.text === 'string') {
    return { updatedChats: chats.slice(0, -1), restoredText: lastChat.text };
  }
  return null; // ReactNode text is lost here — no restoration
};
```

### Impact
If a consumer passes a chat message with a `ReactNode` as the text and the send fails, the user sees the message disappear with no way to re-send — poor UX. The type `EachChat.text` is `ReactNode` which includes strings, JSX, and other structures.

### Suggested Fix
Consider serializing the ReactNode to a string fallback, or restrict the `user` chat type to only accept `string` text (use `ReactNode` only for `'agent'` and `'system'` types):

```ts
// Option: split text typing by chat type
type UserChat = { type: 'user'; text: string };
type AgentChat = { type: 'agent' | 'system'; text: ReactNode };
export type EachChat = UserChat | AgentChat;
```

---

## BUG-004 — `ui-pill/Pill.tsx` — `hasType` Is Always `true` (Dead Code Branch)
**Severity:** Low
**File:** `libs/ui-pill/src/lib/Pill.tsx`

### Description
The `getSpacing` helper accepts a `hasType: boolean` parameter, and different padding/margin values are returned for `true` vs `false`. However, since `type` has a default value of `'neutral'` and `PillType` is a non-nullable union (`'primary' | 'danger' | 'neutral'`), `!!type` in the call `getSpacing(size, !!type)` is **always `true`**.

```ts
// type always has a value due to the default
export const Pill = ({ type = 'neutral', size = 'small', style, children }: PillProps) => {
  const spacing = getSpacing(size, !!type); // !!type is always true
  ...
};
```

The `hasType: false` branch in `getSpacing`:
- `padding: size === 'small' ? '2px 4px 2px 8px' : ...` — never reached
- `marginLeft: 0` — never reached

### Impact
Consumers who pass no `type` prop (intending to use it as a plain badge without a colored dot) always get `marginLeft: -28` and extra left padding, potentially causing unexpected layout shifts.

### Suggested Fix
Either:
1. Remove the `hasType` parameter from `getSpacing` since it is unreachable.
2. If type-less behavior is intentional, make `type` explicitly optional (`type?: PillType`) and handle `undefined` in `getSpacing`.

---

## BUG-005 — `babydegen-ui/donut-center-plugin.ts` — `onload` Race Condition & Potential `ctx` Use After Destroy
**Severity:** Low
**File:** `apps/babydegen-ui/src/utils/chartjs/donut-center-plugin.ts`

### Description
Two issues:

**Issue A — `onload` reassignment race:** The `image` object is created at module scope. In `beforeDraw`, if `!image.complete`, a new `onload` callback is attached. If `beforeDraw` is called multiple times while the image is loading, each call overwrites the previous `onload`, meaning only the last chart will get the drawn logo.

**Issue B — `ctx` use after chart destroy:** If the chart component is unmounted while the image is still loading, the `onload` callback fires and calls `ctx.drawImage(...)` on a destroyed canvas context, which may throw or be a no-op depending on the browser.

```ts
// image is module-level — shared across all chart instances
const image = new Image();
image.src = `/logos/networks/${agentChainName}-network.png`;

beforeDraw: (chart) => {
  ...
  if (image.complete) {
    ctx.drawImage(...);
  } else {
    image.onload = () => {
      ctx.drawImage(...); // could use stale/destroyed ctx
    };
  }
},
```

### Suggested Fix
Move the `Image` inside `beforeDraw` or use a module-level promise that resolves once. Check if the canvas is still mounted before drawing:

```ts
// In beforeDraw, guard before drawing:
image.onload = () => {
  if (chart.canvas) {
    ctx.drawImage(image, centerX, centerY, imageSize, imageSize);
  }
};
```
