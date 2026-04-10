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
    await page.getByText('Plan garden').click();
    await expect(page.getByText('Gardener')).toBeVisible();
    await expect(page).toHaveScreenshot('panel-garden.png', { fullPage: true });
  });

  test('panel — manage view', async ({ page }) => {
    await page.getByText('Plan garden').click();
    await page.getByRole('button', { name: 'Manage flowers' }).click();
    await expect(page.getByText('Available flowers')).toBeVisible();
    await expect(page).toHaveScreenshot('panel-manage.png', { fullPage: true });
  });

  test('panel — flower editor (create)', async ({ page }) => {
    await page.getByText('Plan garden').click();
    await page.getByRole('button', { name: 'Manage flowers' }).click();
    await page.getByText('Create flower').click();
    await expect(page.getByText('Bloom color')).toBeVisible();
    await expect(page).toHaveScreenshot('panel-editor-create.png', {
      fullPage: true,
    });
  });

  test('share dropdown', async ({ page }) => {
    await page.getByRole('button', { name: 'Share garden' }).click();
    await expect(page.getByText('Copy link')).toBeVisible();
    await expect(page).toHaveScreenshot('share-dropdown.png', {
      fullPage: true,
    });
  });

  test('reset confirmation', async ({ page }) => {
    await page.getByRole('button', { name: 'Reset garden' }).click();
    await expect(page.getByText('Reset garden?')).toBeVisible();
    await expect(page).toHaveScreenshot('reset-confirm.png', {
      fullPage: true,
    });
  });

  test('shared garden banner', async ({ page }) => {
    await page
      .context()
      .grantPermissions(['clipboard-read', 'clipboard-write']);
    await page.getByRole('button', { name: 'Share garden' }).click();
    await page.getByText('Copy link').click();
    const shareUrl = await page.evaluate(() => navigator.clipboard.readText());
    await page.goto(shareUrl);
    await expect(page.getByText('View only')).toBeVisible();
    // Wait for D3 label animations to complete (opacity transitions to 1)
    await expect(page.locator('textPath').first()).toBeVisible();
    await expect
      .poll(() =>
        page
          .locator('text[opacity]')
          .first()
          .evaluate((el) => el.getAttribute('opacity')),
      )
      .toBe('0.85');
    await expect(page).toHaveScreenshot('shared-banner.png', {
      fullPage: true,
    });
  });

  test('shared garden — save confirmation', async ({ page }) => {
    await page
      .context()
      .grantPermissions(['clipboard-read', 'clipboard-write']);
    await page.getByRole('button', { name: 'Share garden' }).click();
    await page.getByText('Copy link').click();
    const shareUrl = await page.evaluate(() => navigator.clipboard.readText());
    await page.goto(shareUrl);
    await expect(page.locator('textPath').first()).toBeVisible();
    await expect
      .poll(() =>
        page
          .locator('text[opacity]')
          .first()
          .evaluate((el) => el.getAttribute('opacity')),
      )
      .toBe('0.85');
    await page.getByText('Save to my garden').click();
    await expect(page.getByText('Replace your garden?')).toBeVisible();
    await expect(page).toHaveScreenshot('shared-save-confirm.png', {
      fullPage: true,
    });
  });

  test('error boundary fallback', async ({ page }) => {
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
    // Pause SVG animations for deterministic screenshot
    await page.addStyleTag({
      content:
        'svg animate, svg animateTransform { animation-play-state: paused !important; }',
    });
    // SMIL animations need to be paused via SVG API
    await page.evaluate(() => {
      document.querySelectorAll('svg').forEach((svg) => {
        svg.pauseAnimations?.();
      });
    });
    await expect(page).toHaveScreenshot('error-boundary.png', {
      fullPage: true,
    });
  });
});
