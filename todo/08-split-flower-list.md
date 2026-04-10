# 08 — Split FlowerList into sub-components

## Context

`FlowerList.tsx` is 430+ lines with multiple responsibilities: panel container, view routing (garden/manage/create/edit), popover coordination, drag-reorder integration, owner input, labels toggle, and keyboard navigation. This makes it hard to read, test, and maintain.

## Scope

Extract the view-specific rendering into focused sub-components while keeping FlowerList as the orchestrator.

## Proposed structure

```
FlowerList.tsx          — Panel container, view state, popover coordination, keyboard nav (~150 lines)
├── FlowerGardenView.tsx  — Owner input, labels toggle, flower list with drag-reorder (~150 lines)
├── FlowerCatalog.tsx     — Already exists, no changes needed
└── FlowerEditor.tsx      — Already exists, no changes needed
```

## What moves out of FlowerList

### FlowerGardenView (new component)

Everything inside the `view === 'garden'` branch:

- Owner name input
- Show labels checkbox
- "Visible flowers" title with edit pencil
- Flower items list with drag-reorder, checkboxes, hover states, dividers
- Drop indicators

Props: `gardenFlowers`, `selected`, `showLabels`, `gardenOwner`, callbacks for toggling/reordering/editing, `dragFrom`/`dropTarget` from useDragReorder.

### What stays in FlowerList

- Panel wrapper positioning (absolute top-right)
- Panel open/close state and animation
- View state management (`view`, `setView`)
- Panel actions bar (reset, share, plan garden buttons)
- Popover coordination (`activePopover`)
- Keyboard navigation (Escape key handling)
- Click-outside to close
- The `<AnimatePresence>` wrapper and panel `<motion.aside>`

## Files to create/modify

| File                                  | Change                                                    |
| ------------------------------------- | --------------------------------------------------------- |
| `src/components/FlowerGardenView.tsx` | **Create** — extracted garden view with drag-reorder list |
| `src/components/FlowerList.tsx`       | Simplify to orchestrator, import FlowerGardenView         |

## Considerations

- `useDragReorder` hook needs the list ref — pass it from FlowerList or move it to FlowerGardenView
- The `sortedFlowers` memo and `selectedSet` memo move to FlowerGardenView
- Keep the `cn()` import and `group` class pattern in the new component
- E2E tests should pass unchanged since the DOM structure stays the same
- Visual regression tests should pass since no styling changes
