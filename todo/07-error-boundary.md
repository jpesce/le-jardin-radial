# 07 — Error boundary

## Context

No error boundary exists. If any component throws during render — a corrupted localStorage parse, a D3 null reference, a bad flower data shape — the entire app crashes with a white screen. The user loses access to their garden with no recovery path.

## Scope

Add a React error boundary component that catches render errors and shows a fallback UI.

## Approach

React error boundaries must be class components (hooks don't support `componentDidCatch`). Create a minimal `ErrorBoundary` component:

- Catch errors from any child component
- Show a fallback screen with: the app logo, an error message, and a "reload" button
- Log the error to console for debugging
- The "reload" button clears potentially corrupted localStorage and reloads the page
- Wrap `<App />` in `main.tsx` with the boundary

## Fallback UI

Centered layout with:

- Le Jardin Radial logo (static, not the animated one)
- Brief message: "something went wrong"
- Two actions: "reload" (refresh page) and "reset garden" (clear storage + refresh)
- Styled with Tailwind, consistent with the app's aesthetic

## Files to create/modify

| File                               | Change                                                                               |
| ---------------------------------- | ------------------------------------------------------------------------------------ |
| `src/components/ErrorBoundary.tsx` | **Create** — class component with state, getDerivedStateFromError, componentDidCatch |
| `src/main.tsx`                     | Wrap `<App />` with `<ErrorBoundary>`                                                |

## Considerations

- Error boundary doesn't catch errors in event handlers, async code, or the boundary itself
- The D3 chart is the most likely crash source (imperative DOM manipulation)
- Keep the boundary simple — no error reporting service for a portfolio project
- Test by temporarily throwing in a component to verify the fallback renders
