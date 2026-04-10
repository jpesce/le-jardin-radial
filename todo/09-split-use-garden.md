# 09 — Split useGarden into focused modules

## Context

`useGarden.ts` is 537 lines mixing Zustand store definition, a 13-action reducer, state validation, catalog reconciliation, share URL encoding, JSON import/export, localStorage handling, and the React hook interface. The file has too many responsibilities.

## Scope

Split into focused modules without changing the public API — `useGarden(lang)` stays the same.

## Proposed structure

```
src/hooks/
├── useGarden.ts              — React hook with computed properties (~100 lines)
├── gardenStore.ts            — Zustand store definition + actions (~80 lines)
├── gardenReducer.ts          — Reducer + action types (~100 lines)
├── gardenReconciliation.ts   — reconcile(), isValidState(), freshState() (~60 lines)
└── useGarden.test.ts         — Tests import from gardenReducer + gardenReconciliation
```

## What goes where

### gardenReducer.ts

- `GardenAction` discriminated union type
- `reducer()` function (the switch statement)
- Currently tested directly — tests keep working with new import path

### gardenReconciliation.ts

- `isValidState()`
- `reconcile()`
- `freshState()`
- `pickRaw()`
- `shuffle()`
- `loadFromStorage()`
- `getSharedState()`
- `initialState()`
- Constants: `GARDEN_SIZE`, `SELECTED_SIZE`, `DEFAULT_OWNER`, `STORAGE_KEY`

### gardenStore.ts

- Zustand `create()` with `persist()`
- All action methods (setOwner, toggleSelected, etc.)
- `stateSlice()` helper
- `dispatch()` helper
- `ImportCallbacks` type

### useGarden.ts (simplified)

- `useGarden(lang)` hook
- Computed properties: `availableFlowers`, `gardenFlowers`, `selectedFlowers`, `allFlowers`
- `getShareUrl()` and `exportJson()` memos
- Popstate listener

## Files to create/modify

| File                                | Change                                                 |
| ----------------------------------- | ------------------------------------------------------ |
| `src/hooks/gardenReducer.ts`        | **Create** — reducer + action types                    |
| `src/hooks/gardenReconciliation.ts` | **Create** — validation, reconciliation, initial state |
| `src/hooks/gardenStore.ts`          | **Create** — Zustand store                             |
| `src/hooks/useGarden.ts`            | Simplify to hook + computed properties                 |
| `src/hooks/useGarden.test.ts`       | Update imports                                         |
| `src/types.ts`                      | Move `GardenState` if not already there                |

## Considerations

- The reducer tests import `reducer`, `isValidState`, `reconcile` — update imports only
- `gardenStore.ts` needs `gardenReducer.ts` and `gardenReconciliation.ts`
- `useGarden.ts` needs `gardenStore.ts`
- Circular dependency risk: store needs reducer, reducer needs reconciliation — no cycles in this split
- `getSharedState()` accesses `window.location` — needs the `typeof window === 'undefined'` guard
- The `dispatch()` function bridges reducer and store — lives in store since it calls `setState`
