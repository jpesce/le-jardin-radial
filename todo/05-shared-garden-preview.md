# 05 — Shared garden preview (read-only mode)

## Depends on

Todo 04 (URL sharing)

## Problem

Alice has her garden in localStorage. She opens Bob's shared link → without protection, Bob's garden overwrites Alice's.

## Solution

Shared links (`?g=`) load as **read-only previews**. Alice's localStorage is untouched. A banner offers to adopt the shared garden.

## Banner UI

```
┌─────────────────────────────────────────────────────────────────────┐
│ 👁 Viewing a shared garden              ┌──────────────────┐       │
│                                          │ save to my garden │       │
│                                          └──────────────────┘       │
├─────────────────────────────────────────────────────────────────────┤
│                          (rest of the app)                          │
```

- Appears only when `isShared` is true (from `?g=` param)
- "Save to my garden" copies shared state into localStorage, removes banner, cleans URL
- Dismissing (✕) returns to user's own garden from localStorage
- Panel opens for browsing but edits don't auto-save

## `useGarden` hook additions

- `isShared` flag (set when loaded from `?g=`)
- When `isShared`: skip localStorage writes
- `saveSharedGarden()` — writes shared state to localStorage, clears `isShared`, removes `?g=` from URL
- `dismissShared()` — reloads from localStorage, removes `?g=` from URL

## Files to create/modify

| File | Change |
|------|--------|
| `src/hooks/useGarden.js` | Add `isShared`, `saveSharedGarden`, `dismissShared` |
| `src/components/SharedBanner.jsx` | New — top banner component |
| `src/App.jsx` | Render SharedBanner conditionally |
| `src/App.css` | Banner styles |
| `src/i18n/translations/*.json` | Add `"sharedBanner"`, `"saveToMyGarden"` keys |
