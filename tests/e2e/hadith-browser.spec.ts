import { test, expect } from '@playwright/test';

/**
 * E2E tests for the Hadith Browser feature
 * 
 * These tests cover the core functionality of browsing and searching hadiths
 * including navigation, search filters, and content display.
 */

test.describe('Hadith Browser', () => {
  test.beforeEach(async ({ page }) => {
    // Navigate to the hadith browser page before each test
    await page.goto('/hadith-browser');
  });

  test('should display the hadith browser page', async ({ page }) => {
    // Verify that the page loads correctly
    await expect(page).toHaveTitle(/Hadith Browser/);
    await expect(page.getByText('Search Hadiths')).toBeVisible();
  });

  test('should allow searching by keyword', async ({ page }) => {
    // Fill in a search term
    await page.getByPlaceholder('Enter keyword...').fill('prayer');
    await page.getByRole('button', { name: 'Search' }).click();
    
    // Verify search results appear
    await expect(page.getByTestId('hadith-results')).toBeVisible();
    await expect(page.getByTestId('hadith-card')).toHaveCount(10); // Assuming 10 results per page
  });

  test('should allow filtering by collection', async ({ page }) => {
    // Test filtering by hadith collection
    await page.getByTestId('collection-filter').selectOption('Sahih Bukhari');
    
    // Verify results are filtered
    await expect(page.getByTestId('hadith-results')).toBeVisible();
    // Add more specific assertions based on how collections are displayed
  });

  test('should navigate between hadith details', async ({ page }) => {
    // Click on a hadith to view details
    await page.getByTestId('hadith-card').first().click();
    
    // Verify hadith detail page
    await expect(page.getByTestId('hadith-detail')).toBeVisible();
    
    // Navigate back to search results
    await page.goBack();
    await expect(page.getByTestId('hadith-results')).toBeVisible();
  });

  test('should handle empty search results', async ({ page }) => {
    // Search for something that won't match
    await page.getByPlaceholder('Enter keyword...').fill('nonexistenthadith123');
    await page.getByRole('button', { name: 'Search' }).click();
    
    // Verify no results message
    await expect(page.getByText('No hadiths found')).toBeVisible();
  });
});
