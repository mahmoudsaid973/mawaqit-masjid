// Auto-generated minimal main-process handler for "Hadith Browser" (F004)
import { ipcMain } from "electron";

export function registerHadithBrowserHandlers() {
  ipcMain.handle("hadithBrowser:list", async () => []);
}
