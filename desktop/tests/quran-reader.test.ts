import { test, expect } from '@playwright/test';
import { join } from 'path';
import { app } from 'electron/main';
import { BrowserWindow } from 'electron';
import { createQuranReaderWindow, closeQuranReaderWindow, updateQuranReaderContent, navigateToVerse } from '../src/main/quran-reader-handler';

test.describe('Quran Reader Window', () => {
  test('should create and manage Quran reader window', async ({}) => {
    // Test window creation
    const window = await createQuranReaderWindow();
    expect(window).toBeTruthy();
    
    // Test window navigation
    navigateToVerse(2, 255);
    
    // Test content update
    updateQuranReaderContent('In the name of Allah, the Entirely Merciful, the Especially Merciful.');
    
    // Test window closing
    closeQuranReaderWindow();
    
    // Test window reference management
    const currentWindow = getQuranReaderWindow();
    expect(currentWindow).toBeNull();
    
    // Test window recreation
    const newWindow = await createQuranReaderWindow();
    expect(newWindow).toBeInstanceOf(BrowserWindow);
    
    // Test window closing again
    closeQuranReaderWindow();
    const finalWindow = getQuranReaderWindow();
    expect(finalWindow).toBeNull();
  });
});