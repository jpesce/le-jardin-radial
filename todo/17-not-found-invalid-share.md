# 17 — Page not found and invalid share URL handling

## Context

Currently, unknown URLs (e.g., `/random-path`) and invalid share URLs (e.g., `/share/corrupted-data`) silently fall through to a fresh garden with no feedback. The user has no idea their link was bad — they just see a random garden and assume something went wrong.

The 404.html SPA fallback serves index.html for all paths, so the app always loads. But the app doesn't distinguish between "no route matched" and "home page."

## Scope

Show a friendly "not found" page for unrecognized URLs and a specific message for invalid share links. Reuse the error boundary's sad flower illustration and garden-themed tone.

## Approach

### URL classification in `initialState()` / app routing

Currently the app checks:

1. `/share/<data>` → try to decode, fall through to fresh if invalid
2. `/en` or `/fr` → language switch, redirect to `/`
3. Everything else → show garden

Add:

1. `/share/<data>` that fails decoding → show "invalid share link" state
2. Unknown paths (not `/`, not `/en`, not `/fr`, not `/share/`) → show "page not found"

### Implementation options

**A. Route state in the garden store**
Add an `error` field to state: `null | 'not-found' | 'invalid-share'`. Set it during `initialState()`. App.tsx renders the error page instead of the garden when set.

**B. Separate routing check in App.tsx**
Before rendering the garden, check `window.location.pathname` against known patterns. If unrecognized, render a NotFound component. Keeps error state separate from garden state.

**Recommendation:** Option B — cleaner separation. Garden state shouldn't know about routing errors.

### Not Found page (`NotFoundPage.tsx`)

Reuse the sad flower SVG from ErrorBoundary. Different copy:

- Title: "nothing planted here" / "rien n'est planté ici"
- Description: "this path doesn't lead anywhere in the garden" / "ce chemin ne mène nulle part dans le jardin"
- CTA: "go to garden" / "aller au jardin" → navigates to `/`

### Invalid Share page

Same illustration, different copy:

- Title: "this bouquet wilted" / "ce bouquet a fané"
- Description: "the share link is invalid or expired" / "le lien de partage est invalide ou expiré"
- CTA: "go to garden" / "aller au jardin" → navigates to `/`

### Shared SVG illustration

Extract the sad flower SVG from ErrorBoundary into a standalone component (`SadFlower.tsx`) so it can be reused by ErrorBoundary, NotFoundPage, and InvalidSharePage without duplication.

## Files to create/modify

| File                               | Change                                                                                         |
| ---------------------------------- | ---------------------------------------------------------------------------------------------- |
| `src/components/SadFlower.tsx`     | **Create** — extracted animated SVG illustration                                               |
| `src/components/NotFoundPage.tsx`  | **Create** — not found / invalid share fallback                                                |
| `src/components/ErrorBoundary.tsx` | Import SadFlower instead of inline SVG                                                         |
| `src/App.tsx`                      | Add route check, render NotFoundPage for unknown paths                                         |
| `src/hooks/useGarden.ts`           | Return sentinel from `getSharedState()` to distinguish "no share URL" from "invalid share URL" |
| `src/i18n/translations/en.json`    | Add not-found and invalid-share keys                                                           |
| `src/i18n/translations/fr.json`    | Add not-found and invalid-share keys                                                           |
| `e2e/garden.spec.js`               | Add E2E tests for unknown URLs and invalid share links                                         |
| `e2e/visual.spec.js`               | Add visual regression test for not-found page                                                  |

## Considerations

- The 404.html SPA fallback means ALL paths reach the app — the app must handle routing, not the server
- `/share/` with valid compressed data that fails `isValidState()` after decompression is "invalid share," not "not found"
- `/share/` with data that fails decompression (garbled URL) is also "invalid share"
- Language detection should still work on error pages (`/en/unknown` → English not-found)
- The not-found page should NOT save anything to localStorage or modify garden state
- Back button from not-found should work normally (browser history)
- The `console.warn('Invalid share URL')` can be removed once proper UI feedback exists
