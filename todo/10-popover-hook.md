# 10 — Extract reusable usePopover hook

## Context

Three components implement the same popover pattern independently: ResetConfirmation, ShareButton, and SharedBanner. Each has its own `useClickOutside` call, Escape key handler, and AnimatePresence wrapper. The popover coordination (mutual exclusivity) is managed by FlowerList's `activePopover` state.

## Scope

Extract the shared popover behavior into a `usePopover` hook and optionally a `Popover` wrapper component.

## What's duplicated

Each popover component does:

1. `useClickOutside(onClose, isOpen)` — close on click outside
2. `useEffect` with Escape key listener — close on Escape
3. `<AnimatePresence>` + `<motion.div>` with identical animation props
4. `onPointerDown={(e) => e.stopPropagation()}` on the dropdown

## Proposed API

### usePopover hook

```tsx
const { isOpen, dropdownProps } = usePopover({
  isOpen, // controlled from parent
  onClose, // callback to parent
});
// dropdownProps includes: onPointerDown stopPropagation
```

### Popover wrapper component (optional)

```tsx
<Popover isOpen={isOpen} onClose={onClose} className="...">
  {/* dropdown content */}
</Popover>
```

Handles AnimatePresence, motion.div animation, click-outside, and Escape.

## Files to create/modify

| File                                   | Change                                                 |
| -------------------------------------- | ------------------------------------------------------ |
| `src/hooks/usePopover.ts`              | **Create** — hook with click-outside + Escape handling |
| `src/components/Popover.tsx`           | **Create** (optional) — animated dropdown wrapper      |
| `src/components/ResetConfirmation.tsx` | Simplify using usePopover/Popover                      |
| `src/components/ShareButton.tsx`       | Simplify using usePopover/Popover                      |
| `src/components/SharedBanner.tsx`      | Simplify using usePopover/Popover                      |

## Considerations

- SharedBanner's confirm popover has a different position (anchored to save button, not top-right) — the hook should be position-agnostic
- ShareButton has extra internal state (pendingFile, importError) that resets on reopen — handle via the `wasOpen` pattern already in place
- The animation props (`initial`, `animate`, `exit`, `transition`) are identical across all three — good candidate for the Popover component
- This is a DRY improvement, not a behavior change — all E2E tests should pass unchanged
