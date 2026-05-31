// Main process handler for Home Screen Widgets functionality
import { ipcMain, IpcMainEvent } from 'electron';
import { WidgetConfig } from '../../renderer/HomeScreenWidgetsWindow';

/**
 * In-memory storage for widget configurations
 * In a real application, this would be replaced with a database or file system persistence
 */
let widgetStore: WidgetConfig[] = [
  {
    id: '1',
    name: 'Clock Widget',
    type: 'clock',
    isActive: true,
    position: { x: 0, y: 0 },
    size: { width: 150, height: 150 }
  } as WidgetConfig,
  {
    id: '2',
    name: 'Weather Widget',
    type: 'weather',
    isActive: true,
    position: { x: 0, y: 0 },
    size: { width: 150, height: 150 }
  } as unknown as WidgetConfig,
  {
    id: '3',
    name: 'Calendar Widget',
    type: 'calendar',
    isActive: false,
    position: { x: 0, y: 0 },
    size: { width: 200, height: 200 }
  } as unknown as WidgetConfig
];

/**
 * Validates a widget configuration object
 * @param widget - The widget object to validate
 * @returns true if valid, false otherwise
 */
function isValidWidget(widget: unknown): widget is WidgetConfig {
  if (typeof widget !== 'object' || widget === null) return false;
  
  const w = widget as Partial<WidgetConfig>;
  
  // Check required fields
  if (!w.id || typeof w.id !== 'string') return false;
  if (!w.name || typeof w.name !== 'string') return false;
  if (!w.type || !['clock', 'weather', 'calendar', 'shortcuts'].includes(w.type)) return false;
  if (typeof w.isActive !== 'boolean') return false;
  
  // Check position object
  if (!w.position || typeof w.position !== 'object') return false;
  if (typeof w.position.x !== 'number' || typeof w.position.y !== 'number') return false;
  
  // Check size object
  if (!w.size || typeof w.size !== 'object') return false;
  if (typeof w.size.width !== 'number' || typeof w.size.height !== 'number') return false;
  
  return true;
}

/**
 * Retrieves all widget configurations
 */
ipcMain.handle('widgets:get-all', async () => {
  try {
    return { success: true, data: widgetStore as unknown as unknown };
  } catch (error) {
    const message = error instanceof Error ? error.message : String(error);
    return { success: false, error: message };
  }
});

/**
 * Updates a specific widget configuration
 */
ipcMain.handle('widgets:update', async (_event: IpcMainEvent, widgetId: string, updates: Partial<WidgetConfig>) => {
  try {
    const widgetIndex = widgetStore.findIndex(w => w.id === widgetId);
    
    if (widgetIndex === -1) {
      return { success: false, error: 'Widget not found' };
    }
    
    // Apply updates
    widgetStore[widgetIndex] = { ...widgetStore[widgetIndex], ...updates };
    
    return { success: true, data: widgetStore[widgetIndex] };
  } catch (error) {
    const message = error instanceof Error ? error.message : String(error);
    return { success: false, error: message };
  }
});

/**
 * Removes a widget by ID
 */
ipcMain.handle('widgets:remove', async (_event: IpcMainEvent, widgetId: string) => {
  try {
    const initialLength = widgetStore.length;
    widgetStore = widgetStore.filter(w => w.id !== widgetId);
    
    if (widgetStore.length === initialLength) {
      return { success: false, error: 'Widget not found' };
    }
    
    return { success: true };
  } catch (error) {
    const message = error instanceof Error ? error.message : String(error);
    return { success: false, error: message };
  }
});

/**
 * Adds a new widget
 */
ipcMain.handle('widgets:add', async (_event: IpcMainEvent, widget: unknown) => {
  try {
    if (!isValidWidget(widget)) {
      return { success: false, error: 'Invalid widget configuration' };
    }
    
    // Check if widget with same ID already exists
    if (widgetStore.some(w => w.id === (widget as WidgetConfig).id)) {
      return { success: false, error: 'Widget with this ID already exists' };
    }
    
    widgetStore.push(widget as WidgetConfig);
    return { success: true, data: widget };
  } catch (error) {
    const message = error instanceof Error ? error.message : String(error);
    return { success: false, error: message };
  }
});

export type { WidgetConfig };