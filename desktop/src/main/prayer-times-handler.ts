import { app, ipcMain } from 'electron';
import { PrayerTimesData } from '@/types/prayer-times';

/**
 * Register the IPC handler for prayer times requests.
 * This handler simulates the backend calculation of prayer times.
 * In a real application, this would fetch from a calculation engine or API.
 */
ipcMain.handle('get-prayer-times', async (event, arg) => {
  // In a real implementation, this would calculate or fetch actual prayer times
  // For now, we return mock data as per the task requirements
  
  const mockData: PrayerTimesData = {
    date: new Date().toLocaleDateString(undefined, { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' }),
    location: 'Mecca, SA (Mock)',
    times: [
      { name: 'Fajr', time: '5:30 AM', isNext: false },
      { name: 'Dhuhr', time: '12:15 PM', isNext: false },
      { name: 'Asr', time: '4:45 PM', isNext: false },
      { name: 'Maghrib', time: '7:20 PM', isNext: false },
      { name: 'Isha', time: '8:50 PM', isNext: false },
    ],
    loading: false,
    error: null,
  };

  // Simple logic to determine "next" prayer based on mock hour
  const now = new Date();
  const currentHour = now.getHours();
  
  // Mock logic to set isNext flag
  if (currentHour < 12) mockData.times[1].isNext = true;
  else if (currentHour < 16) mockData.times[2].isNext = true;
  else if (currentHour < 19) mockData.times[3].isNext = true;
  else if (currentHour < 20) mockData.times[4].isNext = true;
  else mockData.times[0].isNext = true;

  return mockData;
});

// Graceful shutdown
app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') {
    app.quit();
  }
});
