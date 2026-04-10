# CLAUDE.md

## Project

React + D3.js + TypeScript garden visualization. Deployed at jardin.pesce.cc via GitHub Pages.

## Commands

- `pnpm dev` — development server
- `pnpm build` — production build (also generates `dist/404.html` for SPA routing)
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
- **Framer Motion** — animations (panel, banner, popovers)
- **Playwright** — 30 E2E + 9 visual regression tests
- **Vitest** — unit tests
- **ESLint** (strictTypeChecked) + **Prettier** + **commitlint** + **Husky**
- **tailwind-merge** + **clsx** — `cn()` helper for class composition

## Architecture

### State — Zustand store (`src/hooks/useGarden.ts`)

Garden state managed by a Zustand store with persist middleware for localStorage.

- **State model**: `{ owner, labels, defaultCatalog, garden[], selected[], customFlowers{}, isShared }` — fully serializable via `GardenState` type in `src/types.ts`.
- **Reducer**: pure function (`reducer()`) handles 13 action types via discriminated union `GardenAction`. Kept separate for testability.
- **Persistence**: Zustand `persist` middleware with custom `partialize` (excludes functions and shared state) and `merge` (preserves shared state from URL).
- **Share URLs**: `/share/<lz-string-compressed-state>` with embedded language. Only garden flowers included in URL (not full catalog).
- **Available flowers** = `defaultCatalog` merged with `customFlowers` overrides + pure custom entries. Computed via `useMemo`, not stored.
- **IDs**: catalog flowers have stable slugs (`"rose"`, `"snowdrop"`). Custom flowers use `crypto.randomUUID()`.
- `panelOpen` stays in `App.tsx` — UI state, not garden state.

### Components

- **Button** (`src/components/Button.tsx`): Reusable button with `variant` (outline/solid/ghost), `round` shape, `size` (xs-lg), `color` (default/danger), `animated` prop for width transitions via `react-use-measure`. Uses `cn()` for class composition with `tailwind-merge`.
- **Checkbox** (`src/components/Checkbox.tsx`): Custom styled checkbox using Tailwind `before:` pseudo-element variants.
- **FlowerList**: Panel orchestrator — view state (garden/manage/create/edit), popover coordination (reset/share mutual exclusivity via `activePopover`), keyboard navigation.
- **FlowerRow**: Flower list item fragment — requires parent `group` class for hover styles (`group-hover:`, `group-data-[hovered]:`).
- **RadialChart**: D3 imperative chart with 4 `useEffect` hooks (init, language, scale, data). ESLint strict rules exempted for D3 type casts.
- **SharedBanner**: Read-only mode banner with height animation, owner-derived colors.

### Three panel views

- **Garden view** (default): checkboxes toggle chart visibility. Drag to reorder via `setPointerCapture()`. Edit icon per custom flower.
- **Manage view**: all available flowers. Checkboxes toggle garden membership. Search filter.
- **Editor view**: create or edit a flower. Name (en/fr), scientific name, bloom color, month grid.

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

- **Init effect** (`[]`): creates SVG structure once
- **Language effect** (`[t]`): updates month label text
- **Scale effect** (`[inv]`): updates non-scaling elements on resize
- **Data effect** (`[flowers, showLabels]`): data joins for cells AND curved labels, transitions, tooltips
- **`tRef` pattern**: a ref to the current `t()` function so D3 event handlers always read the latest translations
- RadialChart.tsx is exempted from `@typescript-eslint/no-explicit-any` and related rules — D3's transition reuse pattern requires type casts.

### Data

- `flowers.ts`: catalog source. Exports `raw` (for seeding) and `flowers` (enriched). Use `names[lang]` or `displayName`, not `name`.
- `months.ts`: `parseMonths()`, `firstBloomStart()`, `bloomRanges()`.
- `colors.ts`: `resolveColor()`, `DEFAULT_STATE_COLORS`, `DEFAULT_BLOOM_COLOR`.
- `src/types.ts`: shared types (`FlowerState`, `RawFlower`, `EnrichedFlower`, `GardenState`, `Lang`, `ImportCallbacks`).

### Testing

- **Unit tests** (vitest): reducer actions, state validation, reconciliation, i18n utils, month parsing. Files colocated in `src/`.
- **E2E tests** (playwright, `e2e/`): functional tests for all user flows + visual regression screenshots with seeded deterministic state. Semantic ARIA selectors preferred over CSS classes.
- **Visual baselines**: `e2e/snapshots/`. Update with `pnpm exec playwright test e2e/visual.spec.js --update-snapshots`.

## Deployment

GitHub Pages. `vite.config.js` copies `index.html` → `404.html` at build time so direct navigation to `/en` or `/share/...` works. The `og:url` meta tag has a hardcoded production domain — intentional for social card correctness.
