'use client';

import { useQuery, UseQueryResult } from '@tanstack/react-query';
import { z } from 'zod';

const AzkarEntrySchema = z.object({
  id: z.string(),
  title: z.string(),
  content: z.string(),
  category: z.string().optional(),
  count: z.number().optional(),
});

export type AzkarEntry = z.infer<typeof AzkarEntrySchema>;

const AzkarResponseSchema = z.array(AzkarEntrySchema);

class AzkarFetchError extends Error {
  constructor(
    message: string,
    public statusCode?: number,
  ) {
    super(message);
    this.name = 'AzkarFetchError';
  }
}

export function useAzkar(): UseQueryResult<AzkarEntry[], AzkarFetchError> {
  return useQuery<AzkarEntry[], AzkarFetchError>({
    queryKey: ['azkar'],
    queryFn: async () => {
      try {
        const response = await fetch('/api/azkar');
        
        if (!response.ok) {
          throw new AzkarFetchError(
            `Failed to fetch Azkar entries: ${response.statusText}`,
            response.status,
          );
        }

        const contentType = response.headers.get('content-type');
        if (!contentType?.includes('application/json')) {
          throw new AzkarFetchError('Invalid response format: expected JSON');
        }

        const data: unknown = await response.json();
        const result = AzkarResponseSchema.safeParse(data);

        if (!result.success) {
          throw new AzkarFetchError(
            `Invalid data format received: ${result.error.message}`,
          );
        }

        return result.data;
      } catch (error) {
        if (error instanceof AzkarFetchError) {
          throw error;
        }
        
        const message = error instanceof Error ? error.message : String(error);
        throw new AzkarFetchError(`Network error: ${message}`);
      }
    },
    staleTime: 5 * 60 * 1000,
    retry: 3,
    retryDelay: (attemptIndex) => Math.min(1000 * 2 ** attemptIndex, 30000),
  });
}
