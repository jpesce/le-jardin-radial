# 16 — Storybook

## Context

The project has reusable components (Button, Checkbox, MonthGrid, FlowerRow) with multiple variants but no way to browse or test them in isolation. Storybook provides a component playground that serves as both documentation and a development tool. Strong portfolio signal.

## Scope

Set up Storybook and write stories for key components.

## Components to document

### Button

- All variants: outline, solid, ghost
- Shapes: default (rounded-md), round (rounded-full)
- Sizes: xs, sm, md, lg
- Colors: default, danger
- States: default, hover, active
- Icon-only vs icon + text
- Animated width transition (animated prop)

### Checkbox

- Unchecked, checked
- Hover state (within a group)

### MonthGrid

- Empty (all dormant)
- Mixed states
- Custom bloom color

### FlowerRow

- Selected vs unselected
- Custom flower (shows edit button + user icon)
- Catalog flower

### Logo

- Different owner names → different color combinations

## Setup

```bash
pnpm dlx storybook@latest init
```

Storybook auto-detects Vite + React + TypeScript. Tailwind works via the existing Vite plugin.

## Files to create

| File                                   | Change                                            |
| -------------------------------------- | ------------------------------------------------- |
| `.storybook/main.ts`                   | **Auto-generated** — Storybook config             |
| `.storybook/preview.ts`                | **Auto-generated** — import `index.css` for theme |
| `src/components/Button.stories.tsx`    | **Create** — all variant/size/shape combinations  |
| `src/components/Checkbox.stories.tsx`  | **Create** — checked/unchecked states             |
| `src/components/MonthGrid.stories.tsx` | **Create** — grid with different states           |
| `src/components/Logo.stories.tsx`      | **Create** — different names                      |

## Considerations

- Storybook adds ~15 devDependencies — only for development, not bundled
- Stories should import `src/index.css` for Tailwind theme to work
- FlowerRow needs a `group` wrapper in stories to demonstrate hover
- MonthGrid needs an `onChange` handler — use Storybook's `action()` helper
- Button's animated variant needs Framer Motion — works out of the box
- Add `storybook-static` to `.gitignore` (built storybook output)
- Add `pnpm storybook` and `pnpm build-storybook` scripts to `package.json`
