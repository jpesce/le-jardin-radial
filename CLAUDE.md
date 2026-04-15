# CLAUDE.md

## Project

React + D3.js + TypeScript garden visualization. Deployed at jardin.pesce.cc via GitHub Pages.

## Commands

- `pnpm dev` — development server
- `pnpm build` — production build (generates `dist/404.html`, `dist/en/index.html`, `dist/fr/index.html` for SPA routing with proper 200 status)
- `pnpm test` — unit tests (vitest)
- `pnpm test:e2e` — E2E + visual regression tests (playwright)
- `pnpm lint` — ESLint (strictTypeChecked)
- `pnpm typecheck` — TypeScript type checking

## Stack

- **TypeScript** — strict + noUncheckedIndexedAccess
- **React 19** + **Vite**
- **D3.js** — imperative radial chart
- **Zustand** — state management with persist middleware
- **Tailwind CSS v4** — utility-first styling, design tokens via `@theme`
- **Radix UI** — Popover and Checkbox primitives (shadcn copy-paste model)
- **Framer Motion** — animations (panel, banner)
- **Playwright** — E2E + visual regression tests
- **Vitest** — unit tests
- **ESLint** (strictTypeChecked) + **Prettier** + **commitlint** + **Husky**
- **tailwind-merge** + **clsx** — `cn()` helper for class composition

## Architecture

### State — Zustand store (4 modules in `src/hooks/`)

Garden state split into focused modules with acyclic dependencies:

```
useGarden.ts → gardenStore.ts → gardenReducer.ts → gardenReconciliation.ts
```

- **`gardenReconciliation.ts`** — Pure data: validation (`isValidState`), reconciliation (`reconcile`), share URL decoding (`getSharedState`), state factories (`freshState`, `initialState`), localStorage loading. Leaf dependency.
- **`gardenReducer.ts`** — Pure state transitions: `GardenAction` discriminated union (12 action types) and `reducer()` function.
- **`gardenStore.ts`** — Zustand `create()` with `persist` middleware, `dispatch()` bridge, all action methods.
- **`useGarden.ts`** — React hook with computed properties (`availableFlowers`, `gardenFlowers`, `selectedFlowers`, `allFlowers`), popstate listener, `getShareUrl()`, `exportJson()`. Re-exports from other modules for backward-compatible imports.

State model: `{ owner, labels, defaultCatalog, garden[], selected[], customFlowers{}, isShared }` — fully serializable via `GardenState` type in `src/types.ts`.

- **Share URLs**: `/share/<lz-string-compressed-state>` with embedded language. Only garden flowers included in URL (not full catalog).
- **IDs**: catalog flowers have stable slugs (`"rose"`, `"snowdrop"`). Custom flowers use `crypto.randomUUID()`.
- `panelOpen` stays in `App.tsx` — UI state, not garden state.

### Components

**Reusable primitives:**

- **Button** (`Button.tsx`): `variant` (outline/solid/ghost), `round`, `size` (xs-lg), `color` (default/danger), `animated` prop for width transitions via `useLayoutEffect` + `getBoundingClientRect`. Uses `cn()` for class composition.
- **BackButton** (`BackButton.tsx`): Shared back navigation button with ArrowLeft icon and hover animation. Suppresses transition on mount to prevent flicker when switching views.
- **Checkbox** (`ui/checkbox.tsx`): Radix Checkbox (shadcn). Small square indicator, not check icon.
- **Popover** (`ui/popover.tsx`): Radix Popover (shadcn). CSS keyframe animations (`popover-in`/`popover-out`), `data-[state]` driven. Built-in focus trapping, click-outside dismiss, Escape key.

**Layout components:**

- **Header** (`Header.tsx`): App header — logo, action buttons (Reset, Share, GardenPanel). Reads garden state from Zustand directly. Manages popover mutual exclusivity. Responsive: stacked logo on desktop, inline logo on mobile. Uses `useIsMobile` hook for button shape/size.
- **Footer** (`Footer.tsx`): Language switcher, description, and credits. Absolute on desktop, stacked flow on mobile.

**Panel components:**

