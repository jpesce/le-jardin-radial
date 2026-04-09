import { test, expect } from '@playwright/test';
import { SEED_JSON } from './fixtures/seed-state.js';

// Seed localStorage with deterministic state before each test
test.beforeEach(async ({ page }) => {
  await page.goto('/');
  await page.evaluate((json) => {
    localStorage.setItem('jardin-radial', json);
    localStorage.setItem('jardin-radial-lang', 'en');
  }, SEED_JSON);
  await page.reload();
  // Wait for chart to render
  await expect(page.locator('.radial-chart-svg')).toBeVisible();
});

test.describe('visual regression', () => {
  test('main view — English', async ({ page }) => {
    await expect(page).toHaveScreenshot('main-view-en.png', { fullPage: true });
  });

  test('main view — French', async ({ page }) => {
    await page.getByRole('button', { name: 'fr', exact: true }).click();
    await expect(page).toHaveScreenshot('main-view-fr.png', { fullPage: true });
  });

  test('panel — garden view', async ({ page }) => {
    await page.getByText('plan garden').click();
    await expect(page.getByText('gardener')).toBeVisible();
    await expect(page).toHaveScreenshot('panel-garden.png', { fullPage: true });
  });

  test('panel — manage view', async ({ page }) => {
    await page.getByText('plan garden').click();
    await page.getByRole('button', { name: 'Manage flowers' }).click();
    await expect(page.getByText('available flowers')).toBeVisible();
    await expect(page).toHaveScreenshot('panel-manage.png', { fullPage: true });
  });

  test('panel — flower editor (create)', async ({ page }) => {
    await page.getByText('plan garden').click();
    await page.getByRole('button', { name: 'Manage flowers' }).click();
    await page.getByText('create flower').click();
    await expect(page.getByText('bloom color')).toBeVisible();
    await expect(page).toHaveScreenshot('panel-editor-create.png', {
      fullPage: true,
    });
  });

  test('share dropdown', async ({ page }) => {
    await page.getByRole('button', { name: 'Share garden' }).click();
    await expect(page.getByText('copy link')).toBeVisible();
    await expect(page).toHaveScreenshot('share-dropdown.png', {
      fullPage: true,
    });
  });

  test('reset confirmation', async ({ page }) => {
    await page.getByRole('button', { name: 'Reset garden' }).click();
    await expect(page.getByText('reset garden?')).toBeVisible();
    await expect(page).toHaveScreenshot('reset-confirm.png', {
      fullPage: true,
    });
  });

  test('shared garden banner', async ({ page }) => {
    await page
      .context()
      .grantPermissions(['clipboard-read', 'clipboard-write']);
    await page.getByRole('button', { name: 'Share garden' }).click();
    await page.getByText('copy link').click();
    const shareUrl = await page.evaluate(() => navigator.clipboard.readText());
    await page.goto(shareUrl);
    await expect(page.getByText('view only')).toBeVisible();
    // Wait for D3 label animations to complete
    await expect(page.locator('textPath').first()).toBeVisible();
    await page.waitForTimeout(500);
    await expect(page).toHaveScreenshot('shared-banner.png', {
      fullPage: true,
    });
  });

  test('shared garden — save confirmation', async ({ page }) => {
    await page
      .context()
      .grantPermissions(['clipboard-read', 'clipboard-write']);
    await page.getByRole('button', { name: 'Share garden' }).click();
    await page.getByText('copy link').click();
    const shareUrl = await page.evaluate(() => navigator.clipboard.readText());
    await page.goto(shareUrl);
    await expect(page.locator('textPath').first()).toBeVisible();
    await page.waitForTimeout(500);
    await page.getByText('save to my garden').click();
    await expect(page.getByText('replace your garden?')).toBeVisible();
    await expect(page).toHaveScreenshot('shared-save-confirm.png', {
      fullPage: true,
    });
  });
});
