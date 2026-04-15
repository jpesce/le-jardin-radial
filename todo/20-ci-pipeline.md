# Todo 20 — Add CI pipeline with GitHub Actions

## Context

The project has 217 tests (150 unit + 59 E2E functional + 8 a11y) and 20 visual regression snapshots, but they only run locally. A CI pipeline ensures tests stay green on every push/PR and signals to reviewers that testing is part of the development process, not an afterthought.

## Approach

Single GitHub Actions workflow (`.github/workflows/ci.yml`) triggered on push to `main` and on pull requests. Three jobs running in parallel:

### Job 1: Lint + Type Check + Unit Tests

```yaml
- pnpm install
- pnpm lint
- pnpm typecheck
- pnpm test
```

Fast (~30s). Catches code quality issues early.

### Job 2: E2E + A11y Tests

```yaml
- pnpm install
- npx playwright install --with-deps chromium
- pnpm test:e2e
```

Runs all 67 E2E tests (functional + a11y + visual regression) against a Vite dev server. Needs Chromium browser installed.

### Considerations

- **Visual regression on CI**: Playwright screenshots are platform-dependent (font rendering differs between macOS and Linux). Options:
  1. Generate Linux baselines separately (`--update-snapshots` on CI) and store in a `linux/` subfolder
  2. Use Docker with a consistent image for deterministic rendering
  3. Skip visual tests on CI and only run functional + a11y (simplest)
  4. Use `maxDiffPixels` tolerance (already set to 100) — may be enough

- **Playwright caching**: Cache `~/.cache/ms-playwright` to speed up browser installation.

- **pnpm caching**: Cache `node_modules` via `pnpm store` for faster installs.

- **Storybook build**: Optionally add `pnpm exec storybook build` as a smoke test to ensure component docs don't break.

## Files to create/modify

| File                       | Change                                                        |
| -------------------------- | ------------------------------------------------------------- |
| `.github/workflows/ci.yml` | **Create** — CI workflow                                      |
| `playwright.config.js`     | May need conditional config for CI (e.g., `retries: 2` on CI) |

## Verification

- Push a branch, verify all jobs pass on GitHub Actions
- Create a PR, verify status checks appear
- Intentionally break a test, verify CI catches it