- **GardenPanel** (`GardenPanel.tsx`): Self-contained Radix Popover — trigger button + editing panel. View routing (garden/manage/create/edit), custom Escape handler (capture phase, preempts Radix for view navigation), `onOpenAutoFocus` prevented to avoid selecting input. Reads garden state from Zustand directly.
- **FlowerGardenView** (`FlowerGardenView.tsx`): Garden view — owner input, labels toggle, sortable flower list. Composed of `FlowerListItem` (animated row with drop indicators) and `DragHandle` (grip icon for reorder). Drag reorder defers `setPointerCapture` until drag threshold (3px) so clicks pass through to checkboxes and labels. Keyboard reorder via ArrowUp/ArrowDown with `aria-live` announcements. Hover state JS-controlled via `data-hovered` to support suppression during drag and animation.
- **FlowerCatalog** (`FlowerCatalog.tsx`): Manage view — searchable list, garden membership toggles.
- **FlowerEditor** (`FlowerEditor.tsx`): Create/edit view — name (en/fr), scientific name, bloom color, month grid.
- **FlowerRow** (`FlowerRow.tsx`): Flower list item fragment — requires parent `group` class for hover styles. Edit button and drag handle always visible on mobile (`max-sm:opacity-100`).

**Action controls:**

- **Reset** (`Reset.tsx`): Reset button + Radix confirmation popover. Accepts `round`, `size`, `align` pass-through props.
- **Share** (`Share.tsx`): Share button + Radix menu popover with copy link, save/load garden, image export sub-view (SVG/PNG). Accepts `round`, `size`, `align` pass-through props.

**Other:**

- **RadialChart** (`RadialChart.tsx`): D3 imperative chart with `svgRef` prop for image export. Dynamic viewBox sized to fit non-scaling labels at any screen size. Non-scaling elements hidden until ResizeObserver provides measurement. Flower labels appear immediately on load, fade only on user toggle.
- **SharedBanner** (`SharedBanner.tsx`): Read-only mode banner with save confirmation popover. Responsive text: short labels on mobile, full text on desktop.
- **ErrorBoundary** (`ErrorBoundary.tsx`): Class component with animated SadFlower fallback, bilingual error messages, reload/reset actions.
- **FallbackPage** (`FallbackPage.tsx`): Composable layout for not-found and invalid-share pages.
- **Logo** (`Logo.tsx`): Wordmark SVG with `stacked` (two-line, desktop) and `inline` (single-line, mobile) variants.

### i18n — no library

Lightweight React Context + JSON. ~30 translatable strings.

- `/` = French (default), `/en` = English. Path-based language detection → localStorage persistence → browser detection fallback.
- UI strings, months, seasons, states → `src/i18n/translations/{fr,en}.json`
- Flower names live in `src/data/flowers.ts` as `names: { en, fr }` — NOT in translation files.
- The brand "Le Jardin Radial" and subtitle "de {owner}" are always French.

### Design tokens — Tailwind `@theme`

Two-tier system in `src/index.css`:

- **Primitives**: `--color-earth-900` through `--color-earth-0` (the earth palette)
- **Semantic tokens**: `--color-fg`, `--color-surface`, `--color-subtle`, `--color-border`, etc. Reference primitives via `var()`.
- Components use semantic tokens via Tailwind utilities: `text-fg`, `bg-surface`, `border-border`.
- `cn()` utility (`src/utils/cn.ts`) wraps `tailwind-merge` + `clsx` for conflict-free class composition.

### D3 — imperative, not declarative

The radial chart uses D3 direct DOM manipulation inside `useEffect` hooks.

