# 19 — Animated button width transition performance

## Problem

The animated Button uses `react-use-measure` + Framer Motion `animate={{ width }}` to transition between "Plan garden" and "Done" text. This animates the CSS `width` property which triggers the browser's layout → paint → composite pipeline on every frame (layout thrashing). On mobile devices and CPU-throttled environments, this produces visible lag.

The `layout` prop (FLIP technique) was tried previously but causes text distortion — Framer Motion uses `scaleX` transforms which stretch the text during the transition.

## Current implementation

`src/components/Button.tsx` — `AnimatedButton` component:

- `react-use-measure` measures inner content via `ResizeObserver`
- `animate={{ width: bounds.width }}` sets width every frame via JS
- Spring animation (`duration: 0.4, bounce: 0`) compounds the issue with more computed frames

## Potential approaches

- Shorter animation duration or switch from spring to tween
- Disable animation on mobile (`prefers-reduced-motion` or `useIsMobile`)
- `clip-path: inset(...)` animation (GPU-composited, no layout thrashing, but element still occupies full space)
- CSS `transition: width` instead of Framer Motion JS spring (less JS overhead, browser-optimized)
