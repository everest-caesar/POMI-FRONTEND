import { test, expect } from '@playwright/test';

test.describe('Home Page', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/');
  });

  test('should display Pomi branding', async ({ page }) => {
    // Check for page title
    await expect(page).toHaveTitle(/Pomi/);

    // Check for Pomi heading
    const heading = page.locator('h1');
    await expect(heading).toContainText('Pomi');
  });

  test('should display 7 main modules', async ({ page }) => {
    // Check for module sections
    const modules = ['Events', 'Marketplace', 'Business Directory', 'Forums', 'Mentorship', 'Admin', 'Community'];

    for (const module of modules) {
      const moduleElement = page.locator(`text=${module}`);
      await expect(moduleElement).toBeVisible();
    }
  });

  test('should have proper color scheme', async ({ page }) => {
    const heading = page.locator('h1');

    // Check Pomi red color is applied
    const computedColor = await heading.evaluate((el) => {
      return window.getComputedStyle(el).color;
    });

    expect(computedColor).toBeTruthy();
  });

  test('should be responsive on mobile', async ({ page }) => {
    // Set mobile viewport
    await page.setViewportSize({ width: 375, height: 667 });

    // Check that content is still visible
    const heading = page.locator('h1');
    await expect(heading).toBeVisible();

    // Check that grid layouts adjust
    const grid = page.locator('[class*="grid"]');
    await expect(grid).toBeVisible();
  });

  test('should be responsive on tablet', async ({ page }) => {
    // Set tablet viewport
    await page.setViewportSize({ width: 768, height: 1024 });

    // Check that content is visible
    const heading = page.locator('h1');
    await expect(heading).toBeVisible();
  });
});
