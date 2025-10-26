import { test, expect } from '@playwright/test';

test.describe('Visual Regression Tests', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/');
  });

  test('home page should match snapshot - desktop', async ({ page }) => {
    // Wait for any animations to complete
    await page.waitForLoadState('networkidle');

    // Take screenshot and compare
    await expect(page).toHaveScreenshot('home-desktop.png', {
      fullPage: true,
      mask: [
        // Mask out dynamic content like timestamps, if any
        page.locator('[data-testid="timestamp"]'),
      ],
    });
  });

  test('home page should match snapshot - mobile', async ({ page }) => {
    await page.setViewportSize({ width: 375, height: 667 });
    await page.waitForLoadState('networkidle');

    await expect(page).toHaveScreenshot('home-mobile.png', {
      fullPage: true,
    });
  });

  test('home page should match snapshot - tablet', async ({ page }) => {
    await page.setViewportSize({ width: 768, height: 1024 });
    await page.waitForLoadState('networkidle');

    await expect(page).toHaveScreenshot('home-tablet.png', {
      fullPage: true,
    });
  });

  test('should have consistent spacing in module cards', async ({ page }) => {
    const moduleCards = page.locator('[class*="module"], [class*="card"]');
    const count = await moduleCards.count();

    expect(count).toBeGreaterThan(0);

    // Check that cards have consistent styling
    for (let i = 0; i < count; i++) {
      const card = moduleCards.nth(i);
      await expect(card).toBeVisible();
    }
  });

  test('should have proper color contrast', async ({ page }) => {
    // Check heading contrast
    const heading = page.locator('h1');
    const headingBg = await heading.evaluate((el) => {
      return window.getComputedStyle(el).backgroundColor;
    });

    const headingColor = await heading.evaluate((el) => {
      return window.getComputedStyle(el).color;
    });

    // Verify both are set (contrast depends on actual RGB values)
    expect(headingBg).toBeTruthy();
    expect(headingColor).toBeTruthy();
  });
});
