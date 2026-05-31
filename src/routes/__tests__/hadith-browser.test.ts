import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { createMocks } from 'node-mocks-http';
import { GET } from '@/routes/hadith/route';
import * as hadithService from '@/services/hadith-service';

// Mock the hadith service
vi.mock('@/services/hadith-service', () => ({
  searchHadith: vi.fn(),
}));

// Mock environment variables
vi.stubEnv('NEXT_PUBLIC_HADITH_API_KEY', 'test-api-key');

/**
 * Test suite for Hadith Browser API endpoint
 * Tests the GET /api/hadith endpoint functionality
 */
describe('Hadith Browser API', () => {
  beforeEach(() => {
    // Reset mocks before each test
    vi.resetAllMocks();
  });

  afterEach(() => {
    // Restore environment variables after each test
    vi.unstubAllEnvs();
  });

  /**
   * Test case: Successful hadith search
   * Should return 200 with search results when valid query is provided
   */
  it('should return hadith search results for valid query', async () => {
    // Arrange
    const mockResults = [
      {
        id: '1',
        collection: 'Sahih al-Bukhari',
        book: 1,
        hadithNumber: 1,
        text: 'Actions are judged by intentions...',
        narrator: 'Umar ibn Al-Khattab',
        englishTranslation: 'Actions are judged by intentions...',
        reference: 'Sahih al-Bukhari 1:1',
      },
    ];

    vi.mocked(hadithService.searchHadith).mockResolvedValue(mockResults);

    const { req, res } = createMocks({
      method: 'GET',
      query: { q: 'actions are judged by intentions' },
    });

    // Act
    await GET(req, res);

    // Assert
    expect(res.statusCode).toBe(200);
    expect(JSON.parse(res._getData())).toEqual({
      success: true,
      data: mockResults,
    });
    expect(hadithService.searchHadith).toHaveBeenCalledWith(
      'actions are judged by intentions'
    );
  });

  /**
   * Test case: Missing search query
   * Should return 400 error when no query is provided
   */
  it('should return 400 error when query is missing', async () => {
    // Arrange
    const { req, res } = createMocks({
      method: 'GET',
      query: {},
    });

    // Act
    await GET(req, res);

    // Assert
    expect(res.statusCode).toBe(400);
    expect(JSON.parse(res._getData())).toEqual({
      success: false,
      error: {
        code: 'MISSING_QUERY',
        message: 'Search query is required',
      },
    });
  });

  /**
   * Test case: Service error handling
   * Should return 500 error when service throws an exception
   */
  it('should return 500 error when service throws an exception', async () => {
    // Arrange
    vi.mocked(hadithService.searchHadith).mockRejectedValue(
      new Error('Database connection failed')
    );

    const { req, res } = createMocks({
      method: 'GET',
      query: { q: 'test' },
    });

    // Act
    await GET(req, res);

    // Assert
    expect(res.statusCode).toBe(500);
    expect(JSON.parse(res._getData())).toEqual({
      success: false,
      error: {
        code: 'SEARCH_FAILED',
        message: 'Failed to search hadith',
      },
    });
  });

  /**
   * Test case: Empty search results
   * Should return 200 with empty array when no results found
   */
  it('should return empty results when no hadith matches query', async () => {
    // Arrange
    vi.mocked(hadithService.searchHadith).mockResolvedValue([]);

    const { req, res } = createMocks({
      method: 'GET',
      query: { q: 'nonexistent hadith' },
    });

    // Act
    await GET(req, res);

    // Assert
    expect(res.statusCode).toBe(200);
    expect(JSON.parse(res._getData())).toEqual({
      success: true,
      data: [],
    });
  });

  /**
   * Test case: Query with special characters
   * Should properly handle search queries with special characters
   */
  it('should handle search queries with special characters', async () => {
    // Arrange
    const mockResults = [
      {
        id: '2',
        collection: 'Sahih Muslim',
        book: 2,
        hadithNumber: 5,
        text: 'The reward of deeds depends on the intentions...',
        narrator: 'Umar ibn Al-Khattab',
        englishTranslation: 'The reward of deeds depends on the intentions...',
        reference: 'Sahih Muslim 2:5',
      },
    ];

    vi.mocked(hadithService.searchHadith).mockResolvedValue(mockResults);

    const { req, res } = createMocks({
      method: 'GET',
      query: { q: 'reward of deeds & intentions?' },
    });

    // Act
    await GET(req, res);

    // Assert
    expect(res.statusCode).toBe(200);
    expect(JSON.parse(res._getData())).toEqual({
      success: true,
      data: mockResults,
    });
    expect(hadithService.searchHadith).toHaveBeenCalledWith(
      'reward of deeds & intentions?'
    );
  });
});
