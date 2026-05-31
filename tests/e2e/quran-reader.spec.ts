import { test, expect, Page } from '@playwright/test';

/**
 * Playwright E2E Test Suite for Quran Reader Feature (F003)
 */

test.describe('Quran Reader E2E Tests', () => {
  
  test.beforeEach(async ({ page }) => {
    await page.goto('/');
    await page.waitForLoadState('networkidle');
  });

  test.describe('Surah List and Search', () => {
    test('should display the list of Surahs on initial load', async ({ page }) => {
      await expect(page.locator('[data-testid="surah-list"]')).toBeVisible();
      
      const alFatihaItem = page.locator('[data-testid="surah-item"]').filter({ hasText: /Al-Fatiha/i });
      await expect(alFatihaItem).toBeVisible();
      
      const alIkhlasItem = page.locator('[data-testid="surah-item"]').filter({ hasText: /Al-Ikhlas/i });
      await expect(alIkhlasItem).toBeVisible();
    });

    test('should filter Surahs based on search term', async ({ page }) => {
      const searchInput = page.locator('[data-testid="surah-search-input"]');
      await expect(searchInput).toBeVisible();
      
      await searchInput.fill('Baqarah');
      await page.waitForTimeout(500);
      
      const visibleSurahs = page.locator('[data-testid="surah-item"]').filter({ has: page.locator(':visible') });
      const count = await visibleSurahs.count();
      
      expect(count).toBeGreaterThan(0);
      
      for (let i = 0; i < count; i++) {
        const text = await visibleSurahs.nth(i).textContent();
        expect(text?.toLowerCase()).toContain('baqarah');
      }
      
      await searchInput.clear();
      await page.waitForTimeout(500);
      
      const allSurahs = page.locator('[data-testid="surah-item"]');
      expect(await allSurahs.count()).toBeGreaterThan(count);
    });

    test('should show no results message when search matches nothing', async ({ page }) => {
      const searchInput = page.locator('[data-testid="surah-search-input"]');
      await searchInput.fill('NonExistentSurahNameXYZ');
      await page.waitForTimeout(500);
      
      const noResults = page.locator('[data-testid="no-surahs-found"]');
      await expect(noResults).toBeVisible();
    });
  });

  test.describe('Surah Selection and Ayah Rendering', () => {
    test('should load Ayahs when a Surah is selected', async ({ page }) => {
      const alFatihaItem = page.locator('[data-testid="surah-item"]').filter({ hasText: /Al-Fatiha/i }).first();
      await alFatihaItem.click();
      
      await expect(page.locator('[data-testid="ayah-container"]')).toBeVisible();
      
      const firstAyah = page.locator('[data-testid="ayah-item"]').first();
      await expect(firstAyah).toBeVisible();
      
      const ayahText = await firstAyah.locator('[data-testid="ayah-text"]').textContent();
      expect(ayahText).toBeTruthy();
    });
  });
});
