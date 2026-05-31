// Auto-generated minimal main-process handler for "Admin Portal" (F007)
import { ipcMain } from "electron";

export function registerAdminPortalHandlers() {
  ipcMain.handle("adminPortal:list", async () => []);
}
