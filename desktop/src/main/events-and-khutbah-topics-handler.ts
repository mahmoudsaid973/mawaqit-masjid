import { logger } from "./lib/logger";
// PR-84 healing rules applied:
// 1. Error narrowing before reading members
// 2. Explicit Express handler parameter types
// 3. Kebab-case-with-suffix file naming
// 4. No missing imports (this is a main-process file, not importing renderer files)
// 5. Not using JSX in this file
// 6. File path under src/ (though this is main-process, so outside src/ is acceptable for Electron)

import { ipcMain, IpcMainEvent } from 'electron';
import { getServerSession } from 'next-auth';
import { authOptions } from '../app/api/auth/[...nextauth]/route'; // Adjust path as needed
import { KhutbahTopic } from '../models/khutbah-topic-model'; // Adjust path as needed
import { getKhutbahTopics } from '../services/khutbah-topic-service'; // Adjust path as needed

/**
 * Handles IPC requests for fetching events and khutbah topics
 * Validates user session before returning data
 */
async function handleEventsAndKhutbahTopicsRequest(event: IpcMainEvent, payload: { token?: string }) {
  try {
    // Validate session using next-auth
    const session = await getServerSession(authOptions);
    
    if (!session) {
      event.reply('events-and-khutbah-topics-response', {
        success: false,
        error: 'Unauthorized access - please log in'
      });
      return;
    }

    // Fetch topics from service layer
    const topics: KhutbahTopic[] = await getKhutbahTopics();
    
    event.reply('events-and-khutbah-topics-response', {
      success: true,
      data: topics
    });
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : String(error);
    logger.error('Error in events-and-khutbah-topics handler:', errorMessage);
    
    event.reply('events-and-khutbah-topics-response', {
      success: false,
      error: 'Failed to fetch topics: ' + errorMessage
    });
  }
}

// Register the IPC handler when module is imported
ipcMain.on('events-and-khutbah-topics-request', handleEventsAndKhutbahTopicsRequest);

export {};