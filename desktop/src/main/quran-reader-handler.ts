import { logger } from "./lib/logger";
import { BrowserWindow } from 'electron';
import { QuranReaderWindow } from '../renderer/QuranReaderWindow';

/**
 * Quran Reader Handler
 * Handles the main process logic for the Quran reader window
 * 
 * This handler is responsible for:
 * - Creating and managing the Quran reader window
 * - Handling communication between main and renderer processes
 * - Managing window state and lifecycle
 */

// Store reference to the Quran reader window
let quranReaderWindow: BrowserWindow | null = null;

/**
 * Creates the Quran reader window
 * @returns {Promise<BrowserWindow>} The created window instance
 */
export async function createQuranReaderWindow(): Promise<BrowserWindow> {
  // If window already exists, focus it
  if (quranReaderWindow) {
    quranReaderWindow.focus();
    return quranReaderWindow;
  }

  // Create new window with specific dimensions and settings
  quranReaderWindow = new BrowserWindow({
    width: 800,
    height: 600,
    minWidth: 400,
    minHeight: 300,
    webPreferences: {
      nodeIntegration: false,
      contextIsolation: true,
      // Add preload script if needed for IPC communication
      // preload: path.join(__dirname, 'preload.js')
    },
    title: 'Quran Reader',
    backgroundColor: '#ffffff',
    show: false, // Don't show immediately, wait for content to load
  });

  // Load the Quran reader UI
  try {
    // In a real implementation, this would load the actual renderer
    // For now we're simulating the window creation
    quranReaderWindow.loadURL('quran-reader://index.html');
    
    // Handle window close event
    quranReaderWindow.on('closed', () => {
      quranReaderWindow = null;
    });

    // Show window when ready
    quranReaderWindow.once('ready-to-show', () => {
      quranReaderWindow!.show();
    });

    // Handle window errors
    quranReaderWindow.webContents.on('did-fail-load', (event, errorCode, errorDescription) => {
      logger.error('Quran Reader window failed to load:', errorDescription);
    });

    return quranReaderWindow;
  } catch (error) {
    logger.error('Failed to create Quran Reader window:', error);
    throw error;
  }
}

/**
 * Closes the Quran reader window
 */
export function closeQuranReaderWindow(): void {
  if (quranReaderWindow) {
    quranReaderWindow.close();
    quranReaderWindow = null;
  }
}

/**
 * Gets the current Quran reader window instance
 * @returns {BrowserWindow | null} The window instance or null if not created
 */
export function getQuranReaderWindow(): BrowserWindow | null {
  return quranReaderWindow;
}

/**
 * Updates the content of the Quran reader window
 * @param {string} content - The new content to display
 */
export function updateQuranReaderContent(content: string): void {
  if (quranReaderWindow) {
    try {
      // Send content update to renderer process
      quranReaderWindow.webContents.send('update-content', content);
    } catch (error) {
      logger.error('Failed to update Quran reader content:', error);
    }
  }
}

/**
 * Navigates to a specific chapter and verse
 * @param {number} chapter - The chapter number
 * @param {number} verse - The verse number
 */
export function navigateToVerse(chapter: number, verse: number): void {
  if (quranReaderWindow) {
    try {
      // Send navigation request to renderer process
      quranReaderWindow.webContents.send('navigate-to-verse', { chapter, verse });
    } catch (error) {
      logger.error('Failed to navigate to verse:', error);
    }
  }
}

// Export handler functions as a module
export const quranReaderHandler = {
  createWindow: createQuranReaderWindow,
  closeWindow: closeQuranReaderWindow,
  getWindow: getQuranReaderWindow,
  updateContent: updateQuranReaderContent,
  navigateToVerse,
};
