# 13 — Clean up dead code and inconsistencies

## Context

The codebase has accumulated minor dead code and inconsistencies through the series of migrations (sharing, Button, Zustand, TypeScript, Tailwind). None are bugs, but they add noise.

## Items to fix

### Dead code

1. **Unused `pick` import in App.tsx** — `pick` is imported from `logo-colors` but only used inside the favicon `useEffect`. Verify if the import is actually used or if the function was inlined.

2. **`console.warn('Invalid share URL')` in useGarden.ts** — Logs to console in production. Either remove, gate behind `import.meta.env.DEV`, or use a proper error handler.

3. **Stylelint** — Only `index.css` remains and it's purely `@theme` config (no custom CSS rules to lint). Stylelint, its config, and its dependencies can be removed unless we plan to add custom CSS again.

4. **`font-[inherit]` in Tailwind classes** — Multiple components set `font-[inherit]` but Tailwind's preflight already makes buttons/inputs inherit font. Check if removing it changes anything.

### Inconsistencies

5. **`ImportCallbacks` type** — Defined inline in `useGarden.ts`, referenced in `ShareButton.tsx`. Should be in `types.ts` or exported from the store.

6. **Hardcoded `#E84393` default bloom color** — Appears in both `colors.ts` (as DEFAULT_STATE_COLORS.blooming) and `MonthGrid.tsx` (as `bloomColor = '#E84393'`). Should reference one source.

7. **CLAUDE.md** — Outdated. Still references old architecture (useReducer, plain CSS, npm). Should reflect: TypeScript, Tailwind, Zustand, pnpm, Playwright, Button component, etc.

## Files to modify

| File                           | Change                                     |
| ------------------------------ | ------------------------------------------ |
| `src/App.tsx`                  | Verify/remove unused `pick` import         |
| `src/hooks/useGarden.ts`       | Gate console.warn behind dev check         |
| `package.json`                 | Remove stylelint + plugins if decided      |
| `.stylelintrc.json`            | Remove if stylelint removed                |
| `src/types.ts`                 | Add `ImportCallbacks` type                 |
| `src/components/MonthGrid.tsx` | Reference shared default color             |
| `CLAUDE.md`                    | Full rewrite to match current architecture |

## Considerations

- Removing stylelint means one less pre-commit check — acceptable since we have no custom CSS to lint
- Updating CLAUDE.md is important for future AI sessions
- These are all safe, non-functional changes — E2E tests should pass unchanged
