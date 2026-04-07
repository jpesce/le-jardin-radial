# 02 — Flower editor (create + edit)

## Depends on

Todo 01 (garden state model + catalog)

## What this adds

Two new capabilities in the panel:
- **Create a custom flower** from scratch (via "créer une fleur" in catalog)
- **Edit any flower** in the garden (via ✎ icon on each flower)

Both use the same editor component.

## `useGarden` hook additions

```js
addFlower(flowerData)     // generates crypto.randomUUID(), adds to state.flowers
updateFlower(id, data)    // merges updates into existing flower
```

- `addFlower` takes the editor form output, generates an ID, inserts into `state.flowers`
- `updateFlower` merges partial data into an existing flower by ID
- Both recompute `monthStates` and `firstBloom` from the raw `months` object

## Flower editor component

Opens when clicking "✏ créer une fleur" in catalog or ✎ on a garden flower.

```
┌───────────────────────┐
│ ← retour              │
│                       │
│ nom (en)              │
│ ┌───────────────────┐ │
│ │ Sunflower         │ │
│ └───────────────────┘ │
│ nom (fr)              │
│ ┌───────────────────┐ │
│ │ Tournesol         │ │
│ └───────────────────┘ │
│ nom scientifique      │
│ ┌───────────────────┐ │
│ │ Helianthus annuus │ │
│ └───────────────────┘ │
│ couleur  ┌──┐         │
│ #FDCB6E  │██│         │
│          └──┘         │
│                       │
│ CALENDRIER            │
│ j f m a m j j a s o n d│
│ ┌─┬─┬─┬─┬─┬─┬─┬─┬─┬─┬─┬─┐│
│ │💤│💤│💤│🌱│🌿│🌿│🌸│🌸│🌸│🌿│💤│💤││
│ └─┴─┴─┴─┴─┴─┴─┴─┴─┴─┴─┴─┘│
│ tap to cycle state    │
│                       │
│ ┌─────────┐ ┌───────┐ │
│ │sauvegarder│ │annuler│ │
│ └─────────┘ └───────┘ │
│                       │
│   supprimer           │ ← muted, destructive
└───────────────────────┘
```

## Month schedule grid

A row of 12 cells, one per month. Each cell shows the state as a colored block (using the chart's state colors from `colors.js`):
- Dormant: muted olive
- Sprouting: light green
- Foliage: sage green
- Blooming: flower's bloom color

Click a cell → cycles to next state: dormant → sprouting → foliage → blooming → dormant.

The grid outputs a `months` object in the same format as `flowers.js`:
```json
{ "1-3": "dormant", "4": "sprouting", "5-6": "foliage", "7-9": "blooming", "10": "foliage", "11-12": "dormant" }
```

Or simpler: store as a 12-element array internally, convert to the compact range format on save.

## Validation

- Name (en) required, name (fr) required
- Color must be valid hex
- At least one month must be "blooming"
- Scientific name optional

## Translation keys

```json
{
  "createFlower": "créer une fleur",
  "editFlower": "modifier",
  "deleteFlower": "supprimer",
  "deleteConfirm": "supprimer cette fleur ?",
  "flowerNameEn": "nom (en)",
  "flowerNameFr": "nom (fr)",
  "scientificName": "nom scientifique",
  "bloomColor": "couleur",
  "monthSchedule": "calendrier",
  "save": "sauvegarder",
  "cancel": "annuler"
}
```

## Files to create/modify

| File | Change |
|------|--------|
| `src/hooks/useGarden.js` | Add `addFlower`, `updateFlower` |
| `src/components/FlowerEditor.jsx` | New — editor form |
| `src/components/MonthGrid.jsx` | New — interactive month schedule |
| `src/components/FlowerEditor.css` | New — editor styles |
| `src/components/FlowerList.jsx` | Add ✎ edit icon per flower |
| `src/components/FlowerCatalog.jsx` | Enable "créer une fleur" link |
| `src/i18n/translations/*.json` | Add new keys |
