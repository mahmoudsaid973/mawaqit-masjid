import { test, expect } from '@playwright/test';

test.describe('Admin Portal', () => {
  test('should load the admin portal page', async ({ page }) => {
    // Arrange
    await page.goto('/admin');
    
    // Act & Assert
    await expect(page).toHaveTitle(/Admin Portal/);
  });

  test('should display admin portal data', async ({ page }) => {
    // Arrange
    await page.goto('/admin');
    
    // Act & Assert
    const adminPortalHeading = page.getByRole('heading', { name: 'Admin Portal' });
    await adminPortalHeading.waitFor();
    
    await expect(page.getByText('User Management')).toBeVisible();
    await expect(page.getByText('Settings')).toBeVisible();
  });

  test('should handle user management navigation', async ({ page }) => {
    // Arrange
    await page.goto('/admin');
    
    // Act
    await page.getByText('User Management').click();
    
    // Assert
    await expect(page).toHaveURL(/user-management/);
  });

  test('should handle settings navigation', async ({ page }) => {
    // Arrange
    await page.goto('/admin');
    
    // Act
    await page.getByText('Settings').click();
    
    // Assert
    await expect(page).toHaveURL(/settings/);
  });
});