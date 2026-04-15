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
    await expect(
      page.getByRole('heading', { name: 'Le Jardin Radial' }),
    ).toBeAttached();
    await expect(
      page.getByRole('button', { name: 'Reset garden' }),
    ).toBeVisible();
    await expect(
      page.getByRole('button', { name: 'Share garden' }),
    ).toBeVisible();
    await expect(page.getByText('Plan garden')).toBeVisible();
  });

  test('shows default owner name', async ({ page }) => {
    await expect(page.getByText('de Tainah Drummond').first()).toBeVisible();
  });
});

test.describe('panel', () => {
  test('opens and closes with button toggle', async ({ page }) => {
    await page.getByText('Plan garden').click();
    await expect(page.getByText('Done')).toBeVisible();
    await expect(page.getByText('Gardener')).toBeVisible();

    await page.getByText('Done').click();
    await expect(page.getByText('Plan garden')).toBeVisible();
  });

  test('updates owner name', async ({ page }) => {
    await page.getByText('Plan garden').click();
    const input = page.getByLabel('Gardener');
    await input.clear();
    await input.fill('Alice');
    await expect(page.getByText('de Alice').first()).toBeVisible();
  });

  test('persists owner name after reload', async ({ page }) => {
    await page.getByText('Plan garden').click();
    const input = page.getByLabel('Gardener');
    await input.clear();
    await input.fill('Alice');
    await page.getByText('Done').click();

    // Wait for persist middleware to save
    await expect
      .poll(() => page.evaluate(() => localStorage.getItem('jardin-radial')))
      .toBeTruthy();
    await page.reload();
    await expect(page.getByText('de Alice').first()).toBeVisible();
  });

  test('toggles flower visibility on chart', async ({ page }) => {
    await page.getByText('Plan garden').click();
    const firstCheckbox = page.getByRole('checkbox').first();
    await firstCheckbox.click();
    await expect(firstCheckbox).not.toBeChecked();
  });
});

test.describe('share', () => {
  test('opens share dropdown', async ({ page }) => {
    await page.getByRole('button', { name: 'Share garden' }).click();
    await expect(page.getByText('Copy link')).toBeVisible();
    await expect(page.getByText('Save garden')).toBeVisible();
    await expect(page.getByText('Load garden')).toBeVisible();
  });

  test('copy link changes to copied', async ({ page }) => {
    await page.getByRole('button', { name: 'Share garden' }).click();
    await page
      .context()
      .grantPermissions(['clipboard-read', 'clipboard-write']);
    await page.getByText('Copy link').click();
    await expect(page.getByText('Copied!')).toBeVisible();
  });

  test('closes when clicking outside', async ({ page }) => {
    await page.getByRole('button', { name: 'Share garden' }).click();
    await expect(page.getByText('Copy link')).toBeVisible();

    await page.getByRole('img', { name: /radial garden/i }).click();
    await expect(page.getByText('Copy link')).toBeHidden();
  });

  test('share and reset are mutually exclusive', async ({ page }) => {
    await page.getByRole('button', { name: 'Share garden' }).click();
    await expect(page.getByText('Copy link')).toBeVisible();

    await page.getByRole('button', { name: 'Reset garden' }).click();
    await expect(page.getByText('Copy link')).toBeHidden();
    await expect(page.getByText('Reset garden?')).toBeVisible();
  });
});

test.describe('reset', () => {
  test('shows confirmation dialog', async ({ page }) => {
    await page.getByRole('button', { name: 'Reset garden' }).click();
    await expect(page.getByText('Reset garden?')).toBeVisible();
    await expect(page.getByText('Erase all')).toBeVisible();
    await expect(page.getByText('Keep')).toBeVisible();
  });

  test('cancel closes dialog', async ({ page }) => {
    await page.getByRole('button', { name: 'Reset garden' }).click();
    await page.getByText('Keep').click();
    await expect(page.getByText('Reset garden?')).toBeHidden();
  });

  test('confirm resets garden', async ({ page }) => {
    await page.getByText('Plan garden').click();
    const input = page.getByLabel('Gardener');
    await input.clear();
    await input.fill('Alice');
    await page.getByText('Done').click();

    await page.getByRole('button', { name: 'Reset garden' }).click();
    await page.getByText('Erase all').click();

    await expect(page.getByText('de Tainah Drummond').first()).toBeVisible();
  });
});

