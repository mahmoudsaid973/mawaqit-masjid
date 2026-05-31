import { test, expect } from '@playwright/test';
import { Page } from '@playwright/test';

/**
 * Page Object Model for Admin Portal
 */
class AdminPortalPage {
  readonly page: Page;
  readonly url: string;

  constructor(page: Page) {
    this.page = page;
    this.url = '/admin';
  }

  async goto() {
    await this.page.goto(this.url);
  }

  async login(email: string, password: string) {
    await this.page.getByLabel('Email').fill(email);
    await this.page.getByLabel('Password').fill(password);
    await this.page.getByRole('button', { name: 'Sign In' }).click();
  }

  async navigateToUsers() {
    await this.page.getByRole('link', { name: 'Users' }).click();
  }

  async createUser(name: string, email: string) {
    await this.page.getByRole('button', { name: 'Add User' }).click();
    await this.page.getByLabel('Name').fill(name);
    await this.page.getByLabel('Email').fill(email);
    await this.page.getByRole('button', { name: 'Save' }).click();
  }

  async getUserRow(email: string) {
    return this.page.getByRole('row', { name: email });
  }

  async deleteUser(email: string) {
    const userRow = await this.getUserRow(email);
    await userRow.getByRole('button', { name: 'Delete' }).click();
    await this.page.getByRole('button', { name: 'Confirm' }).click();
  }

  async hasErrorMessage(message: string) {
    return await this.page.getByText(message).isVisible();
  }
}

// Test suite for Admin Portal functionality
test.describe('Admin Portal', () => {
  let adminPage: AdminPortalPage;

  test.beforeEach(async ({ page }) => {
    adminPage = new AdminPortalPage(page);
    await adminPage.goto();
  });

  test('should allow admin to login and view dashboard', async () => {
    // Happy path: successful login
    await adminPage.login('admin@example.com', 'password123');
    await expect(adminPage.page).toHaveURL('/admin/dashboard');
    await expect(adminPage.page.getByRole('heading', { name: 'Admin Dashboard' })).toBeVisible();
  });

  test('should display error for invalid credentials', async () => {
    // Error path: invalid login
    await adminPage.login('invalid@example.com', 'wrongpassword');
    await expect(adminPage.page).toHaveURL('/admin'); // Should stay on login page
    await expect(adminPage.page.getByText('Invalid email or password')).toBeVisible();
  });

  test('should allow admin to create and delete user', async ({ page }) => {
    // Boundary case: full user management flow
    await adminPage.login('admin@example.com', 'password123');
    
    // Navigate to users section
    await adminPage.navigateToUsers();
    await expect(page.getByRole('heading', { name: 'User Management' })).toBeVisible();
    
    // Create a new user
    const userName = 'Test User';
    const userEmail = 'testuser@example.com';
    await adminPage.createUser(userName, userEmail);
    
    // Verify user appears in list
    const userRow = await adminPage.getUserRow(userEmail);
    await expect(userRow).toBeVisible();
    
    // Delete the user
    await adminPage.deleteUser(userEmail);
    
    // Verify user is removed
    await expect(await adminPage.getUserRow(userEmail)).not.toBeVisible();
  });
});
