# 03 — localStorage persistence

## Depends on

Todo 01 (garden state model)

## Scope

Small addition to `useGarden` hook. ~30 min.

## Changes

### `useGarden` hook additions

```js
const STORAGE_KEY = "jardin-radial-garden";

// On mount: load from localStorage or seed from flowers.js
const initial = () => {
  const saved = localStorage.getItem(STORAGE_KEY);
  if (saved) return JSON.parse(saved);
  return seedFromFlowersJs();
};

// On every state change: auto-save
useEffect(() => {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
}, [state]);
```

### `resetToDefaults`

- Calls `localStorage.removeItem(STORAGE_KEY)`
- Reseeds state from `flowers.js`

## What stays the same

Everything from todos 01-02. This is purely additive — a few lines in the hook.