test.describe('language', () => {
  test('switches to English', async ({ page }) => {
    await page.getByRole('button', { name: 'en', exact: true }).click();
    await expect(page.getByText('Plan garden')).toBeVisible();
  });

  test('switches to French', async ({ page }) => {
    await page.getByRole('button', { name: 'en', exact: true }).click();
    await page.getByRole('button', { name: 'fr', exact: true }).click();
    await expect(page.getByText('Planifier jardin')).toBeVisible();
  });

  test('persists language after reload', async ({ page }) => {
    await page.getByRole('button', { name: 'en', exact: true }).click();
    await page.reload();
    await expect(page.getByText('Plan garden')).toBeVisible();
  });
});

test.describe('shared garden', () => {
  test('shows read-only banner when visiting share URL', async ({ page }) => {
    await page
      .context()
      .grantPermissions(['clipboard-read', 'clipboard-write']);
    await page.getByRole('button', { name: 'Share garden' }).click();
    await page.getByText('Copy link').click();

    const shareUrl = await page.evaluate(() => navigator.clipboard.readText());
    await page.goto(shareUrl);
    await expect(page.getByText('View only — save to edit')).toBeVisible();
    await expect(page.getByText('Back to my garden')).toBeVisible();
    await expect(page.getByText('Save to my garden').first()).toBeVisible();
  });

  test('dismiss returns to own garden', async ({ page }) => {
    await page
      .context()
      .grantPermissions(['clipboard-read', 'clipboard-write']);

    // Change owner and wait for persist
    await page.getByText('Plan garden').click();
    await expect(page.getByText('Gardener')).toBeVisible();
    const input = page.getByLabel('Gardener');
    await input.clear();
    await input.fill('Alice');
    await page.getByText('Done').click();
    await expect
      .poll(() => page.evaluate(() => localStorage.getItem('jardin-radial')))
      .toBeTruthy();

    // Get share URL and navigate
    await page.getByRole('button', { name: 'Share garden' }).click();
    await page.getByText('Copy link').click();
    const shareUrl = await page.evaluate(() => navigator.clipboard.readText());
    await page.goto(shareUrl);

    // Verify shared banner is visible
    await expect(page.getByText('Save to my garden').first()).toBeVisible({
      timeout: 10000,
    });

    // Dismiss
    await page.getByText('Back to my garden').click();
    await expect(page.getByText('View only — save to edit')).toBeHidden();
    await expect(page.getByText('de Alice').first()).toBeVisible();
  });

  test('back button restores shared garden after dismiss', async ({ page }) => {
    await page
      .context()
      .grantPermissions(['clipboard-read', 'clipboard-write']);
    await page.getByRole('button', { name: 'Share garden' }).click();
    await page.getByText('Copy link').click();
    const shareUrl = await page.evaluate(() => navigator.clipboard.readText());
    await page.goto(shareUrl);

    await page.getByText('Back to my garden').click();
    await expect(page.getByText('View only — save to edit')).toBeHidden();

    await page.goBack();
    await expect(page.getByText('View only — save to edit')).toBeVisible();
  });

  test('hides panel buttons when shared', async ({ page }) => {
    await page
      .context()
      .grantPermissions(['clipboard-read', 'clipboard-write']);
    await page.getByRole('button', { name: 'Share garden' }).click();
    await page.getByText('Copy link').click();
    const shareUrl = await page.evaluate(() => navigator.clipboard.readText());
    await page.goto(shareUrl);

    await expect(page.getByText('Plan garden')).toBeHidden();
    await expect(
      page.getByRole('button', { name: 'Reset garden' }),
    ).toBeHidden();
    await expect(
      page.getByRole('button', { name: 'Share garden' }),
    ).toBeHidden();
  });

  test('save shared garden replaces own garden', async ({ page }) => {
    await page
      .context()
      .grantPermissions(['clipboard-read', 'clipboard-write']);
    await page.getByRole('button', { name: 'Share garden' }).click();
    await page.getByText('Copy link').click();
    const shareUrl = await page.evaluate(() => navigator.clipboard.readText());
    await page.goto(shareUrl);

    await page.getByText('Save to my garden').first().click();
    await expect(page.getByText('Replace your garden?')).toBeVisible();
    await page.getByRole('button', { name: 'Replace' }).click();

    await expect(page.getByText('View only — save to edit')).toBeHidden();
    await expect(page.getByText('Plan garden')).toBeVisible();
  });
});

