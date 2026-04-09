import { test, expect } from '@playwright/test';

test.beforeEach(async ({ page }) => {
  await page.goto('/');
  await page.evaluate(() => localStorage.clear());
  await page.reload();
});

test.describe('initial load', () => {
  test('renders the chart and UI elements', async ({ page }) => {
    await expect(
      page.getByRole('img', { name: /radial garden/i }),
    ).toBeVisible();
    await expect(page.locator('text=LE JARDIN RADIAL')).toBeVisible();
    await expect(
      page.getByRole('button', { name: 'Reset garden' }),
    ).toBeVisible();
    await expect(
      page.getByRole('button', { name: 'Share garden' }),
    ).toBeVisible();
    await expect(page.getByText('plan garden')).toBeVisible();
  });

  test('shows default owner name', async ({ page }) => {
    await expect(page.locator('text=DE TAINAH DRUMMOND')).toBeVisible();
  });
});

test.describe('panel', () => {
  test('opens and closes with button toggle', async ({ page }) => {
    await page.getByText('plan garden').click();
    await expect(page.getByText('done')).toBeVisible();
    await expect(page.getByText('gardener')).toBeVisible();

    await page.getByText('done').click();
    await expect(page.getByText('plan garden')).toBeVisible();
  });

  test('updates owner name', async ({ page }) => {
    await page.getByText('plan garden').click();
    const input = page.locator('input[type="text"]').first();
    await input.clear();
    await input.fill('Alice');
    await expect(page.locator('text=DE ALICE')).toBeVisible();
  });

  test('persists owner name after reload', async ({ page }) => {
    await page.getByText('plan garden').click();
    const input = page.locator('input[type="text"]').first();
    await input.clear();
    await input.fill('Alice');
    await page.getByText('done').click();

    // Wait for persist middleware to save
    await page.waitForTimeout(500);
    await page.reload();
    await expect(page.locator('text=DE ALICE')).toBeVisible();
  });

  test('toggles flower visibility on chart', async ({ page }) => {
    await page.getByText('plan garden').click();
    const firstCheckbox = page.getByRole('checkbox').first();
    await firstCheckbox.click();
    await expect(firstCheckbox).not.toBeChecked();
  });
});

test.describe('share', () => {
  test('opens share dropdown', async ({ page }) => {
    await page.getByRole('button', { name: 'Share garden' }).click();
    await expect(page.getByText('copy link')).toBeVisible();
    await expect(page.getByText('save file')).toBeVisible();
    await expect(page.getByText('open file')).toBeVisible();
  });

  test('copy link changes to copied', async ({ page }) => {
    await page.getByRole('button', { name: 'Share garden' }).click();
    await page
      .context()
      .grantPermissions(['clipboard-read', 'clipboard-write']);
    await page.getByText('copy link').click();
    await expect(page.getByText('copied!')).toBeVisible();
  });

  test('closes when clicking outside', async ({ page }) => {
    await page.getByRole('button', { name: 'Share garden' }).click();
    await expect(page.getByText('copy link')).toBeVisible();

    await page.getByRole('img', { name: /radial garden/i }).click();
    await expect(page.getByText('copy link')).not.toBeVisible();
  });

  test('share and reset are mutually exclusive', async ({ page }) => {
    await page.getByRole('button', { name: 'Share garden' }).click();
    await expect(page.getByText('copy link')).toBeVisible();

    await page.getByRole('button', { name: 'Reset garden' }).click();
    await expect(page.getByText('copy link')).not.toBeVisible();
    await expect(page.getByText('reset garden?')).toBeVisible();
  });
});

test.describe('reset', () => {
  test('shows confirmation dialog', async ({ page }) => {
    await page.getByRole('button', { name: 'Reset garden' }).click();
    await expect(page.getByText('reset garden?')).toBeVisible();
    await expect(page.getByText('erase all')).toBeVisible();
    await expect(page.getByText('keep')).toBeVisible();
  });

  test('cancel closes dialog', async ({ page }) => {
    await page.getByRole('button', { name: 'Reset garden' }).click();
    await page.getByText('keep').click();
    await expect(page.getByText('reset garden?')).not.toBeVisible();
  });

  test('confirm resets garden', async ({ page }) => {
    await page.getByText('plan garden').click();
    const input = page.locator('input[type="text"]').first();
    await input.clear();
    await input.fill('Alice');
    await page.getByText('done').click();

    await page.getByRole('button', { name: 'Reset garden' }).click();
    await page.getByText('erase all').click();

    await expect(page.locator('text=DE TAINAH DRUMMOND')).toBeVisible();
  });
});

