import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';
import { AzkarServiceError } from '@/services/azkar-service';

// Mock the drizzle client
vi.mock('../../db/client', () => ({
  drizzleClient: {
    select: vi.fn().mockReturnThis(),
    from: vi.fn().mockReturnThis(),
    where: vi.fn().mockReturnThis(),
    limit: vi.fn().mockReturnThis(),
  }
}));

describe('Azkar Service', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  describe('getAllAzkar', () => {
    it('should return all azkar when no filter is applied', async () => {
      const mockSelect = vi.mocked((await import('../../db/client')).drizzleClient.select);
      mockSelect.mockReturnValue({
        from: vi.fn().mockReturnThis(),
        where: vi.fn().mockReturnThis()
      } as any);
      
      const { getAllAzkar } = await import('@/services/azkar-service');
      const result = await getAllAzkar();
      
      expect(Array.isArray(result)).toBe(true);
    });

    it('should handle database errors gracefully', async () => {
      const mockSelect = vi.mocked((await import('../../db/client')).drizzleClient.select);
      mockSelect.mockImplementation(() => {
        throw new Error('Database connection failed');
      });

      const { getAllAzkar } = await import('@/services/azkar-service');
      await expect(getAllAzkar()).rejects.toThrow(AzkarServiceError);
    });
  });

  describe('getAzkarById', () => {
    it('should return a specific azkar by ID', async () => {
      const mockData = [{ id: 1, title: 'Morning' }];
      const mockSelect = vi.mocked((await import('../../db/client')).drizzleClient.select);
      
      mockSelect.mockReturnValue({
        from: vi.fn().mockReturnThis(),
        where: vi.fn().mockReturnThis(),
        limit: vi.fn().mockResolvedValue(mockData)
      } as any);

      const { getAzkarById } = await import('@/services/azkar-service');
      const result = await getAzkarById(1);
      
      expect(result).toEqual(mockData[0]);
    });

    it('should throw an error if azkar is not found', async () => {
      const mockSelect = vi.mocked((await import('../../db/client')).drizzleClient.select);
      mockSelect.mockReturnValue({
        from: vi.fn().mockReturnThis(),
        where: vi.fn().mockReturnThis(),
        limit: vi.fn().mockResolvedValue([])
      } as any);

      const { getAzkarById } = await import('@/services/azkar-service');
      await expect(getAzkarById(999)).rejects.toThrow(AzkarServiceError);
    });
  });
});
