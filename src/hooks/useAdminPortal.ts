import { useQuery, useQueryClient, type UseQueryOptions } from 'react-query';

/**
 * Custom hook for fetching and invalidating admin portal data with TanStack Query.
 * This hook manages the admin portal data fetching and caching.
 * 
 * @example
 * const { data, isLoading, error } = useAdminPortal();
 * 
 * @returns useQuery hook result with admin portal data
 */
export const useAdminPortal = <TData = unknown>(
  options?: UseQueryOptions<TData>
) => {
  const queryClient = useQueryClient();
  
  return useQuery<TData>({
    queryKey: ['adminPortal'],
    queryFn: async () => {
      // In a real implementation, this would be replaced with actual data fetching
      // For now, we're providing a mock implementation
      const response = await fetch('/api/admin-portal', { 
        method: 'GET',
        headers: { 'Content-Type': 'application/json' }
      });
      
      if (!response.ok) {
        throw new Error(`Failed to fetch: ${response.status} ${response.statusText}`);
      }
      
      return response.json();
    },
    ...options
  });
};

export default useAdminPortal;