import { describe, it, expect, beforeAll, afterAll, beforeEach } from 'vitest';
import { eq, and } from 'drizzle-orm';
import { db } from '@/db';
import { homeScreenWidgets, InsertHomeScreenWidget } from '@/db/schema';
import {
  getWidgetsByUserId,
  createWidget,
  updateWidget,
  deleteWidget,
  reorderWidgets,
  HomeScreenWidget,
} from '@/routes/home-screen-widgets-service';

/**
 * Integration tests for Home Screen Widgets Service
 * Covers happy paths, error boundaries, and data integrity constraints.
 * 
 * NOTE: These tests assume a test database connection is configured in the environment.
 * The DB should be migrated and cleaned between test runs.
 */

const TEST_USER_ID = 'test-user-widget-001';
const TEST_USER_ID_2 = 'test-user-widget-002';

// Helper to clean up data after tests
async function cleanUserData(userId: string) {
  await db.delete(homeScreenWidgets).where(eq(homeScreenWidgets.userId, userId));
}

describe('HomeScreenWidgetsService', () => {
  beforeAll(async () => {
    // Ensure clean state before suite starts
    await cleanUserData(TEST_USER_ID);
    await cleanUserData(TEST_USER_ID_2);
  });

  afterAll(async () => {
    // Final cleanup
    await cleanUserData(TEST_USER_ID);
    await cleanUserData(TEST_USER_ID_2);
  });

  beforeEach(async () => {
    // Clean before each test to ensure isolation
    await cleanUserData(TEST_USER_ID);
    await cleanUserData(TEST_USER_ID_2);
  });

  describe('getWidgetsByUserId', () => {
    it('should return an empty array when no widgets exist for user', async () => {
      const widgets = await getWidgetsByUserId(TEST_USER_ID);
      expect(widgets).toEqual([]);
    });

    it('should return widgets sorted by position', async () => {
      // Create widgets in random order
      await createWidget({
        userId: TEST_USER_ID,
        type: 'weather',
        config: { city: 'NYC' },
        position: 2,
      });
      await createWidget({
        userId: TEST_USER_ID,
        type: 'news',
        config: { source: 'BBC' },
        position: 1,
      });

      const widgets = await getWidgetsByUserId(TEST_USER_ID);
      expect(widgets).toHaveLength(2);
      expect(widgets[0].type).toBe('news');
      expect(widgets[0].position).toBe(1);
      expect(widgets[1].type).toBe('weather');
      expect(widgets[1].position).toBe(2);
    });

    it('should handle config parsing correctly', async () => {
      const complexConfig = { theme: 'dark', refreshRate: 300, filters: ['sports', 'tech'] };
      await createWidget({
        userId: TEST_USER_ID,
        type: 'dashboard',
        config: complexConfig,
        position: 1,
      });

      const [widget] = await getWidgetsByUserId(TEST_USER_ID);
      expect(widget.config).toEqual(complexConfig);
    });
  });

  describe('createWidget', () => {
    it('should create a widget with auto-calculated position', async () => {
      await createWidget({
        userId: TEST_USER_ID,
        type: 'clock',
        config: { format: '24h' },
      });

      const widgets = await getWidgetsByUserId(TEST_USER_ID);
      expect(widgets).toHaveLength(1);
      expect(widgets[0].position).toBe(1);
      expect(widgets[0].type).toBe('clock');
    });

    it('should create a widget with explicit position', async () => {
      await createWidget({
        userId: TEST_USER_ID,
        type: 'calendar',
        config: {},
        position: 5,
      });

      const [widget] = await getWidgetsByUserId(TEST_USER_ID);
      expect(widget.position).toBe(5);
    });

    it('should calculate next position correctly after existing widgets', async () => {
      await createWidget({ userId: TEST_USER_ID, type: 'a', config: {}, position: 1 });
      await createWidget({ userId: TEST_USER_ID, type: 'b', config: {}, position: 3 });
      
      // Next should be 4 (max + 1)
      await createWidget({ userId: TEST_USER_ID, type: 'c', config: {} });
      
      const widgets = await getWidgetsByUserId(TEST_USER_ID);
      const newWidget = widgets.find(w => w.type === 'c');
      expect(newWidget?.position).toBe(4);
    });

    it('should isolate positions between different users', async () => {
      await createWidget({ userId: TEST_USER_ID, type: 'user1', config: {}, position: 1 });
      await createWidget({ userId: TEST_USER_ID_2, type: 'user2', config: {} });

      const user2Widgets = await getWidgetsByUserId(TEST_USER_ID_2);
      expect(user2Widgets[0].position).toBe(1); // Should start at 1 for new user
    });
  });

  describe('updateWidget', () => {
    it('should update widget properties', async () => {
      const created = await createWidget({
        userId: TEST_USER_ID,
        type: 'todo',
        config: { list: 'groceries' },
        position: 1,
      });

      const updated = await updateWidget(created.id, TEST_USER_ID, {
        type: 'todo-pro',
        config: { list: 'work', priority: 'high' },
        position: 2,
      });

      expect(updated.type).toBe('todo-pro');
      expect(updated.position).toBe(2);
      expect(updated.config).toEqual({ list: 'work', priority: 'high' });
    });

    it('should throw error when updating widget owned by another user', async () => {
      const created = await createWidget({
        userId: TEST_USER_ID,
        type: 'secure',
        config: {},
        position: 1,
      });

      await expect(
        updateWidget(created.id, TEST_USER_ID_2, { type: 'hacked' })
      ).rejects.toThrow('Widget not found');
    });

    it('should throw error when updating non-existent widget', async () => {
      await expect(
        updateWidget('non-existent-id', TEST_USER_ID, { type: 'fail' })
      ).rejects.toThrow('Widget not found');
    });

    it('should partially update without overwriting untouched fields', async () => {
      const created = await createWidget({
        userId: TEST_USER_ID,
        type: 'partial',
        config: { keep: 'me' },
        position: 1,
      });

      const updated = await updateWidget(created.id, TEST_USER_ID, {
        position: 99,
      });

      expect(updated.type).toBe('partial'); // Unchanged
      expect(updated.config).toEqual({ keep: 'me' }); // Unchanged
      expect(updated.position).toBe(99); // Changed
    });
  });

  describe('deleteWidget', () => {
    it('should delete a widget successfully', async () => {
      const created = await createWidget({
        userId: TEST_USER_ID,
        type: 'delete-me',
        config: {},
        position: 1,
      });

      const result = await deleteWidget(created.id, TEST_USER_ID);
      expect(result).toBe(true);

      const remaining = await getWidgetsByUserId(TEST_USER_ID);
      expect(remaining).toHaveLength(0);
    });

    it('should return false when deleting widget owned by another user', async () => {
      const created = await createWidget({
        userId: TEST_USER_ID,
        type: 'not-yours',
        config: {},
        position: 1,
      });

      const result = await deleteWidget(created.id, TEST_USER_ID_2);
      expect(result).toBe(false);

      // Verify it still exists for the owner
      const remaining = await getWidgetsByUserId(TEST_USER_ID);
      expect(remaining).toHaveLength(1);
    });

    it('should return false when deleting non-existent widget', async () => {
      const result = await deleteWidget('fake-id', TEST_USER_ID);
      expect(result).toBe(false);
    });
  });

  describe('reorderWidgets', () => {
    it('should reorder widgets according to provided ID array', async () => {
      const w1 = await createWidget({ userId: TEST_USER_ID, type: 'first', config: {}, position: 1 });
      const w2 = await createWidget({ userId: TEST_USER_ID, type: 'second', config: {}, position: 2 });
      const w3 = await createWidget({ userId: TEST_USER_ID, type: 'third', config: {}, position: 3 });

      // Reverse order
      await reorderWidgets(TEST_USER_ID, [w3.id, w1.id, w2.id]);

      const widgets = await getWidgetsByUserId(TEST_USER_ID);
      expect(widgets[0].id).toBe(w3.id);
      expect(widgets[0].position).toBe(1);
      
      expect(widgets[1].id).toBe(w1.id);
      expect(widgets[1].position).toBe(2);
      
      expect(widgets[2].id).toBe(w2.id);
      expect(widgets[2].position).toBe(3);
    });

    it('should handle reordering with subset of widgets (others get position 0 then specific updates)', async () => {
      // Note: Current implementation resets ALL to 0 then updates specific ones.
      // If we pass only 2 IDs for 3 widgets, the 3rd one stays at 0 until next full reorder or explicit update.
      const w1 = await createWidget({ userId: TEST_USER_ID, type: 'a', config: {}, position: 1 });
      const w2 = await createWidget({ userId: TEST_USER_ID, type: 'b', config: {}, position: 2 });
      const w3 = await createWidget({ userId: TEST_USER_ID, type: 'c', config: {}, position: 3 });

      await reorderWidgets(TEST_USER_ID, [w2.id, w1.id]);

      const widgets = await getWidgetsByUserId(TEST_USER_ID);
      const sorted = widgets.sort((a, b) => a.position - b.position);
      
      // w2 becomes 1, w1 becomes 2
      expect(sorted[0].id).toBe(w2.id);
      expect(sorted[1].id).toBe(w1.id);
      
      // w3 was reset to 0 in the first step of the algorithm, and not updated in loop
      const w3Updated = widgets.find(w => w.id === w3.id);
      expect(w3Updated?.position).toBe(0);
    });

    it('should isolate reordering between users', async () => {
      await createWidget({ userId: TEST_USER_ID, type: 'u1', config: {}, position: 1 });
      const u2w1 = await createWidget({ userId: TEST_USER_ID_2, type: 'u2', config: {}, position: 1 });

      await reorderWidgets(TEST_USER_ID_2, [u2w1.id]); // No-op effectively but ensures logic runs

      // User 1 data should remain untouched
      const u1Widgets = await getWidgetsByUserId(TEST_USER_ID);
      expect(u1Widgets[0].position).toBe(1);
    });
  });

  describe('Boundary Cases & Error Handling', () => {
    it('should handle empty config object gracefully', async () => {
      const widget = await createWidget({
        userId: TEST_USER_ID,
        type: 'empty-config',
        config: {},
        position: 1,
      });
      expect(widget.config).toEqual({});
    });

    it('should handle null/undefined config fallback in DB layer (via SQL default)', async () => {
      // The service explicitly sends '{}'::jsonb if config is falsy, so we test the result
      const widget = await createWidget({
        userId: TEST_USER_ID,
        type: 'no-config',
        // @ts-expect-error Testing runtime behavior where config might be omitted
        config: undefined,
        position: 1,
      });
      expect(widget.config).toEqual({});
    });

    it('should preserve complex nested JSON structures', async () => {
      const complex = {
        meta: { version: 1, flags: { beta: true } },
        items: [{ id: 1, val: 'a' }, { id: 2, val: 'b' }],
      };
      
      const widget = await createWidget({
        userId: TEST_USER_ID,
        type: 'complex',
        config: complex,
        position: 1,
      });

      expect(widget.config).toEqual(complex);
      expect((widget.config as any).items[1].val).toBe('b');
    });
  });
});
