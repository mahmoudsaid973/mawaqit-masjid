import { test, expect } from '@playwright/test';

describe('Hadith Browser E2E Tests', () => {
  test.beforeEach(async ({ page }) => {
    // Navigate to the hadith browser page before each test
    await page.goto('/hadith-browser');
  });

  test('should display hadith browser with search functionality', async ({ page }) => {
    // Check if the page loaded correctly
    await expect(page.getByText('Hadith Browser')).toBeVisible();
    
    // Fill in search term
    await page.fill('[data-testid="search-input"]', 'faith');
    
    // Submit search
    await page.click('[data-testid="search-button"]');
    
    // Check if results are displayed
    await expect(page.locator('[data-testid="hadith-results"]')).toBeVisible();
    
    // Check that results contain search term
    const firstResult = await page.locator('[data-testid="hadith-result"]').first();
    await expect(firstResult).toContainText('faith');
  });

  test('should show error message for invalid search term', async ({ page }) => {
    // Try searching with invalid term
    await page.fill('[data-testid="search-input"]', 'invalid-search-term');
    
    // Submit search
    await page.click('[data-testid="search-button"]');
    
    // Check for error message
    await expect(page.locator('[data-testid="no-results-message"]')).toBeVisible();
  });

  test('should navigate to hadith detail page', async ({ page }) => {
    // Click on first hadith result
    await page.click('[data-testid="hadith-result"]');
    
    // Check if navigation occurred to detail page
    expect(await page.url()).toContain('hadith/');
  });
});