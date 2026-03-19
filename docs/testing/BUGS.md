# Bugs Found During Test Planning

Bugs identified by static analysis while mapping out the test plan.
Each has a severity rating: **Critical** / **Medium** / **Low**.

---

## BUG-003 — `ui-chat/utils.ts` — `handleChatError` Silently Drops Non-String ReactNode Messages

**Severity:** Medium → **FIXED**
**File:** `libs/ui-chat/src/lib/types.ts`, `libs/ui-chat/src/lib/utils.ts`

### Fix Applied

`EachChat` split into a discriminated union so `user` chats always have `text: string`:

```ts
export type EachChat =
  | { type: 'user'; text: string }
  | { type: 'agent' | 'system'; text: ReactNode };
```

`handleChatError` simplified — the redundant `typeof lastChat.text === 'string'` guard removed since the type system now guarantees user chats carry string text. The invalid state (user chat with ReactNode text) is impossible at compile time.

---

## BUG-004 — `ui-pill/Pill.tsx` — `hasType` Is Always `true` (Dead Code Branch)

**Severity:** Low → **FIXED**
**File:** `libs/ui-pill/src/lib/Pill.tsx`

### Fix Applied

Removed the `type = 'neutral'` default from props destructuring so `!!type` correctly evaluates to `false` when no type is passed:

```ts
export const Pill = ({ type, size = 'small', style, children }: PillProps) => {
  const { background, badgeColor, boxShadow } = PILL_STYLES[type ?? 'neutral'];
  const spacing = getSpacing(size, !!type); // now correctly false when type is undefined
  ...
};
```

`<Pill>` without a type now correctly gets `marginLeft: 0` and `padding: '2px 4px 2px 8px'` (no dot indent).

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