test.describe('manage view', () => {
  test('opens catalog from garden view', async ({ page }) => {
    await page.getByText('Plan garden').click();
    await page.getByRole('button', { name: 'Manage flowers' }).click();
    await expect(page.getByText('Available flowers')).toBeVisible();
    await expect(
      page.getByText('Choose which flowers to work with'),
    ).toBeVisible();
  });

  test('toggles flower in/out of garden', async ({ page }) => {
    await page.getByText('Plan garden').click();
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
    await page.getByText('Plan garden').click();
    await page.getByRole('button', { name: 'Manage flowers' }).click();
    await expect(page.getByText('Available flowers')).toBeVisible();

    await page.getByText('Back').click();
    await expect(page.getByText('Visible flowers')).toBeVisible();
  });

  test('search filters flowers', async ({ page }) => {
    await page.getByText('Plan garden').click();
    await page.getByRole('button', { name: 'Manage flowers' }).click();

    const allItems = await page.getByRole('listitem').count();
    await page.getByPlaceholder('Search...').fill('rose');
    const filteredItems = await page.getByRole('listitem').count();
    expect(filteredItems).toBeLessThan(allItems);
  });
});

test.describe('flower editor', () => {
  test('creates a custom flower', async ({ page }) => {
    await page.getByText('Plan garden').click();
    await page.getByRole('button', { name: 'Manage flowers' }).click();
    await page.getByText('Create flower').click();

    await page.locator('input').nth(0).fill('Test Flower');
    await page.locator('input').nth(1).fill('Fleur Test');

    // Click a month cell twice: dormant → sprouting → blooming
    const cell = page.getByTitle('jan');
    await cell.click();
    await cell.click();

    await page.getByRole('button', { name: 'Save' }).click();

    // Should return to manage view with the new flower
    await expect(page.getByText('Available flowers')).toBeVisible();
    await expect(
      page.getByRole('listitem').filter({ hasText: 'Test Flower' }),
    ).toBeVisible();
  });

  test('deletes a custom flower', async ({ page }) => {
    // First create a flower
    await page.getByText('Plan garden').click();
    await page.getByRole('button', { name: 'Manage flowers' }).click();
    await page.getByText('Create flower').click();

    await page.locator('input').nth(0).fill('To Delete');
    await page.locator('input').nth(1).fill('A Supprimer');
    const cell = page.getByTitle('jan');
    await cell.click();
    await cell.click();
    await page.getByRole('button', { name: 'Save' }).click();

    // Now edit and delete it
    const flowerItem = page
      .getByRole('listitem')
      .filter({ hasText: 'To Delete' });
    await expect(flowerItem).toBeVisible();
    await flowerItem.hover();
    await flowerItem.getByRole('button', { name: 'Edit flower' }).click();

    await page.getByRole('button', { name: 'Delete' }).click();

    // Should return to manage view without the flower
    await expect(page.getByText('Available flowers')).toBeVisible();
    await expect(
      page.getByRole('listitem').filter({ hasText: 'To Delete' }),
    ).toBeHidden();
  });

  test('cancel returns without saving', async ({ page }) => {
    await page.getByText('Plan garden').click();
    await page.getByRole('button', { name: 'Manage flowers' }).click();
    await page.getByText('Create flower').click();

    await page.locator('input').nth(0).fill('Should Not Save');
    await page.locator('input').nth(1).fill('Ne Pas Sauvegarder');

    await page
      .getByRole('button', { name: 'Cancel', exact: true })
      .last()
      .click();

    await expect(page.getByText('Available flowers')).toBeVisible();
    await expect(
      page.getByRole('listitem').filter({ hasText: 'Should Not Save' }),
    ).toBeHidden();
  });
});