test.describe('language', () => {
  test('switches to English', async ({ page }) => {
    await page.getByRole('button', { name: 'en', exact: true }).click();
    await expect(page.getByText('plan garden')).toBeVisible();
  });

  test('switches to French', async ({ page }) => {
    await page.getByRole('button', { name: 'en', exact: true }).click();
    await page.getByRole('button', { name: 'fr', exact: true }).click();
    await expect(page.getByText('planifier jardin')).toBeVisible();
  });

  test('persists language after reload', async ({ page }) => {
    await page.getByRole('button', { name: 'en', exact: true }).click();
    await page.reload();
    await expect(page.getByText('plan garden')).toBeVisible();
  });
});

test.describe('shared garden', () => {
  test('shows read-only banner when visiting share URL', async ({ page }) => {
    await page
      .context()
      .grantPermissions(['clipboard-read', 'clipboard-write']);
    await page.getByRole('button', { name: 'Share garden' }).click();
    await page.getByText('copy link').click();

    const shareUrl = await page.evaluate(() => navigator.clipboard.readText());
    await page.goto(shareUrl);
    await expect(page.getByText('view only')).toBeVisible();
    await expect(page.getByText('back to my garden')).toBeVisible();
    await expect(page.getByText('save to my garden')).toBeVisible();
  });

  test('dismiss returns to own garden', async ({ page }) => {
    await page
      .context()
      .grantPermissions(['clipboard-read', 'clipboard-write']);

    // Change owner and wait for persist
    await page.getByText('plan garden').click();
    const input = page.locator('input[type="text"]').first();
    await input.clear();
    await input.fill('Alice');
    await page.getByText('done').click();
    await page.waitForTimeout(500);

    // Get share URL and navigate
    await page.getByRole('button', { name: 'Share garden' }).click();
    await page.getByText('copy link').click();
    const shareUrl = await page.evaluate(() => navigator.clipboard.readText());
    await page.goto(shareUrl);

    // Verify shared banner is visible
    await expect(page.getByText('save to my garden')).toBeVisible({
      timeout: 10000,
    });

    // Dismiss
    await page.getByText('back to my garden').click();
    await expect(page.getByText('view only')).not.toBeVisible();
    await expect(page.locator('text=DE ALICE')).toBeVisible();
  });

  test('back button restores shared garden after dismiss', async ({ page }) => {
    await page
      .context()
      .grantPermissions(['clipboard-read', 'clipboard-write']);
    await page.getByRole('button', { name: 'Share garden' }).click();
    await page.getByText('copy link').click();
    const shareUrl = await page.evaluate(() => navigator.clipboard.readText());
    await page.goto(shareUrl);

    await page.getByText('back to my garden').click();
    await expect(page.getByText('view only')).not.toBeVisible();

    await page.goBack();
    await expect(page.getByText('view only')).toBeVisible();
  });

  test('hides panel buttons when shared', async ({ page }) => {
    await page
      .context()
      .grantPermissions(['clipboard-read', 'clipboard-write']);
    await page.getByRole('button', { name: 'Share garden' }).click();
    await page.getByText('copy link').click();
    const shareUrl = await page.evaluate(() => navigator.clipboard.readText());
    await page.goto(shareUrl);

    await expect(page.getByText('plan garden')).not.toBeVisible();
    await expect(
      page.getByRole('button', { name: 'Reset garden' }),
    ).not.toBeVisible();
    await expect(
      page.getByRole('button', { name: 'Share garden' }),
    ).not.toBeVisible();
  });

  test('save shared garden replaces own garden', async ({ page }) => {
    await page
      .context()
      .grantPermissions(['clipboard-read', 'clipboard-write']);
    await page.getByRole('button', { name: 'Share garden' }).click();
    await page.getByText('copy link').click();
    const shareUrl = await page.evaluate(() => navigator.clipboard.readText());
    await page.goto(shareUrl);

    await page.getByText('save to my garden').click();
    await expect(page.getByText('replace your garden?')).toBeVisible();
    await page.getByRole('button', { name: 'replace' }).click();

    await expect(page.getByText('view only')).not.toBeVisible();
    await expect(page.getByText('plan garden')).toBeVisible();
  });
});

test.describe('manage view', () => {
  test('opens catalog from garden view', async ({ page }) => {
    await page.getByText('plan garden').click();
    await page.getByRole('button', { name: 'Manage flowers' }).click();
    await expect(page.getByText('available flowers')).toBeVisible();
    await expect(
      page.getByText('choose which flowers to work with'),
    ).toBeVisible();
  });

  test('toggles flower in/out of garden', async ({ page }) => {
    await page.getByText('plan garden').click();
    await page.getByRole('button', { name: 'Manage flowers' }).click();

    // Find first unchecked flower by name for a stable locator
    const firstUncheckedItem = page
      .getByRole('listitem')
      .filter({
        has: page.getByRole('checkbox', { checked: false }),
      })
      .first();
    const name = await firstUncheckedItem.getByText(/\w/).first().textContent();

    const item = page.getByRole('listitem').filter({ hasText: name.trim() });
    const checkbox = item.getByRole('checkbox');

    await checkbox.click();
    await expect(checkbox).toBeChecked();

    await checkbox.click();
    await expect(checkbox).not.toBeChecked();
  });

  test('back button returns to garden view', async ({ page }) => {
    await page.getByText('plan garden').click();
    await page.getByRole('button', { name: 'Manage flowers' }).click();
    await expect(page.getByText('available flowers')).toBeVisible();

    await page.getByText('back').click();
    await expect(page.getByText('visible flowers')).toBeVisible();
  });

  test('search filters flowers', async ({ page }) => {
    await page.getByText('plan garden').click();
    await page.getByRole('button', { name: 'Manage flowers' }).click();

    const allItems = await page.getByRole('listitem').count();
    await page.getByPlaceholder('search...').fill('rose');
    const filteredItems = await page.getByRole('listitem').count();
    expect(filteredItems).toBeLessThan(allItems);
  });
});

