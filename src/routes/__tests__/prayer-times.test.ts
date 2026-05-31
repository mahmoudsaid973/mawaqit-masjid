import { describe, it, beforeEach, afterEach } from 'vitest';
import { expect } from 'vitest';
import { vi } from 'vitest';
import { prayerTimesService, PrayerTimesServiceError } from '@/services/prayer-times-service';
import { db } from '@/db';

// Mock the database
vi.mock('@/db', () => ({
  db: {
    select: vi.fn(),
    insert: vi.fn(),
    update: vi.fn(),
    delete: vi.fn(),
  },
}));

// Mock the logger
vi.mock('../../lib/logger', () => ({
  logger: {
    info: vi.fn(),
    error: vi.fn(),
  },
}));

describe('PrayerTimesService', () => {
  beforeEach(() => {
    // Reset all mocks before each test
    vi.clearAllMocks();
  });

  describe('getPrayerTimes', () => {
    it('should retrieve prayer times with filters', async () => {
      const mockResults = [
        {
          id: '1',
          city: 'Cairo',
          country: 'Egypt',
          date: new Date('2023-01-01'),
          fajr: new Date('2023-01-01T05:00:00'),
          // ... other prayer time fields
        },
      ];

      // Mock the database response
      (db.select as any).mockResolvedValue(mockResults);

      const result = await prayerTimesService.getPrayerTimes({
        city: 'Cairo',
        country: 'Egypt',
        date: new Date('2023-01-01'),
      });

      expect(result).toEqual(mockResults);
      expect(result[0].city).toBe('Cairo');
    });

    it('should handle empty results', async () => {
      // Mock the database response to return empty array
      (db.select as any).mockResolvedValue([]);

      const result = await prayerTimesService.getPrayerTimes({
        city: 'NonExistentCity',
      });

      expect(result).toEqual([]);
    });

    it('should throw error for invalid parameters', async () => {
      // Test with invalid parameters to trigger error handling
      await expect(prayerTimesService.getPrayerTimes({
        city: null, // Invalid parameter
        country: 123 as any, // Invalid parameter
      } as any)).rejects.toThrow();
    });
  });

  describe('createPrayerTime', () => {
    it('should create a new prayer time', async () => {
      const newPrayerTime = {
        city: 'Cairo',
        country: 'Egypt',
        fajr: new Date('2023-01-01T05:00:00'),
        // ... other required fields
      };

      (db.insert as any).mockResolvedValue([newPrayerTime]);

      const result = await prayerTimesService.createPrayerTime(newPrayertime);
      expect(result).toEqual(newPrayerTime);
    });

    it('should handle creation errors', async () => {
      (db.insert as any).mockRejectedValue(new Error('Creation failed'));

      await expect(prayerTimesService.createPrayerTime({
        city: 'Cairo',
        country: 'Egypt',
        fajr: new Date('2023-01-01T05:00:00'),
        // ... other required fields
      } as any)).rejects.toThrow();
    });

    it('should validate input data', async () => {
      // Test with missing required fields
      await expect(prayerTimesService.createPrayerTime({
        // Missing required fields
      } as any)).rejects.toThrow();
    });
  });
});
