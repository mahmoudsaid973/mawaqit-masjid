import { and, eq, inArray, sql } from 'drizzle-orm';
import { db } from '@/db';
import { homeScreenWidgets, InsertHomeScreenWidget } from '@/db/schema';
import { logger } from '@/lib/logger';

/**
 * Service layer for managing home screen widgets
 * Handles CRUD operations for user-configurable home screen widgets
 */

export interface HomeScreenWidget {
  id: string;
  userId: string;
  type: string;
  config: Record<string, unknown>;
  position: number;
  createdAt: Date;
  updatedAt: Date;
}

/**
 * Get all widgets for a specific user
 * @param userId - The user ID to fetch widgets for
 * @returns Array of home screen widgets
 */
export async function getWidgetsByUserId(userId: string): Promise<HomeScreenWidget[]> {
  try {
    const widgets = await db
      .select()
      .from(homeScreenWidgets)
      .where(eq(homeScreenWidgets.userId, userId))
      .orderBy(homeScreenWidgets.position);
    
    return widgets.map(widget => ({
      ...widget,
      config: widget.config ? JSON.parse(JSON.stringify(widget.config)) : {},
    }));
  } catch (error) {
    logger.error('Failed to fetch widgets by user ID', { error });
    throw new Error('Failed to fetch widgets');
  }
}

/**
 * Create a new home screen widget
 * @param widgetData - The widget data to create
 * @returns The created widget
 */
export async function createWidget(widgetData: Omit<InsertHomeScreenWidget, 'id' | 'createdAt' | 'updatedAt'>): Promise<HomeScreenWidget> {
  try {
    // Calculate next position if not provided
    const position = widgetData.position ?? (await getNextWidgetPosition(widgetData.userId));
    
    const [widget] = await db
      .insert(homeScreenWidgets)
      .values({
        ...widgetData,
        position,
        config: widgetData.config ? sql`${JSON.stringify(widgetData.config)}::jsonb` : sql`'{}'::jsonb`,
      })
      .returning();
    
    if (!widget) {
      throw new Error('Failed to create widget');
    }
    
    return {
      ...widget,
      config: widget.config ? JSON.parse(JSON.stringify(widget.config)) : {},
    };
  } catch (error) {
    logger.error('Failed to create widget', { error });
    throw new Error('Failed to create widget');
  }
}

/**
 * Update an existing home screen widget
 * @param id - The widget ID to update
 * @param userId - The user ID that owns the widget
 * @param updates - The updates to apply
 * @returns The updated widget
 */
export async function updateWidget(
  id: string, 
  userId: string, 
  updates: Partial<Omit<InsertHomeScreenWidget, 'id' | 'userId' | 'createdAt' | 'updatedAt'>>
): Promise<HomeScreenWidget> {
  try {
    const [widget] = await db
      .update(homeScreenWidgets)
      .set({
        ...updates,
        config: updates.config ? sql`${JSON.stringify(updates.config)}::jsonb` : undefined,
        updatedAt: new Date(),
      })
      .where(and(eq(homeScreenWidgets.id, id), eq(homeScreenWidgets.userId, userId)))
      .returning();
    
    if (!widget) {
      throw new Error('Widget not found');
    }
    
    return {
      ...widget,
      config: widget.config ? JSON.parse(JSON.stringify(widget.config)) : {},
    };
  } catch (error) {
    logger.error('Failed to update widget', { error });
    throw new Error('Failed to update widget');
  }
}

/**
 * Delete a home screen widget
 * @param id - The widget ID to delete
 * @param userId - The user ID that owns the widget
 * @returns Boolean indicating success
 */
export async function deleteWidget(id: string, userId: string): Promise<boolean> {
  try {
    const result = await db
      .delete(homeScreenWidgets)
      .where(and(eq(homeScreenWidgets.id, id), eq(homeScreenWidgets.userId, userId)));
    
    return result.count > 0;
  } catch (error) {
    logger.error('Failed to delete widget', { error });
    throw new Error('Failed to delete widget');
  }
}

/**
 * Reorder widgets for a user
 * @param userId - The user ID
 * @param widgetIds - Array of widget IDs in the desired order
 * @returns Boolean indicating success
 */
export async function reorderWidgets(userId: string, widgetIds: string[]): Promise<boolean> {
  try {
    // First, reset all positions to avoid conflicts
    await db
      .update(homeScreenWidgets)
      .set({ position: 0 })
      .where(eq(homeScreenWidgets.userId, userId));
    
    // Then update each widget with its new position
    for (let i = 0; i < widgetIds.length; i++) {
      await db
        .update(homeScreenWidgets)
        .set({ position: i + 1 })
        .where(and(eq(homeScreenWidgets.id, widgetIds[i]), eq(homeScreenWidgets.userId, userId)));
    }
    
    return true;
  } catch (error) {
    logger.error('Failed to reorder widgets', { error });
    throw new Error('Failed to reorder widgets');
  }
}

/**
 * Get the next available position for a new widget
 * @param userId - The user ID
 * @returns The next position number
 */
async function getNextWidgetPosition(userId: string): Promise<number> {
  try {
    const result = await db
      .select({ maxPosition: sql<number>`MAX(position)` })
      .from(homeScreenWidgets)
      .where(eq(homeScreenWidgets.userId, userId));
    
    return (result[0]?.maxPosition ?? 0) + 1;
  } catch (error) {
    logger.error('Failed to get next widget position', { error });
    return 1; // Default to position 1 if there's an error
  }
}
