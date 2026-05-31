"use client";

import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import type { AxiosError } from "axios";
import axiosInstance from "@/lib/axios-instance";
import { z } from "zod";

/**
 * Schema for a Home Screen Widget configuration.
 * Matches the backend DTO structure for F006.
 */
const HomeScreenWidgetSchema = z.object({
  id: z.string().uuid(),
  userId: z.string().uuid(),
  widgetType: z.enum(["activity_ring", "photo_of_day", "streak_counter", "quick_log"]),
  positionX: z.number().int().min(0),
  positionY: z.number().int().min(0),
  isActive: z.boolean(),
  lastUpdatedAt: z.string().datetime(),
  configuration: z.record(z.unknown()).optional(),
});

export type HomeScreenWidget = z.infer<typeof HomeScreenWidgetSchema>;

/**
 * Schema for the API response list.
 */
const WidgetsListSchema = z.array(HomeScreenWidgetSchema);

export type WidgetsList = z.infer<typeof WidgetsListSchema>;

/**
 * API Error type guard helper.
 * Narrows unknown errors to AxiosError with safe property access.
 */
const isAxiosError = (error: unknown): error is AxiosError => {
  return error !== null && typeof error === "object" && "response" in error;
};

/**
 * Hook to manage Home Screen Widgets state for the Admin Portal.
 * Provides querying, mutating (reordering/activating), and cache invalidation.
 *
 * @param userId - Optional filter to view widgets for a specific mobile user.
 * @returns Query and Mutation objects for managing widget state.
 */
export const useHomeScreenWidgets = (userId?: string) => {
  const queryClient = useQueryClient();

  const queryKey = ["home-screen-widgets", userId];

  // Fetcher function with explicit typing and error normalization
  const fetchWidgets = async (): Promise<WidgetsList> => {
    const params = userId ? { userId } : {};
    const response = await axiosInstance.get("/admin/home-screen-widgets", { params });
    return WidgetsListSchema.parse(response.data);
  };

  const {
    data: widgets,
    isLoading,
    error,
    refetch,
  } = useQuery<WidgetsList, Error>({
    queryKey,
    queryFn: fetchWidgets,
    staleTime: 1000 * 60 * 5, // 5 minutes
    retry: (failureCount, err) => {
      if (isAxiosError(err)) {
        const status = err.response?.status;
        // Don't retry on 4xx client errors
        if (status && status >= 400 && status < 500) return false;
      }
      return failureCount < 3;
    },
  });

  // Mutation to update widget position or active state
  const updateWidgetMutation = useMutation<
    HomeScreenWidget,
    Error,
    { widgetId: string; updates: Partial<Pick<HomeScreenWidget, "positionX" | "positionY" | "isActive"> }
  >({
    mutationFn: async ({ widgetId, updates }) => {
      const response = await axiosInstance.patch(
        `/admin/home-screen-widgets/${widgetId}`,
        updates
      );
      return HomeScreenWidgetSchema.parse(response.data);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey });
    },
    onError: (err) => {
      // Structured error logging could go here, avoiding console.log
      const message = err instanceof Error ? err.message : "Failed to update widget";
      throw new Error(message);
    },
  });

  // Mutation to delete a widget
  const deleteWidgetMutation = useMutation<void, Error, { widgetId: string }>({
    mutationFn: async ({ widgetId }) => {
      await axiosInstance.delete(`/admin/home-screen-widgets/${widgetId}`);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey });
    },
  });

  return {
    widgets,
    isLoading,
    error: error instanceof Error ? error.message : String(error),
    refetch,
    updateWidget: updateWidgetMutation.mutateAsync,
    isUpdating: updateWidgetMutation.isPending,
    deleteWidget: deleteWidgetMutation.mutateAsync,
    isDeleting: deleteWidgetMutation.isPending,
  };
};
