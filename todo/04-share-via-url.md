# 04 — Share via URL

## Depends on

Todo 01 (state model), Todo 03 (localStorage)

## Scope

~1 hour. New dependency (lz-string), encode/decode logic, share button UI.

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

## Files to create/modify

| File | Change |
|------|--------|
| `src/hooks/useGarden.js` | Add encode/decode, URL param detection |
| `src/components/ShareButton.jsx` | New — icon button with copy feedback |
| `src/App.jsx` or panel area | Place ShareButton next to panel toggle |
| `package.json` | Add lz-string dependency |
| `src/i18n/translations/*.json` | Add `"shareCopied"` key |
