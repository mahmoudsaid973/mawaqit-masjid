import { test, expect } from '@playwright/test';
import { loadState, saveState } from './auth.setup';

// Playwright E2E test suite for Azkar feature
// Tests the core functionality of displaying and interacting with Azkar entries

test.describe('Azkar Feature Tests', () => {
  test.beforeEach(async ({ page }) => {
    // Load authentication state if needed
    const authState = await loadState();
    if (authState) {
      await page.context().addCookies(authState.cookies);
    }
    
    // Navigate to the Azkar page
    await page.goto('/azkar');
  });

  test('should display Azkar entries correctly', async ({ page }) => {
    // Wait for the Azkar content to load
    await page.waitForSelector('[data-testid="azkar-list"]', { 
      state: 'visible',
      timeout: 10000 
    });
    
    // Check that Azkar entries are displayed
    await expect(page.locator('[data-testid="azkar-item"]')).toBeVisible();
    
    // Verify at least one Azkar entry exists
    const firstEntry = page.locator('[data-testid="azkar-item"]').first();
    await expect(firstEntry).toBeVisible();
  });

  test('should display loading state while fetching Azkar entries', async ({ page }) => {
    // Intercept API response to simulate loading
    await page.route('**/api/azkar', async route => {
      // Delay the response to ensure we can catch the loading state
      await new Promise(resolve => setTimeout(resolve, 2000));
      route.continue();
    });

    // Reload the page to trigger the API call
    await page.reload();
    
    // Check for loading indicator
    await expect(page.locator('[data-testid="loading-indicator"]')).toBeVisible();
  });

  test('should handle API error gracefully', async ({ page }) => {
    // Mock API failure
    await page.route('**/api/azkar', async route => {
      await route.fulfill({
        status: 500,
        contentType: 'application/json',
        body: JSON.stringify({ error: 'Failed to fetch Azkar entries' }),
      });
    });

    // Reload the page to trigger the API error
    await page.reload();
    
    // Check for error message display
    await expect(page.locator('[data-testid="error-message"]')).toBeVisible();
    await expect(page.locator('[data-testid="error-message"]')).toContainText('Failed to fetch Azkar entries');
  });

  test('should allow user to favorite an Azkar entry', async ({ page }) => {
    // Wait for entries to load
    await page.waitForSelector('[data-testid="azkar-item"]', { state: 'visible' });
    
    // Find the first favorite button
    const favoriteButton = page.locator('[data-testid="favorite-button"]').first();
    await expect(favoriteButton).toBeVisible();
    
    // Click the favorite button
    await favoriteButton.click();
    
    // Verify the entry is favorited
    await expect(favoriteButton).toHaveClass(/favorited/);
  });

  test('should persist user favorites across page reloads', async ({ page }) => {
    // First, favorite an item
    await page.waitForSelector('[data-testid="azkar-item"]', { state: 'visible' });
    
    const favoriteButton = page.locator('[data-testid="favorite-button"]').first();
    await favoriteButton.click();
    
    // Get the ID of the favorited item for verification
    const favoritedItemId = await page.locator('[data-testid="azkar-item"]').first().getAttribute('data-id');
    
    // Reload the page
    await page.reload();
    
    // Verify the item is still favorited
    const favoritedItem = page.locator(`[data-id="${favoritedItemId}"] [data-testid="favorite-button"]`);
    await expect(favoritedItem).toHaveClass(/favorited/);
  });
});
