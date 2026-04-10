# 11 — Keyboard support for flower reordering

## Context

Flower reordering only works via pointer drag. The drag handle has `role="img"` and `aria-label="reorder"` but no keyboard handler. Screen reader and keyboard-only users can't reorder flowers.

## Scope

Add arrow key support for reordering selected flowers when a drag handle is focused.

## Approach

When a drag handle (or its parent flower item) is focused:

- **ArrowUp** moves the flower one position up in the selected list
- **ArrowDown** moves it one position down
- Visual feedback: the item animates to its new position (Framer Motion `layout` already handles this)
- Announce the move to screen readers via `aria-live` region

## Implementation

1. Make the drag handle focusable: `tabIndex={0}` + `role="button"` (not `role="img"`)
2. Add `onKeyDown` handler to the drag handle or flower item
3. On ArrowUp/ArrowDown: call `onReorder` with the updated array (same logic as pointer drag completion)
4. Prevent page scroll with `e.preventDefault()`
5. Keep focus on the moved item after reorder

## Files to modify

| File                            | Change                                                      |
| ------------------------------- | ----------------------------------------------------------- |
| `src/components/FlowerList.tsx` | Add keydown handler to drag handle, change role to "button" |
| `src/hooks/useDragReorder.ts`   | Optionally expose a `moveItem(fromIdx, toIdx)` helper       |

## Considerations

- Only selected flowers (checked) can be reordered — unselected flowers don't have drag handles
- The `layout` animation on `<motion.li>` should automatically animate the position change
- Screen reader announcement: add a visually-hidden `aria-live="polite"` region that says "Moved {flower} to position {n}"
- Focus management: after move, the same flower's drag handle should retain focus
- E2E test: add a keyboard reorder test using `page.keyboard.press('ArrowUp')`
