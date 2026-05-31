"use client";

import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useCallback, useEffect } from "react";
import type { PrayerTimesData, LocationData } from "@/components/PrayerTimesPanel";

export interface UsePrayerTimesOptions {
  city: string;
  country: string;
  date: string;
  autoRefresh?: boolean;
  refreshIntervalMs?: number;
  enabled?: boolean;
}

export interface UsePrayerTimesResult {
  data: PrayerTimesData | null;
  isLoading: boolean;
  isError: boolean;
  error: Error | null;
  refetch: () => void;
  updateLocation: (location: Partial<LocationData>) => void;
  updateDate: (date: string) => void;
  isFetching: boolean;
}

const QUERY_KEY_BASE = "prayerTimes" as const;

const DEFAULT_LOCATION: LocationData = {
  city: "Mecca",
  country: "Saudi Arabia",
  latitude: 21.3891,
  longitude: 39.8579,
};

/**
 * Fetches prayer times from the backend API.
 * In production, this calls the actual endpoint; currently mocks data for demonstration.
 */
async function fetchPrayerTimesApi(
  city: string,
  country: string,
  date: string
): Promise<PrayerTimesData> {
  // Simulate network delay
  await new Promise((resolve) => setTimeout(resolve, 800));

  // Mock response matching the interface expected by PrayerTimesPanel
  return {
    date,
    location: {
      city,
      country,
      latitude: DEFAULT_LOCATION.latitude,
      longitude: DEFAULT_LOCATION.longitude,
    },
    prayers: [
      { name: "Fajr", time: "05:23", isNext: false },
      { name: "Dhuhr", time: "12:15", isNext: false },
      { name: "Asr", time: "15:45", isNext: true },
      { name: "Maghrib", time: "18:32", isNext: false },
      { name: "Isha", time: "20:01", isNext: false },
    ],
    nextPrayer: "Asr",
    timeToNext: "02:15:30",
  };
}

/**
 * TanStack Query hook for managing Prayer Times state.
 * Handles fetching, caching, auto-refresh, and location/date updates.
 *
 * @param options - Configuration including location, date, and refresh settings
 * @returns Query state and mutation helpers
 */
export function usePrayerTimes({
  city,
  country,
  date,
  autoRefresh = true,
  refreshIntervalMs = 60000,
  enabled = true,
}: UsePrayerTimesOptions): UsePrayerTimesResult {
  const queryClient = useQueryClient();

  const queryKey = [QUERY_KEY_BASE, city, country, date];

  const {
    data,
    isLoading,
    isError,
    error,
    refetch,
    isFetching,
  } = useQuery<PrayerTimesData, Error>({
    queryKey,
    queryFn: () => fetchPrayerTimesApi(city, country, date),
    enabled,
    staleTime: 30000, // Consider data fresh for 30s
    gcTime: 300000, // Keep unused data in cache for 5min
    retry: (failureCount, err) => {
      // Retry only on network errors, not on validation errors
      return failureCount < 3 && err.message.includes("network");
    },
  });

  // Auto-refresh effect
  useEffect(() => {
    if (!autoRefresh || !enabled) return;

    const interval = setInterval(() => {
      queryClient.invalidateQueries({ queryKey });
    }, refreshIntervalMs);

    return () => clearInterval(interval);
  }, [autoRefresh, enabled, refreshIntervalMs, queryClient, queryKey]);

  const updateLocation = useCallback(
    (location: Partial<LocationData>) => {
      const newCity = location.city ?? city;
      const newCountry = location.country ?? country;

      // Invalidate current query to trigger refetch with new params
      queryClient.invalidateQueries({
        queryKey: [QUERY_KEY_BASE, city, country, date],
      });
    },
    [city, country, date, queryClient]
  );

  const updateDate = useCallback(
    (newDate: string) => {
      queryClient.invalidateQueries({
        queryKey: [QUERY_KEY_BASE, city, country, date],
      });
    },
    [city, country, date, queryClient]
  );

  return {
    data: data ?? null,
    isLoading,
    isError,
    error,
    refetch,
    updateLocation,
    updateDate,
    isFetching,
  };
}
