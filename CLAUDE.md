# CLAUDE.md

## Project

React + D3.js garden visualization. Deployed at jardin.pesce.cc via GitHub Pages.

## Commands

- `npm run dev` — development server
- `npm run build` — production build (also generates `dist/404.html` for SPA routing)
- `npm test` — run vitest (42 tests)

## Architecture decisions

### i18n — no library

Lightweight React Context + JSON. No react-i18next — the app has ~30 translatable strings.

- `/` = French (default), `/en` = English. Path-based via `pushState`.
- UI strings, months, seasons, states → `src/i18n/translations/{fr,en}.json`
- Flower names live in `src/data/flowers.js` as `names: { en, fr }` — NOT in translation files. Adding a flower = one file to edit.
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
- **Data effect** (`[flowers, showLabels, t]`): data joins, transitions, tooltips
- **`tRef` pattern**: a ref to the current `t()` function so D3 event handlers (closures set during init) always read the latest translations

### Data

- `flowers.js`: single source of truth. `name` property does not exist — use `names[lang]` or `displayName` (set by App.jsx).
- `months.js`: `bloomRanges()` returns `[{ start, end }]` index pairs. Formatting with translated month names happens in components.
- `colors.js`: resolves plant state → color. State colors are botanical, not theme colors.

## Deployment

GitHub Pages. `vite.config.js` copies `index.html` → `404.html` at build time so direct navigation to `/en` works. The `og:url` meta tag has a hardcoded production domain — intentional for social card correctness.
