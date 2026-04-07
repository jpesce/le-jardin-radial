# 04 — Share garden

## Depends on

Todo 01 (state model), Todo 03 (localStorage)

## Scope

~1 hour. Share button UI + two sharing methods.

## New dependency

`lz-string` (~4KB gzipped) — `compressToEncodedURIComponent` / `decompressFromEncodedURIComponent`

## URL format

```
jardin.pesce.cc/en?g=NoIgpgTgng...
```

- `?g=` param carries the full compressed garden state
- Works alongside language path routing (`/` and `/en`)
- ~50 flowers fit within safe cross-browser URL limits (~8K chars)

## Share button UI

Position: top-right, next to "planifier jardin". Icon-only (link icon from lucide-react).

```
                                          ┌──┐ ┌────────────────┐
                                          │🔗│ │☘ planifier     │
                                          └──┘ │  jardin        │
                                                └────────────────┘
```

On click:
1. Encode state → lz-string → build URL with `?g=` param
2. Copy to clipboard
3. Button briefly shows "✓ copié" (~2s), then reverts to icon

## `useGarden` hook additions

```js
function encodeGarden(state) {
  return lzstring.compressToEncodedURIComponent(JSON.stringify(state));
}

function decodeGarden(param) {
  return JSON.parse(lzstring.decompressFromEncodedURIComponent(param));
}

// On mount priority: URL param > localStorage > seed
const initial = () => {
  const params = new URLSearchParams(window.location.search);
  const g = params.get("g");
  if (g) return { ...decodeGarden(g), isShared: true };

  const saved = localStorage.getItem(STORAGE_KEY);
  if (saved) return JSON.parse(saved);

  return seedFromFlowersJs();
};
```

## Alternative: JSON file export/import (no dependency needed)

Fully client-side, zero dependencies. Could replace or complement URL sharing.

**Export:** `Blob` → `URL.createObjectURL` → trigger download as `garden.json`
**Import:** `<input type="file" accept=".json">` → `FileReader` → `JSON.parse`

Tradeoffs vs URL sharing:

| | URL sharing | JSON file |
|---|---|---|
| Seamless | Yes — just paste a link | No — download, send file, import |
| Dependency | lz-string (~4KB) | None |
| Size limit | ~50 flowers (~8K chars) | Unlimited |
| Works offline | Yes | Yes |
| Shareable via messaging | Yes — it's a link | Need to attach a file |

Could offer both: link icon copies URL, download icon exports JSON. Or start with JSON (simpler, no dependency) and add URL later.

## Files to create/modify

| File | Change |
|------|--------|
| `src/hooks/useGarden.js` | Add encode/decode, URL param detection, export/import helpers |
| `src/components/ShareButton.jsx` | New — icon button with dropdown (copy link, export JSON, import JSON) |
| `src/App.jsx` or panel area | Place ShareButton next to panel toggle |
| `package.json` | Add lz-string dependency (only if URL sharing) |
| `src/i18n/translations/*.json` | Add sharing keys |
