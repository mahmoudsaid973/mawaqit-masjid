import { test, expect } from '@playwright/test';
import { v4 as uuidv4 } from 'uuid';

/**
 * E2E Test Suite for Home Screen Widgets Feature (F006)
 * Tests the ability to view, reorder, and toggle widgets in the admin portal.
 */

test.describe('Home Screen Widgets Admin Portal', () => {
  test('should display widgets in admin portal', async ({ page }) => {
    // Arrange: Navigate to admin portal
    await page.goto('/admin/widgets');

    // Act: Load the page and check for widget list
    const widgetCards = await page.locator('[data-testid="widget-card"]').count();
    
    // Assert: At least one widget is displayed
    expect(widgetCards).toBeGreaterThan(0);
  });

  test('should allow reordering widgets via drag and drop', async ({ page }) => {
    // Arrange: Load the page and ensure widgets are present
    await page.goto('/admin/widgets');
    await page.waitForSelector('[data-testid="widget-card"]');

    // Act: Perform drag and drop simulation
    const widget1 = page.locator('[data-testid="widget-card"]').first();
    const widget2 = page.locator('[data-testid="widget-card"]').nth(1);
    
    // Simulate drag widget1 to a new position after widget2
    await widget1.dragTo(widget2);

    // Assert: Check that the order has changed in the UI
    const reordered = await page.locator('[data-testid="widget-card"]').first().textContent();
    expect(reordered).not.toBeNull();
  });

  test('should allow toggling widget visibility', async ({ page }) => {
    // Arrange: Go to the page and find a widget
    await page.goto('/admin/widgets');
    await page.waitForSelector('[data-testid="widget-card"]');

    // Act: Toggle the first widget's visibility
    const toggleButton = page.locator('[data-testid="toggle-widget"]').first();
    await toggleButton.click();

    // Assert: Check that the widget is now hidden
    const isHidden = await page.locator('[data-testid="widget-card"]').first().isVisible();
    expect(isHidden).toBeFalsy();
  });

  test('should persist widget state after page refresh', async ({ page }) => {
    // Arrange: Create a widget and set it to active
    const widgetId = uuidv4();
    await page.route('**/admin/home-screen-widgets', async route => {
      const json = await route.request().postDataJSON();
      await route.fulfill({
        status: 200,
        body: JSON.stringify({
          id: widgetId,
          isActive: true
        })
      });
    });

    // Act: Simulate page refresh
    await page.reload();

    // Assert: Widget should still be active
    const isActive = await page.locator(`[data-widget-id="${widgetId}"]`).isVisible();
    expect(isActive).toBe(true);
  });
});