test.describe('flower editor', () => {
  test('creates a custom flower', async ({ page }) => {
    await page.getByText('plan garden').click();
    await page.getByRole('button', { name: 'Manage flowers' }).click();
    await page.getByText('create flower').click();

    await page.locator('input').nth(0).fill('Test Flower');
    await page.locator('input').nth(1).fill('Fleur Test');

    // Click a month cell twice: dormant → sprouting → blooming
    const cell = page.getByTitle('jan');
    await cell.click();
    await cell.click();

    await page.getByRole('button', { name: 'save' }).click();

    // Should return to manage view with the new flower
    await expect(page.getByText('available flowers')).toBeVisible();
    await expect(
      page.getByRole('listitem').filter({ hasText: 'Test Flower' }),
    ).toBeVisible();
  });

  test('deletes a custom flower', async ({ page }) => {
    // First create a flower
    await page.getByText('plan garden').click();
    await page.getByRole('button', { name: 'Manage flowers' }).click();
    await page.getByText('create flower').click();

    await page.locator('input').nth(0).fill('To Delete');
    await page.locator('input').nth(1).fill('A Supprimer');
    const cell = page.getByTitle('jan');
    await cell.click();
    await cell.click();
    await page.getByRole('button', { name: 'save' }).click();

    // Now edit and delete it
    const flowerItem = page
      .getByRole('listitem')
      .filter({ hasText: 'To Delete' });
    await expect(flowerItem).toBeVisible();
    await flowerItem.hover();
    await flowerItem.getByRole('button', { name: 'Edit flower' }).click();

    await page.getByRole('button', { name: 'delete' }).click();

    // Should return to manage view without the flower
    await expect(page.getByText('available flowers')).toBeVisible();
    await expect(
      page.getByRole('listitem').filter({ hasText: 'To Delete' }),
    ).not.toBeVisible();
  });

  test('cancel returns without saving', async ({ page }) => {
    await page.getByText('plan garden').click();
    await page.getByRole('button', { name: 'Manage flowers' }).click();
    await page.getByText('create flower').click();

    await page.locator('input').nth(0).fill('Should Not Save');
    await page.locator('input').nth(1).fill('Ne Pas Sauvegarder');

    await page.getByRole('button', { name: 'cancel', exact: true }).click();

    await expect(page.getByText('available flowers')).toBeVisible();
    await expect(
      page.getByRole('listitem').filter({ hasText: 'Should Not Save' }),
    ).not.toBeVisible();
  });
});

test.describe('drag reorder', () => {
  test('reorders flowers by dragging', async ({ page }) => {
    await page.getByText('plan garden').click();

    // Get the initial order of selected flowers
    const checkedItems = page.getByRole('listitem').filter({
      has: page.getByRole('checkbox', { checked: true }),
    });
    const before = await checkedItems.allTextContents();
    expect(before.length).toBeGreaterThanOrEqual(2);

    // Get bounding boxes of first two selected flowers
    const firstItem = checkedItems.nth(0);
    const secondItem = checkedItems.nth(1);

    const firstBox = await firstItem.boundingBox();
    const secondBox = await secondItem.boundingBox();

    // Drag first flower below second
    const startX = firstBox.x + firstBox.width / 2;
    const startY = firstBox.y + firstBox.height / 2;
    const endY = secondBox.y + secondBox.height;

    await page.mouse.move(startX, startY);
    await page.mouse.down();
    await page.mouse.move(startX, startY + 5);
    await page.mouse.move(startX, endY);
    await page.mouse.up();

    const after = await checkedItems.allTextContents();
    expect(after[0].trim()).toBe(before[1].trim());
    expect(after[1].trim()).toBe(before[0].trim());
  });
});

test.describe('flower editor validation', () => {
  test('shows validation error when fields are missing', async ({ page }) => {
    await page.getByText('plan garden').click();
    await page.getByRole('button', { name: 'Manage flowers' }).click();
    await page.getByText('create flower').click();

    await page.getByRole('button', { name: 'save' }).click();

    await expect(page.getByText('names are required')).toBeVisible();
  });
});
