# Bugs Found During Test Planning

Bugs identified by static analysis while mapping out the test plan.
Each has a severity rating: **Critical** / **Medium** / **Low**.

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

## BUG-005 — `babydegen-ui/donut-center-plugin.ts` — `onload` Race Condition (Partially Fixed)
**Severity:** Low
**File:** `apps/babydegen-ui/src/utils/chartjs/donut-center-plugin.ts`

### Description
The `image` object is created at module scope and shared across all chart instances. In `beforeDraw`, if `!image.complete`, a new `onload` callback is attached. If `beforeDraw` is called multiple times while the image is loading, each call overwrites the previous `onload`, meaning only the last chart will get the drawn logo.

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
      ctx.drawImage(...); // overwrites previous onload on each beforeDraw call
    };
  }
},
```

### Fix Applied
Added `if (chart.canvas)` guard before drawing in the `onload` callback to prevent ctx use after chart destroy.

### Remaining
The module-level `image` object being shared across chart instances (onload reassignment race) is a design-level concern best addressed with a canvas-mock unit test or E2E test. Deferred to a later phase.
