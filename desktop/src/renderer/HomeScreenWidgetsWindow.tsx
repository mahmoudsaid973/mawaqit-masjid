import { logger } from "./lib/logger";
'use client';

import React, { useEffect, useState, useCallback } from 'react';

/**
 * Data model for a Home Screen Widget configuration.
 */
interface WidgetConfig {
  id: string;
  name: string;
  type: 'clock' | 'weather' | 'calendar' | 'shortcuts';
  isActive: boolean;
  position: { x: number; y: number };
  size: { width: number; height: number };
}

/**
 * Custom error class for widget management operations.
 */
class WidgetManagementError extends Error {
  constructor(message: string, public code?: string) {
    super(message);
    this.name = 'WidgetManagementError';
  }
}

/**
 * Fetches the current list of widgets from the backend.
 * Validates the response structure before returning.
 */
async function fetchWidgets(): Promise<WidgetConfig[]> {
  try {
    const response = await fetch('/api/widgets');
    if (!response.ok) {
      const errorBody = await response.text();
      throw new WidgetManagementError(
        `Failed to fetch widgets: ${response.status}`,
        String(response.status)
      );
    }
    const data = await response.json();
    
    // Basic runtime validation
    if (!Array.isArray(data)) {
      throw new WidgetManagementError('Invalid data format received');
    }
    
    return data as WidgetConfig[];
  } catch (error) {
    const message = error instanceof Error ? error.message : String(error);
    logger.error('Error fetching widgets:', message);
    throw new WidgetManagementError(message);
  }
}

/**
 * Updates a specific widget's configuration.
 */
async function updateWidget(widgetId: string, updates: Partial<WidgetConfig>): Promise<void> {
  try {
    const response = await fetch(`/api/widgets/${widgetId}`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(updates),
    });

    if (!response.ok) {
      const errorBody = await response.text();
      throw new WidgetManagementError(
        `Failed to update widget ${widgetId}`,
        String(response.status)
      );
    }
  } catch (error) {
    const message = error instanceof Error ? error.message : String(error);
    logger.error('Error updating widget:', message);
    throw new WidgetManagementError(message);
  }
}

/**
 * HomeScreenWidgetsWindow Component
 * 
 * Renders the management interface for desktop home screen widgets.
 * Allows users to toggle visibility, rearrange, and configure widget properties.
 */
export default function HomeScreenWidgetsWindow() {
  const [widgets, setWidgets] = useState<WidgetConfig[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  const loadWidgets = useCallback(async () => {
    setIsLoading(true);
    setError(null);
    try {
      const data = await fetchWidgets();
      setWidgets(data);
    } catch (err) {
      const message = err instanceof Error ? err.message : String(err);
      setError(message);
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    loadWidgets();
  }, [loadWidgets]);

  const handleToggleActive = async (id: string, currentStatus: boolean) => {
    try {
      await updateWidget(id, { isActive: !currentStatus });
      setWidgets((prev) =>
        prev.map((w) => (w.id === id ? { ...w, isActive: !currentStatus } : w))
      );
    } catch (err) {
      const message = err instanceof Error ? err.message : String(err);
      setError(`Failed to toggle widget: ${message}`);
    }
  };

  const handleRemoveWidget = async (id: string) => {
    if (!confirm('Are you sure you want to remove this widget?')) return;
    
    try {
      const response = await fetch(`/api/widgets/${id}`, { method: 'DELETE' });
      if (!response.ok) {
        throw new WidgetManagementError('Failed to delete widget', String(response.status));
      }
      setWidgets((prev) => prev.filter((w) => w.id !== id));
    } catch (err) {
      const message = err instanceof Error ? err.message : String(err);
      setError(`Failed to remove widget: ${message}`);
    }
  };

  if (isLoading) {
    return (
      <div className="flex h-screen w-full items-center justify-center bg-gray-50 text-gray-600">
        <div className="text-center">
          <div className="mb-4 h-8 w-8 animate-spin rounded-full border-4 border-blue-500 border-t-transparent mx-auto" />
          <p>Loading widgets...</p>
        </div>
      </div>
    );
  }

  if (error && widgets.length === 0) {
    return (
      <div className="flex h-screen w-full items-center justify-center bg-red-50 text-red-700">
        <div className="text-center">
          <p className="mb-4 text-lg font-semibold">Error Loading Widgets</p>
          <p className="mb-6 text-sm">{error}</p>
          <button
            onClick={loadWidgets}
            className="rounded bg-red-600 px-4 py-2 text-white hover:bg-red-700 transition-colors"
          >
            Retry
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-100 p-8">
      <header className="mb-8 flex items-center justify-between">
        <h1 className="text-3xl font-bold text-gray-900">Home Screen Widgets</h1>
        <button
          onClick={loadWidgets}
          className="rounded bg-white px-4 py-2 text-sm font-medium text-gray-700 shadow-sm hover:bg-gray-50 border border-gray-200 transition-colors"
        >
          Refresh
        </button>
      </header>

      {error && (
        <div className="mb-6 rounded-md bg-red-50 p-4 border border-red-200">
          <p className="text-sm text-red-800">{error}</p>
        </div>
      )}

      <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
        {widgets.map((widget) => (
          <div
            key={widget.id}
            className={`relative overflow-hidden rounded-xl border bg-white shadow-sm transition-all ${
              widget.isActive ? 'border-blue-200 shadow-md' : 'border-gray-200 opacity-75 grayscale'
            }`}
          >
            <div className="p-6">
              <div className="mb-4 flex items-start justify-between">
                <div>
                  <h3 className="text-lg font-semibold text-gray-900">{widget.name}</h3>
                  <p className="text-sm text-gray-500 capitalize">{widget.type} Widget</p>
                </div>
                <span
                  className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium ${
                    widget.isActive
                      ? 'bg-green-100 text-green-800'
                      : 'bg-gray-100 text-gray-800'
                  }`}
                >
                  {widget.isActive ? 'Active' : 'Inactive'}
                </span>
              </div>

              <div className="mb-6 rounded-lg bg-gray-50 p-4 text-center">
                <p className="text-xs text-gray-500">Preview</p>
                <div className="mt-2 h-16 w-full rounded bg-white border border-gray-200 flex items-center justify-center">
                  <span className="text-gray-400 text-xs">{widget.type} preview</span>
                </div>
              </div>

              <div className="flex items-center justify-between">
                <button
                  onClick={() => handleToggleActive(widget.id, widget.isActive)}
                  className={`rounded-md px-4 py-2 text-sm font-medium transition-colors ${
                    widget.isActive
                      ? 'bg-red-50 text-red-700 hover:bg-red-100'
                      : 'bg-green-50 text-green-700 hover:bg-green-100'
                  }`}
                >
                  {widget.isActive ? 'Disable' : 'Enable'}
                </button>
                
                <button
                  onClick={() => handleRemoveWidget(widget.id)}
                  className="text-sm text-gray-500 hover:text-red-600 transition-colors"
                  aria-label="Remove widget"
                >
                  Remove
                </button>
              </div>
            </div>
          </div>
        ))}
      </div>

      {widgets.length === 0 && !isLoading && (
        <div className="mt-12 text-center text-gray-500">
          <p>No widgets configured yet.</p>
          <p className="text-sm mt-2">Add widgets from your device settings.</p>
        </div>
      )}
    </div>
  );
}