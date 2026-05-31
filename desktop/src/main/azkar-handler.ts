// Auto-generated minimal main-process handler for "Azkar" (F005)
import { ipcMain } from "electron";

export function registerAzkarHandlers() {
  ipcMain.handle("azkar:list", async () => []);
}
