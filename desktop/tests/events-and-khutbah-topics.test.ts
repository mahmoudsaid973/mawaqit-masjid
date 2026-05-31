import { test, expect } from '@playwright/experimental-ct-electron/test';
import { _electron as electron } from 'playwright';
import type { ElectronApplication } from 'playwright';

/**
 * Test suite for Events and Khutbah Topics functionality
 * Covers happy path, error handling, and boundary conditions
 */

test.describe('Events and Khutbah Topics', () => {
  let app: ElectronApplication;
  
  test.beforeAll(async () => {
    // Launch Electron app
    app = await electron.launch({
      args: [require('path').join(__dirname, '../..', 'main.js')],
    });
  });

  test.afterAll(async () => {
    // Close Electron app
    await app.close();
  });

  test('should fetch topics successfully when authenticated', async () => {
    // Get the main window
    const window = await app.firstWindow();
    
    // Wait for the app to be ready
    await window.waitForLoadState('domcontentloaded');
    
    // Simulate authentication (this would normally be done via login flow)
    // For testing purposes, we'll mock the authentication state
    await app.evaluate(async ({ ipcRenderer }) => {
      // Mock authentication state
      globalThis.__mockAuthState = true;
    });
    
    // Send IPC request
    const response = await app.evaluate(async ({ ipcRenderer }) => {
      return new Promise((resolve) => {
        ipcRenderer.once('events-and-khutbah-topics-response', (event, data) => {
          resolve(data);
        });
        ipcRenderer.send('events-and-khutbah-topics-request', {});
      });
    });
    
    // Assertions
    expect(response).toHaveProperty('success', true);
    expect(response).toHaveProperty('data');
    expect(Array.isArray(response.data)).toBeTruthy();
    
    // Verify data structure
    if (response.data.length > 0) {
      const firstTopic = response.data[0];
      expect(firstTopic).toHaveProperty('id');
      expect(firstTopic).toHaveProperty('title');
      expect(firstTopic).toHaveProperty('description');
    }
  });

  test('should return error when not authenticated', async () => {
    // Get the main window
    const window = await app.firstWindow();
    
    // Wait for the app to be ready
    await window.waitForLoadState('domcontentloaded');
    
    // Clear authentication state
    await app.evaluate(async ({ ipcRenderer }) => {
      globalThis.__mockAuthState = false;
    });
    
    // Send IPC request
    const response = await app.evaluate(async ({ ipcRenderer }) => {
      return new Promise((resolve) => {
        ipcRenderer.once('events-and-khutbah-topics-response', (event, data) => {
          resolve(data);
        });
        ipcRenderer.send('events-and-khutbah-topics-request', {});
      });
    });
    
    // Assertions
    expect(response).toHaveProperty('success', false);
    expect(response).toHaveProperty('error');
    expect(response.error).toContain('Unauthorized access');
  });

  test('should handle service error gracefully', async () => {
    // Get the main window
    const window = await app.firstWindow();
    
    // Wait for the app to be ready
    await window.waitForLoadState('domcontentloaded');
    
    // Simulate authentication
    await app.evaluate(async ({ ipcRenderer }) => {
      globalThis.__mockAuthState = true;
    });
    
    // Mock service failure
    await app.evaluate(async ({ ipcRenderer }) => {
      globalThis.__mockServiceFailure = true;
    });
    
    // Send IPC request
    const response = await app.evaluate(async ({ ipcRenderer }) => {
      return new Promise((resolve) => {
        ipcRenderer.once('events-and-khutbah-topics-response', (event, data) => {
          resolve(data);
        });
        ipcRenderer.send('events-and-khutbah-topics-request', {});
      });
    });
    
    // Assertions
    expect(response).toHaveProperty('success', false);
    expect(response).toHaveProperty('error');
    expect(response.error).toContain('Failed to fetch topics');
    
    // Clean up mock
    await app.evaluate(async ({ ipcRenderer }) => {
      globalThis.__mockServiceFailure = false;
    });
  });
});