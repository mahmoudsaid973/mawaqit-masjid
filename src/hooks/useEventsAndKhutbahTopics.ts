"use client";

import { useQuery, UseQueryOptions } from "@tanstack/react-query";
import type { Event, KhutbahTopic } from "@/types/events-and-khutbah";

/**
 * API Response shape for the combined Events and Khutbah Topics endpoint.
 */
interface EventsAndKhutbahResponse {
  upcomingEvents: Event[];
  khutbahTopics: KhutbahTopic[];
}

/**
 * Custom hook to fetch and manage state for Events and Khutbah Topics.
 * Utilizes TanStack Query for caching, background refetching, and loading states.
 *
 * @param options - Optional TanStack Query configuration overrides.
 * @returns Query result object containing data, loading states, and refetch function.
 */
export function useEventsAndKhutbahTopics(
  options?: Omit<
    UseQueryOptions<EventsAndKhutbahResponse, Error>,
    "queryKey" | "queryFn"
  >
) {
  return useQuery<EventsAndKhutbahResponse, Error>({
    queryKey: ["events-and-khutbah-topics"],
    queryFn: async () => {
      const response = await fetch("/api/events-and-khutbah-topics", {
        method: "GET",
        headers: {
          "Content-Type": "application/json",
        },
      });

      if (!response.ok) {
        const errorBody = await response.text().catch(() => "Unknown error");
        throw new Error(
          `Failed to fetch events and khutbah topics: ${response.status} ${response.statusText} - ${errorBody}`
        );
      }

      return response.json() as Promise<EventsAndKhutbahResponse>;
    },
    staleTime: 1000 * 60 * 5, // Data considered fresh for 5 minutes
    gcTime: 1000 * 60 * 10, // Keep unused data in cache for 10 minutes
    refetchOnWindowFocus: true,
    ...options,
  });
}
