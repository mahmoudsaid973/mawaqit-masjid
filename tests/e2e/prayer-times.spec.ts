import { test, expect, type Page } from '@playwright/test';

/**
 * Playwright E2E Test Suite for "Prayer Times" Feature (F001)
 * 
 * Validates the end-to-end flow of fetching, displaying, and interacting with prayer times data.
 * Uses the Page Object Model pattern implicitly within the test file for clarity and isolation.
 * 
 * Prerequisites:
 * - The application must be running (dev or prod build)
 * - The prayer times page must be accessible at /prayer-times
 * - Mock data or a stable backend connection must be available
 */

// --- Configuration & Constants ---

const PRAYER_TIMES_PATH = '/prayer-times';
const MOCK_CITY = 'Mecca';
const MOCK_COUNTRY = 'Saudi Arabia';
const EXPECTED_PRAYERS = ['Fajr', 'Dhuhr', 'Asr', 'Maghrib', 'Isha'];

// --- Test Suite ---

test.describe('Prayer Times Feature (F001)', () => {
  
  test.beforeEach(async ({ page }) => {
    // Navigate to the prayer times page before each test
    await page.goto(PRAYER_TIMES_PATH);
    // Wait for the initial loading state to potentially appear and then resolve
    // Assuming a loading indicator exists with a specific role or text, otherwise wait for network idle
    await page.waitForLoadState('networkidle');
  });

  test.describe('Initial Load and Display', () => {
    test('should display the correct page title', async ({ page }) => {
      await expect(page).toHaveTitle(/Prayer Times/);
    });

    test('should display the default location correctly', async ({ page }) => {
      // Assuming the location is displayed in a heading or specific element
      // Adjust selector based on actual implementation (e.g., data-testid, role, text)
      const locationElement = page.getByText(new RegExp(`${MOCK_CITY}`, 'i'));
      await expect(locationElement).toBeVisible();
      
      const countryElement = page.getByText(new RegExp(`${MOCK_COUNTRY}`, 'i'));
      await expect(countryElement).toBeVisible();
    });

    test('should display all five prayer names', async ({ page }) => {
      for (const prayer of EXPECTED_PRAYERS) {
        const prayerElement = page.getByText(prayer);
        await expect(prayerElement).toBeVisible();
      }
    });

    test('should display times for each prayer', async ({ page }) => {
      // Verify that each prayer name is followed by a time (basic structure check)
      for (const prayer of EXPECTED_PRAYERS) {
        // This assumes a structure like "Fajr 05:23" or similar adjacency
        // A more robust check might involve specific data-testid attributes for times
        const prayerRow = page.locator('tr').filter({ hasText: prayer });
        // Check if the row exists and contains something resembling a time (HH:MM)
        await expect(prayerRow).toContainText(/\d{2}:\d{2}/);
      }
    });

    test('should indicate the next prayer', async ({ page }) => {
      // Assuming the next prayer is highlighted or explicitly stated
      // Adjust selector based on actual implementation
      const nextPrayerIndicator = page.getByText(/Next Prayer:/i);
      await expect(nextPrayerIndicator).toBeVisible();
      
      // Check if the specific next prayer (e.g., Asr from mock data) is mentioned near the indicator
      // This might need refinement based on exact DOM structure
      await expect(page.locator('body')).toContainText(/Asr/i); 
    });
  });

  test.describe('Loading and Error States', () => {
    test('should handle loading state gracefully', async ({ page, context }) => {
      // Simulate slow network to observe loading state if possible
      await context.route('**/api/prayer-times*', async route => {
        // Delay the response
        await new Promise(resolve => setTimeout(resolve, 2000));
        await route.continue();
      });

      // Reload the page to trigger the delayed request
      await page.reload();

      // Check for a loading indicator (adjust selector as needed)
      const loadingIndicator = page.getByText(/loading/i);
      await expect(loadingIndicator).toBeVisible({ timeout: 500 }); // Should appear quickly

      // Wait for the content to load after the delay
      await expect(page.getByText(MOCK_CITY)).toBeVisible({ timeout: 5000 });
      await expect(loadingIndicator).not.toBeVisible();
    });

    test('should display an error message if the API fails', async ({ page, context }) => {
      // Mock API failure
      await context.route('**/api/prayer-times*', async route => {
        await route.abort('failed');
      });

      // Reload the page to trigger the failed request
      await page.reload();

      // Wait for potential loading state to finish and error to appear
      await page.waitForTimeout(1000); // Allow time for fetch and error handling

      // Check for an error message (adjust selector/text as needed)
      const errorMessage = page.getByText(/error|failed|unable to load/i);
      await expect(errorMessage).toBeVisible();
    });
  });

  test.describe('Interactivity (If applicable based on hook capabilities)', () => {
    test('should refetch data when the refresh button is clicked', async ({ page }) => {
      // This test assumes there's a visible refresh button
      // Find the refresh button (adjust selector as needed)
      const refreshButton = page.getByRole('button', { name: /refresh/i });
      
      // If the button exists, test the click action
      if (await refreshButton.count() > 0) {
        await expect(refreshButton).toBeEnabled();
        await refreshButton.click();

        // Optionally, check for a brief loading state or verify data remains/updates
        // Since mock data is static, we mainly check that the action doesn't break the UI
        await expect(page.getByText(MOCK_CITY)).toBeVisible();
      } else {
        // Skip if no refresh button is present in the UI
        test.skip();
      }
    });

    test('should allow changing the date (if UI exists)', async ({ page }) => {
      // This test assumes there's a date picker or input
      const dateInput = page.getByRole('textbox', { name: /date/i });
      
      if (await dateInput.count() > 0) {
        const futureDate = '2024-12-25'; // Example date format
        await dateInput.fill(futureDate);
        
        // Trigger change if needed (e.g., press Enter or blur)
        await dateInput.press('Enter');

        // Wait for potential refetch
        await page.waitForLoadState('networkidle');

        // Verify the UI still functions and potentially shows the new date
        await expect(page.getByText(futureDate)).toBeVisible();
      } else {
        // Skip if no date input is present in the UI
        test.skip();
      }
    });
  });
});
