# 06 — Export SVG/PDF

## Depends on

Todo 01 (state model). Independent of persistence todos.

## Scope

Export the radial chart as a standalone SVG file or PDF document.

## SVG export

The chart is already an SVG in the DOM. Export involves:

1. Clone the SVG element
2. Inline computed styles (fonts, colors) so it renders standalone
3. Embed the Google Font via `<style>@import</style>` block
4. Set explicit width/height attributes
5. Trigger download as `.svg` file

Considerations:
- Curved text labels use `<textPath>` — works in standalone SVG
- Non-scaling elements need current computed sizes baked in
- Tooltip div is outside SVG — excluded naturally
- Season icons and month labels should be included

## PDF export

Options (pick one):
- **jsPDF + svg2pdf.js** — renders SVG into PDF. Good vector quality. ~50KB added.
- **Print stylesheet** — `window.print()` with `@media print` CSS. Zero dependencies, less control.

Recommendation: start with print stylesheet (zero deps), add jsPDF later if quality isn't sufficient.

## UI

Extend the share button into a dropdown with export options:

```
        ┌──────────────────┐
        │ 🔗 copier le lien │
        │ ↓ télécharger SVG │
        │ ↓ télécharger PDF │
        └──────────────────┘
```

Or keep share as a single-action button (copy link) and add a separate download icon.

## File naming

`jardin-radial-{owner-slugified}.svg` / `.pdf`
e.g. `jardin-radial-tainah-drummond.svg`

## Translation keys

```json
{
  "copyLink": "copier le lien",
  "exportSvg": "télécharger SVG",
  "exportPdf": "télécharger PDF"
}
```

## Files to create/modify

| File | Change |
|------|--------|
| `src/utils/exportSvg.js` | New — SVG extraction + inline styles |
| `src/utils/exportPdf.js` | New — PDF generation (or print stylesheet) |
| `src/components/ShareButton.jsx` | Add dropdown with export options |
| `src/App.css` | Print styles (`@media print`) |
| `package.json` | Maybe add jsPDF + svg2pdf.js |
| `src/i18n/translations/*.json` | Add export keys |