test.describe('drag reorder', () => {
  test('reorders flowers by dragging', async ({ page }) => {
    await page.getByText('Plan garden').click();

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

  test('reorders flowers with keyboard', async ({ page }) => {
    await page.getByText('Plan garden').click();

    const checkedItems = page.getByRole('listitem').filter({
      has: page.getByRole('checkbox', { checked: true }),
    });
    const before = await checkedItems.allTextContents();
    expect(before.length).toBeGreaterThanOrEqual(2);

    // Focus the first drag handle and press ArrowDown
    const firstHandle = page.getByRole('button', { name: /^Reorder / }).first();
    await firstHandle.focus();
    await page.keyboard.press('ArrowDown');

    const after = await checkedItems.allTextContents();
    expect(after[0].trim()).toBe(before[1].trim());
    expect(after[1].trim()).toBe(before[0].trim());

    // Press ArrowUp to move it back
    await page.keyboard.press('ArrowUp');

    const restored = await checkedItems.allTextContents();
    expect(restored[0].trim()).toBe(before[0].trim());
    expect(restored[1].trim()).toBe(before[1].trim());
  });
});

test.describe('flower editor validation', () => {
  test('shows validation error when fields are missing', async ({ page }) => {
    await page.getByText('Plan garden').click();
    await page.getByRole('button', { name: 'Manage flowers' }).click();
    await page.getByText('Create flower').click();

    await page.getByRole('button', { name: 'Save' }).click();

    await expect(page.getByText('Names are required')).toBeVisible();
  });
});

test.describe('error boundary', () => {
  test('shows fallback when app crashes', async ({ page }) => {
    // Inject corrupted garden state and set English language
    await page.evaluate(() => {
      localStorage.setItem('jardin-radial-lang', 'en');
      localStorage.setItem(
        'jardin-radial',
        JSON.stringify({
          state: {
            owner: null,
            labels: 'not-a-boolean',
            defaultCatalog: 'not-an-array',
            garden: null,
            selected: null,
            customFlowers: null,
          },
          version: 0,
        }),
      );
    });
    await page.reload();

    // The error boundary should catch the crash and show fallback
    await expect(page.getByText('Well, that didn’t bloom')).toBeVisible({
      timeout: 10000,
    });
    await expect(
      page.getByRole('button', { name: 'Refresh page' }),
    ).toBeVisible();
    await expect(
      page.getByRole('button', { name: 'Start fresh' }),
    ).toBeVisible();
  });

  test('reset garden clears storage and recovers', async ({ page }) => {
    // Inject corrupted state with English language
    await page.evaluate(() => {
      localStorage.setItem('jardin-radial-lang', 'en');
      localStorage.setItem(
        'jardin-radial',
        JSON.stringify({
          state: {
            owner: null,
            labels: 'not-a-boolean',
            defaultCatalog: 'not-an-array',
            garden: null,
            selected: null,
            customFlowers: null,
          },
          version: 0,
        }),
      );
    });
    await page.reload();

    await expect(page.getByText('Well, that didn’t bloom')).toBeVisible({
      timeout: 10000,
    });

    // Click reset garden — should clear storage and recover
    await page.getByRole('button', { name: 'Start fresh' }).click();

    // Should load fresh garden
    await expect(page.getByText('Plan garden')).toBeVisible({ timeout: 10000 });
  });
});

test.describe('not found', () => {
  test('shows fallback for unknown URL', async ({ page }) => {
    await page.goto('/some/random/path');
    await expect(page.getByText('Nothing planted here')).toBeVisible();
    await expect(
      page.getByRole('button', { name: 'Go to garden' }),
    ).toBeVisible();
  });

  test('navigates back to garden', async ({ page }) => {
    await page.goto('/unknown');
    await expect(page.getByText('Nothing planted here')).toBeVisible();
    await page.getByRole('button', { name: 'Go to garden' }).click();
    await expect(page.getByText('Plan garden')).toBeVisible({ timeout: 10000 });
  });
});

test.describe('invalid share', () => {
  test('shows fallback for corrupted share URL', async ({ page }) => {
    await page.goto('/share/not-valid-data');
    await expect(page.getByText('This bouquet wilted')).toBeVisible();
    await expect(
      page.getByRole('button', { name: 'Go to garden' }),
    ).toBeVisible();
  });

  test('navigates back to garden', async ({ page }) => {
    await page.goto('/share/broken');
    await expect(page.getByText('This bouquet wilted')).toBeVisible();
    await page.getByRole('button', { name: 'Go to garden' }).click();
    await expect(page.getByText('Plan garden')).toBeVisible({ timeout: 10000 });
  });
});

test.describe('URL normalization', () => {
  test('double slashes redirect to clean URL', async ({ page, baseURL }) => {
    await page.goto(`${baseURL}//fr`);
    await page.waitForURL('**/fr');
    await expect(page.getByText('Planifier jardin')).toBeVisible();
  });

  test('double slashes on unknown path show not-found after redirect', async ({
    page,
    baseURL,
  }) => {
    await page.goto(`${baseURL}//unknown`);
    await page.waitForURL('**/unknown');
    await expect(page.getByText('Nothing planted here')).toBeVisible();
  });
});
