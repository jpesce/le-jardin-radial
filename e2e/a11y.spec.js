import { test, expect } from '@playwright/test';
import AxeBuilder from '@axe-core/playwright';
import { SEED_JSON } from './fixtures/seed-state.js';

// Seed localStorage with deterministic state before each test
test.beforeEach(async ({ page }) => {
  await page.goto('/');
  await page.evaluate((json) => {
    localStorage.setItem('jardin-radial', json);
    localStorage.setItem('jardin-radial-lang', 'en');
  }, SEED_JSON);
  await page.reload();
  await expect(page.locator('.radial-chart-svg')).toBeVisible();
});

/** Scan page with axe-core, ignoring color-contrast rules */
async function audit(page) {
  const results = await new AxeBuilder({ page })
    .disableRules(['color-contrast'])
    .analyze();
  return results.violations;
}

test.describe('accessibility', () => {
  test('main view has no a11y violations', async ({ page }) => {
    const violations = await audit(page);
    expect(violations).toEqual([]);
  });

  test('panel — garden view has no a11y violations', async ({ page }) => {
    await page.getByText('Plan garden').click();
    await expect(page.getByText('Gardener')).toBeVisible();
    const violations = await audit(page);
    expect(violations).toEqual([]);
  });

  test('panel — manage view has no a11y violations', async ({ page }) => {
    await page.getByText('Plan garden').click();
    await page.getByRole('button', { name: 'Manage flowers' }).click();
    await expect(page.getByText('Available flowers')).toBeVisible();
    const violations = await audit(page);
    expect(violations).toEqual([]);
  });

  test('panel — flower editor has no a11y violations', async ({ page }) => {
    await page.getByText('Plan garden').click();
    await page.getByRole('button', { name: 'Manage flowers' }).click();
    await page.getByText('Create flower').click();
    await expect(page.getByText('Bloom color')).toBeVisible();
    const violations = await audit(page);
    expect(violations).toEqual([]);
  });

  test('share dropdown has no a11y violations', async ({ page }) => {
    await page.getByRole('button', { name: 'Share garden' }).click();
    await expect(page.getByText('Copy link')).toBeVisible();
    const violations = await audit(page);
    expect(violations).toEqual([]);
  });

  test('reset confirmation has no a11y violations', async ({ page }) => {
    await page.getByRole('button', { name: 'Reset garden' }).click();
    await expect(page.getByText('Reset garden?')).toBeVisible();
    const violations = await audit(page);
    expect(violations).toEqual([]);
  });

  test('shared garden banner has no a11y violations', async ({ page }) => {
    await page
      .context()
      .grantPermissions(['clipboard-read', 'clipboard-write']);
    await page.getByRole('button', { name: 'Share garden' }).click();
    await page.getByText('Copy link').click();
    const shareUrl = await page.evaluate(() => navigator.clipboard.readText());
    await page.goto(shareUrl);
    await expect(page.getByText('View only — save to edit')).toBeVisible();
    const violations = await audit(page);
    expect(violations).toEqual([]);
  });

  test('error boundary has no a11y violations', async ({ page }) => {
    await page.evaluate(() => {
      localStorage.setItem('jardin-radial-lang', 'en');
      localStorage.setItem(
        'jardin-radial',
        JSON.stringify({
          state: {
            owner: null,
            labels: 'bad',
            defaultCatalog: 'bad',
            garden: null,
            selected: null,
            customFlowers: null,
          },
          version: 0,
        }),
      );
    });
    await page.reload();
    await expect(page.getByText('Well, that didn\u2019t bloom')).toBeVisible();
    const violations = await audit(page);
    expect(violations).toEqual([]);
  });
});
