# CLAUDE.md

## Project

React + D3.js garden visualization. Deployed at jardin.pesce.cc via GitHub Pages.

## Commands

- `pnpm dev` — development server
- `pnpm build` — production build (also generates `dist/404.html` for SPA routing)
- `pnpm test` — run vitest (96 tests)

## Architecture decisions

### Garden state — `useGarden` hook

All garden state is managed by a `useReducer`-based hook in `src/hooks/useGarden.js`.

- **State model**: `{ owner, labels, defaultCatalog, garden: string[], selected: string[], customFlowers: {} }` — fully serializable.
  - `defaultCatalog`: copy of `flowers.js` raw data, stored for future reconciliation when catalog updates between deploys.
  - `garden`: array of IDs (which available flowers are in the user's garden).
  - `selected`: ordered array of IDs (which garden flowers are on the chart, order = ring order).
  - `customFlowers`: object keyed by ID — overrides for catalog flowers + full custom flower data. Editing any flower puts/merges data here.
- **Available flowers** = `defaultCatalog` merged with `customFlowers` overrides + pure custom entries. Computed, not stored.
- `flowers.js` is a **catalog** (read-only source). The hook seeds the initial garden with 8 random flowers (4 selected).
- `displayName` comes from `flower.names[lang]` — the hook receives `lang` as a parameter (keeps it testable).
- **IDs**: catalog flowers have stable slugs (`"rose"`, `"snowdrop"`). Custom flowers use `crypto.randomUUID()`.
- `panelOpen` stays in App.jsx — UI state, not garden state.
- Adding a flower from the manage view auto-selects it for the chart.

### Three panel views

- **Garden view** (default): shows flowers in your garden. Checkboxes toggle chart visibility. Drag to reorder. Edit icon per flower.
- **Manage view** (via "✎ modifier" button): shows all available flowers (catalog + custom). Checkboxes toggle garden membership. Stable bloom order. Edit icon per flower. "créer une fleur" button for custom flowers.
- **Editor view**: create or edit a flower. Name (en/fr), scientific name, bloom color, month grid. Save/cancel returns to the originating view. Delete available for custom flowers only.

### i18n — no library

Lightweight React Context + JSON. No react-i18next — the app has ~30 translatable strings.

- `/` = French (default), `/en` = English. Path-based via `pushState`.
- UI strings, months, seasons, states → `src/i18n/translations/{fr,en}.json`
- Flower names live in `src/data/flowers.js` as `names: { en, fr }` — NOT in translation files.
- The brand "Le Jardin Radial" and subtitle "de {owner}" are always French. Intentional.

### Design tokens — two tiers

- **Primitives** in `:root`: `--earth-900` (darkest) through `--earth-0` (white)
- **Semantic tokens** reference primitives: `--color-text: var(--earth-900)`
- CSS files only use semantic tokens. Raw hex values only exist in the `:root` block.
- Exception: D3 chart colors in JS (SVG attributes can't easily reference CSS vars).

### D3 — imperative, not declarative

The radial chart uses D3 direct DOM manipulation inside `useEffect` hooks. This is intentional — D3's data join pattern doesn't map well to React's declarative model.

- **Init effect** (`[]`): creates SVG structure once
- **Language effect** (`[t]`): updates month label text
- **Scale effect** (`[inv]`): updates non-scaling elements on resize
- **Data effect** (`[flowers, showLabels, t]`): data joins for cells AND curved labels, transitions, tooltips
- **`tRef` pattern**: a ref to the current `t()` function so D3 event handlers (closures set during init) always read the latest translations
- **Label animations**: curved text labels use a proper D3 data join (enter/update/exit). New labels fade in after the ring animation. Existing labels smoothly transition to new radii via `attrTween`.

### Data

- `flowers.js`: catalog source. Exports `raw` (for seeding garden state) and `flowers` (enriched with `monthStates`, `firstBloom`, sorted by bloom). `name` property does not exist — use `names[lang]` or `displayName`.
- `months.js`: `bloomRanges()` returns `[{ start, end }]` index pairs. Formatting with translated month names happens in components.
- `colors.js`: resolves plant state → color. State colors are botanical, not theme colors.

## Deployment

GitHub Pages. `vite.config.js` copies `index.html` → `404.html` at build time so direct navigation to `/en` works. The `og:url` meta tag has a hardcoded production domain — intentional for social card correctness.