- **Init effect** (`[]`): creates SVG structure once. Non-scaling elements start with `opacity: 0`.
- **Language effect** (`[t]`): updates month label text.
- **Scale effect** (`[inv]`): updates non-scaling elements on resize. Guarded by `measured` ref — skips until ResizeObserver provides actual scale, preventing flash of oversized text. Reveals elements with `opacity: 1`. On first measurement, reveals flower labels immediately (no fade). Season icons and dashed lines reposition dynamically (same scaling as month labels).
- **Dynamic viewBox**: viewBox size is computed from `displayWidth` so non-scaling labels fit exactly at the edge: `V = max(SIZE, 2 * OUTER_RADIUS * w / (w - 2 * LABEL_EXTENT))`. No magic padding numbers.
- **Data effect** (`[flowers, showLabels]`): data joins for cells AND curved labels, transitions, tooltips. Flower label enter transition only runs after initial load (`initialLoad` ref).
- **`tRef` pattern**: a ref to the current `t()` function so D3 event handlers always read the latest translations.
- RadialChart.tsx is exempted from `@typescript-eslint/no-explicit-any` and related rules — D3's transition reuse pattern requires type casts.

### Responsive layout

Desktop uses absolute positioning for header/footer overlaid on the chart. Mobile (`max-sm:`) switches to `static` positioning with normal document flow. The `useIsMobile` hook (`src/hooks/useIsMobile.ts`) provides a JS boolean matching the Tailwind `sm:` breakpoint (640px) for prop-level responsive behavior (button shape, size, popover alignment).

- Header: stacked two-line logo on desktop, inline single-line logo on mobile
- Footer: absolute corners on desktop, stacked flow on mobile with `mt-auto` for bottom alignment
- Drag handles and edit buttons: hover-dependent on desktop, always visible on mobile
- SharedBanner: full text on desktop, short labels on mobile
- GardenPanel popover: `absolute` on desktop, `fixed` viewport-centered on mobile for Reset

### Utilities

- `src/utils/cn.ts`: `cn()` — tailwind-merge + clsx wrapper.
- `src/utils/buttonStyles.ts`: `buttonClass()` and `innerClass()` — pure Tailwind class builders for Button variants.
- `src/utils/exportImage.ts`: `exportSvg()` and `exportPng()` — standalone SVG/PNG export with embedded base64 woff2 font, `text, tspan { font-family }` rule for reliable rendering. PNG uses data URI + canvas at 3x scale (1800×1800).
- `src/utils/logoColors.ts`: color palettes, `colorsFromName()`, `isLight()`, `pick()` — used by Header, SharedBanner, MonthGrid.

### Data

- `flowers.ts`: catalog source. Exports `raw` (for seeding) and `flowers` (enriched). Use `names[lang]` or `displayName`, not `name`.
- `months.ts`: `parseMonths()`, `firstBloomStart()`, `bloomRanges()`.
- `colors.ts`: `resolveColor()`, `DEFAULT_STATE_COLORS`, `DEFAULT_BLOOM_COLOR`.
- `src/types.ts`: shared types (`FlowerState`, `RawFlower`, `EnrichedFlower`, `GardenState`, `Lang`, `ImportCallbacks`).

### Storybook

Component library documentation at `pnpm storybook`. Atomic Design hierarchy: Atoms → Molecules → Organisms → Assets. Introduction MDX page provides project overview. Language toolbar switches between French and English. Branded theme with earth palette in `.storybook/manager.ts`.

- Every component with a Storybook story **must** have a JSDoc comment on the component function and on every prop in its Props interface. Storybook autodocs renders these as component and prop descriptions.
- Stories use `noop = () => {}` for callback props (not `fn()` from storybook/test).

### Testing

- **Unit tests** (vitest): reducer actions, state validation, reconciliation, i18n utils, month parsing. Files colocated in `src/`.
- **E2E tests** (playwright, `e2e/`): functional tests for all user flows (panel, share, reset, language, shared garden, manage, editor, drag reorder, keyboard reorder, error boundary, not-found, invalid-share, URL normalization) + visual regression screenshots with seeded deterministic state. Semantic ARIA selectors preferred over CSS classes.
- **Visual baselines**: `e2e/snapshots/`. Update with `pnpm exec playwright test e2e/visual.spec.js --update-snapshots`.

## Deployment

GitHub Pages. `vite.config.js` generates `404.html`, `en/index.html`, and `fr/index.html` at build time. Known routes (`/`, `/en`, `/fr`) return 200; unknown routes and `/share/...` fall to `404.html` which loads the SPA. The `og:url` meta tag has a hardcoded production domain — intentional for social card correctness.
