# 14 — Mobile responsive testing and fixes

## Context

The app has one responsive breakpoint (`max-[480px]` for panel width and positioning) but no systematic mobile testing. Playwright tests only run at 1280×720. The chart, panel, credits, and description may not render well on small screens.

## Scope

Add Playwright mobile viewport tests and fix any layout issues discovered.

## Approach

### 1. Add mobile visual regression tests

Run the existing visual test suite at mobile viewport sizes:

- iPhone SE: 375×667
- iPhone 14: 390×844
- iPad: 768×1024

### 2. Known potential issues

- Chart SVG is 600px — may overflow on 375px screens
- Credits text (360px fixed width) wider than mobile viewport
- Bottom-left description text may overlap with chart
- Panel (300px fixed width) leaves only 75px on iPhone SE
- Logo (`width: max(120px, 20vw)`) may be too large relative to chart on mobile
- Share dropdown and confirmation popovers may overflow viewport

### 3. Fixes to implement

- Chart wrapper: already has `width: min(100%, 600px)` — should scale
- Credits: needs `max-w-full` or responsive width
- Bottom-left: needs responsive positioning or hiding on mobile
- Panel: already has `max-[480px]:w-[calc(100vw-1.5rem)]` — verify
- Popovers: may need `max-w-[calc(100vw-2rem)]` on mobile

## Files to create/modify

| File                   | Change                               |
| ---------------------- | ------------------------------------ |
| `e2e/visual.spec.js`   | Add mobile viewport test variants    |
| `playwright.config.js` | Optionally add mobile project config |
| `src/App.tsx`          | Fix responsive issues discovered     |
| `e2e/snapshots/`       | New mobile baselines                 |

## Considerations

- Mobile visual tests should be separate from desktop (different baselines)
- Consider whether to test actual touch interactions or just layout
- The D3 chart uses `viewBox` and should scale naturally
- Font sizes are in px — may need responsive adjustments for readability
