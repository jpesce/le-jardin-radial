# 12 — Add component unit tests

## Context

Test coverage is limited to 3 files: `useGarden.test.ts` (96 tests for reducer/validation/reconciliation), `i18n-utils.test.ts`, and `months.test.ts`. No component unit tests exist. Complex component logic — Button class composition, FlowerEditor validation, MonthGrid state cycling, share URL encoding — is only tested indirectly via E2E tests (slow, coarse).

## Scope

Add focused unit tests for components and hooks with non-trivial logic. Don't test pure rendering — that's what visual regression tests cover.

## Priority test targets

### 1. Button.tsx — `buttonClass()` and `innerClass()`

- Verify correct Tailwind classes for each variant × shape × size × color combination
- Verify `cn()` merges className correctly (consumer overrides win)
- Verify `iconOnly` detection

### 2. FlowerEditor.tsx — validation logic

- Missing name → shows `validationName` error
- Invalid hex color → shows `validationColor` error
- No blooming month → shows `validationBlooming` error
- Valid form → calls `onSave` with correct data shape
- `compactMonths()` compression logic

### 3. MonthGrid.tsx — state cycling

- Click cycles: dormant → sprouting → blooming → foliage → dormant
- Correct colors applied per state

### 4. useDragReorder.ts — reorder logic

- `getInsertIndex()` returns correct position
- Pointer threshold prevents accidental drags
- Reorder array manipulation is correct

### 5. Share URL encoding/decoding

- `getShareUrl()` produces a valid URL
- Round-trip: encode → decode → state matches original
- Minimal catalog (only garden flowers) in URL
- Language is embedded in payload

### 6. logo-colors.ts — color generation

- `hashString()` is deterministic
- `colorsFromName()` returns valid hex colors
- `isLight()` correctly identifies light vs dark colors
- `pick()` returns a palette color

## Testing approach

Use Vitest with `@testing-library/react` for component tests that need rendering. Use pure function tests for utility logic (no React rendering needed).

## Files to create

| File                                  | Tests                               |
| ------------------------------------- | ----------------------------------- |
| `src/components/Button.test.ts`       | buttonClass composition, cn merging |
| `src/components/FlowerEditor.test.ts` | Validation, compactMonths           |
| `src/components/MonthGrid.test.ts`    | State cycling                       |
| `src/hooks/useDragReorder.test.ts`    | Reorder logic                       |
| `src/components/logo-colors.test.ts`  | Color utilities                     |

## Considerations

- Don't install `@testing-library/react` unless needed — test pure functions first
- `buttonClass()` and `compactMonths()` can be tested without rendering
- `useDragReorder` has DOM dependencies (querySelectorAll) — may need jsdom or mock
- Share URL tests need `lz-string` — already a dependency
- Keep test files colocated with source (Vitest already configured for `src/`)
