# 01 — Garden state model + flower catalog

## Why first

Creates the serializable state model that every later feature builds on (localStorage, URL sharing, export). Also shifts the UX from "toggle fixed flowers" to "curate your garden from a catalog" — a meaningful improvement on its own.

## Mental model

- `flowers.js` = **catalog** (a read-only library of known flowers)
- Your garden = **your collection** (mutable, persisted later)
- Adding = picking from catalog. Removing = flower goes back to catalog.
- No custom creation yet (that's todo 02).

## State model

```json
{
  "owner": "Tainah Drummond",
  "labels": true,
  "selected": ["rose", "tulip", "lavender"],
  "flowers": [
    {
      "id": "rose",
      "names": { "en": "Rose", "fr": "Rose" },
      "scientificName": "Rosa gallica",
      "colors": { "blooming": "#FF6B81" },
      "months": { "1-2": "dormant", "3": "sprouting", "4": "foliage", "5-10": "blooming", "11": "foliage", "12": "dormant" }
    }
  ]
}
```

- `flowers`: all flowers in the user's garden (the palette they can pick from)
- `selected`: ordered IDs of active flowers (order = ring order in chart)
- On first load: seeded from `flowers.js` + `INITIAL_IDS`
- Plain serializable object — ready for persistence layers later

## `useGarden` hook

```js
{
  state,            // full garden state (serializable)
  owner,            // state.owner
  labels,           // state.labels
  flowers,          // garden flowers with computed monthStates, firstBloom
  selected,         // ordered selected flower objects with displayName
  catalogFlowers,   // flowers.js entries NOT in garden (available to add)
  setOwner,
  setLabels,
  toggleFlower,     // select/deselect for chart
  reorderFlowers,
  addFromCatalog,   // add a preset flower to garden by ID
  removeFlower,     // remove from garden (also deselects); reappears in catalog
  resetToDefaults,  // reseed from flowers.js
}
```

- `catalogFlowers` = `flowers.js` entries filtered to exclude IDs already in `state.flowers`
- `addFromCatalog(id)` copies the flower data from `flowers.js` into `state.flowers`
- `removeFlower(id)` removes from `state.flowers` and `state.selected`
- `resetToDefaults` reseeds everything from `flowers.js` + `INITIAL_IDS`
- Computed values (`monthStates`, `firstBloom`, `displayName`) derived from raw state, not stored

## Panel UI changes

### Garden flower list (existing, modified)

```
┌───────────────────────┐
│ jardinier·ère         │
│ Tainah Drummond       │
│ ☑ afficher noms       │
│                       │
│ CHOISIR DES FLEURS    │
│ ☑ ● Rose    mai–oct ✕ │
│ ☑ ● Lavande jun–aoû ✕ │
│ ☑ ● Tulipe  avr–mai ✕ │
│ ───────────────────── │
│ ☐ ● Crocus  fév–mar ✕ │
│ ☐ ● Jonq.   mar–avr ✕ │
│                       │
│ + ajouter             │
│                       │
│   réinitialiser       │
└───────────────────────┘
```

- **✕ button** on each flower — removes from garden (returns to catalog)
- Selected flowers on top (checked, draggable), unselected below divider
- "+ ajouter" opens the catalog sub-panel

### Catalog sub-panel (new)

Clicking "+ ajouter" replaces or overlays the flower list with:

```
┌───────────────────────┐
│ ← retour              │
│                       │
│ 🔍 search...          │
│                       │
│ CATALOGUE             │
│  ● Iris      mai–jun +│
│  ● Pivoine   mai–jun +│
│  ● Lys       jun–aoû +│
│  ● Souci     jun–oct +│
│  ● Cosmos    jun–oct +│
│  ...                   │
│                       │
│ ──── ou ────────────  │
│                       │
│  ✏ créer (todo 02)    │ ← disabled/hidden until todo 02
└───────────────────────┘
```

- Shows only flowers from `flowers.js` NOT already in the garden
- Search filters by localized name
- Click `+` adds the flower to garden instantly and it disappears from catalog
- "← retour" returns to the garden list
- "créer" placeholder — becomes functional in todo 02
- Flowers sorted by first bloom (same as current sort)

## Translation keys

```json
{
  "addFlower": "ajouter",
  "removeFlower": "retirer",
  "resetGarden": "réinitialiser",
  "resetConfirm": "remettre le jardin par défaut ?",
  "catalog": "catalogue",
  "catalogBack": "retour",
  "catalogEmpty": "toutes les fleurs sont dans votre jardin"
}
```

## Files to create/modify

| File | Change |
|------|--------|
| `src/hooks/useGarden.js` | New — state model, catalog logic |
| `src/App.jsx` | Replace `useState` calls with `useGarden` |
| `src/components/FlowerList.jsx` | Add remove button, "+ ajouter", reset link |
| `src/components/FlowerCatalog.jsx` | New — catalog browse sub-panel |
| `src/components/FlowerCatalog.css` | New — catalog styles |
| `src/i18n/translations/*.json` | Add new keys |
| `src/data/flowers.js` | Unchanged (read-only catalog source) |

## What stays the same

- RadialChart (receives `selected` array, unchanged)
- i18n system, language routing
- Design tokens, CSS structure
- `months.js`, `colors.js`

## Designed for what comes next

The `useGarden` hook returns `state` as a plain serializable object:
- **Todo 02** adds `addFlower(data)` + `updateFlower(id, data)` for custom creation/editing
- **Todo 03** adds `localStorage.setItem(key, JSON.stringify(state))`
- **Todo 04** adds `lzstring.compress(JSON.stringify(state))` → URL
- No refactoring needed — the model supports all of these from day one
