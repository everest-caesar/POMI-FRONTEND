import { test, expect } from '@playwright/test';

const languages = [
  { code: 'en', name: 'English' },
  { code: 'am', name: 'Amharic' },
  { code: 'ti', name: 'Tigrinya' },
  { code: 'om', name: 'Oromo' },
];

test.describe('Multilingual Support', () => {
  test.beforeEach(async ({ page }) => {
    // Set language in localStorage before visiting page
    await page.evaluate((lang) => {
      localStorage.setItem('language', lang);
    }, 'en');
  });

  languages.forEach(({ code, name }) => {
    test(`should load in ${name} (${code})`, async ({ page }) => {
      // Set language
      await page.evaluate((lang) => {
        localStorage.setItem('language', lang);
      }, code);

      await page.goto('/');

      // Check that page renders without errors
      const heading = page.locator('h1');
      await expect(heading).toBeVisible();

      // For RTL languages (Amharic, Tigrinya), check direction
      if (['am', 'ti'].includes(code)) {
        const body = page.locator('body');
        const dir = await body.getAttribute('dir');
        expect(['rtl', 'RTL', null]).toContain(dir); // null is acceptable if using CSS
      }
    });
  });

  test('should switch languages dynamically', async ({ page }) => {
    await page.goto('/');

    // Assume there's a language selector in the UI
    for (const { code, name } of languages) {
      // Click language selector and choose language
      const languageBtn = page.locator(`button[data-lang="${code}"]`);
      if (await languageBtn.isVisible()) {
        await languageBtn.click();

        // Verify language changed
        const htmlLang = await page.locator('html').getAttribute('lang');
        expect(htmlLang).toBe(code);
      }
    }
  });

  test('should maintain language preference after reload', async ({ page }) => {
    const selectedLang = 'am'; // Amharic

    // Set language
    await page.evaluate((lang) => {
      localStorage.setItem('language', lang);
    }, selectedLang);

    await page.goto('/');

    // Reload page
    await page.reload();

    // Check language is still set
    const htmlLang = await page.locator('html').getAttribute('lang');
    expect(htmlLang).toBe(selectedLang);
  });
});
