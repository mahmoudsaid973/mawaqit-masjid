'use client';

import React, { useEffect, useState, useCallback } from 'react';

/**
 * Represents a single prayer time entry.
 */
interface PrayerTimeEntry {
  name: string;
  time: string;
  isNext: boolean;
}

/**
 * Represents the full state of prayer times data.
 */
interface PrayerTimesData {
  date: string;
  location: string;
  times: PrayerTimeEntry[];
  loading: boolean;
  error: string | null;
}

/**
 * Mock service function to simulate fetching prayer times from a backend or native bridge.
 * In a real Electron/Tauri app, this would invoke an IPC call.
 */
const fetchPrayerTimes = async (): Promise<PrayerTimesData> => {
  // Simulate network/IPC latency
  await new Promise((resolve) => setTimeout(resolve, 800));

  // Mock data generation
  const now = new Date();
  const baseHour = 5;
  const times: PrayerTimeEntry[] = [
    { name: 'Fajr', time: `${baseHour.toString().padStart(2, '0')}:30 AM`, isNext: false },
    { name: 'Dhuhr', time: '12:15 PM', isNext: false },
    { name: 'Asr', time: '04:45 PM', isNext: false },
    { name: 'Maghrib', time: '07:20 PM', isNext: false },
    { name: 'Isha', time: '08:50 PM', isNext: false },
  ];

  // Simple logic to determine "next" prayer based on mock hour
  const currentHour = now.getHours();
  if (currentHour < 12) times[1].isNext = true;
  else if (currentHour < 16) times[2].isNext = true;
  else if (currentHour < 19) times[3].isNext = true;
  else if (currentHour < 20) times[4].isNext = true;
  else times[0].isNext = true; // Next is Fajr tomorrow

  return {
    date: now.toLocaleDateString(undefined, { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' }),
    location: 'Mecca, SA (Mock)',
    times,
    loading: false,
    error: null,
  };
};

/**
 * PrayerTimesWindow Component
 * 
 * Renders the main viewport for the Prayer Times desktop application window.
 * Handles loading states, error display, and lists prayer times with visual highlighting.
 */
export default function PrayerTimesWindow(): React.JSX.Element {
  const [data, setData] = useState<PrayerTimesData>({
    date: '',
    location: '',
    times: [],
    loading: true,
    error: null,
  });

  const loadData = useCallback(async () => {
    try {
      setData((prev) => ({ ...prev, loading: true, error: null }));
      const result = await fetchPrayerTimes();
      setData(result);
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to load prayer times';
      setData((prev) => ({ ...prev, loading: false, error: errorMessage }));
    }
  }, []);

  useEffect(() => {
    loadData();
  }, [loadData]);

  if (data.loading) {
    return (
      <div className="flex h-screen w-full flex-col items-center justify-center bg-slate-900 text-slate-100">
        <div className="h-12 w-12 animate-spin rounded-full border-4 border-emerald-500 border-t-transparent" />
        <p className="mt-4 text-lg font-medium text-slate-400">Calculating times...</p>
      </div>
    );
  }

  if (data.error) {
    return (
      <div className="flex h-screen w-full flex-col items-center justify-center bg-slate-900 p-6 text-center text-slate-100">
        <div className="mb-4 rounded-full bg-red-500/10 p-4">
          <svg className="h-8 w-8 text-red-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.694-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
          </svg>
        </div>
        <h2 className="mb-2 text-xl font-bold">Unable to Load Data</h2>
        <p className="mb-6 text-slate-400">{data.error}</p>
        <button
          onClick={loadData}
          className="rounded-lg bg-emerald-600 px-6 py-2 font-semibold text-white transition-colors hover:bg-emerald-700 focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:ring-offset-2 focus:ring-offset-slate-900"
        >
          Try Again
        </button>
      </div>
    );
  }

  return (
    <div className="flex h-screen w-full flex-col bg-slate-900 text-slate-100 font-sans">
      {/* Header Section */}
      <header className="border-b border-slate-800 bg-slate-900/50 p-6 backdrop-blur-sm">
        <div className="mb-2 flex items-center justify-between">
          <h1 className="text-2xl font-bold tracking-tight text-emerald-400">Prayer Times</h1>
          <span className="rounded-full bg-slate-800 px-3 py-1 text-xs font-medium text-slate-400">
            {data.location}
          </span>
        </div>
        <p className="text-slate-400">{data.date}</p>
      </header>

      {/* Main Content */}
      <main className="flex-1 overflow-y-auto p-6">
        <div className="mx-auto max-w-2xl space-y-3">
          {data.times.map((prayer) => (
            <div
              key={prayer.name}
              className={`
                flex items-center justify-between rounded-xl p-4 transition-all
                ${prayer.isNext 
                  ? 'bg-emerald-600/20 border border-emerald-500/50 shadow-lg shadow-emerald-900/20' 
                  : 'bg-slate-800/50 border border-slate-700/50 hover:bg-slate-800'}
              `}
            >
              <div className="flex items-center gap-4">
                {prayer.isNext && (
                  <span className="flex h-2 w-2 relative">
                    <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                    <span className="relative inline-flex h-2 w-2 rounded-full bg-emerald-500"></span>
                  </span>
                )}
                <span className={`text-lg font-medium ${prayer.isNext ? 'text-emerald-300' : 'text-slate-200'}`}>
                  {prayer.name}
                </span>
              </div>
              <div className="flex items-center gap-3">
                {prayer.isNext && (
                  <span className="rounded bg-emerald-500/20 px-2 py-0.5 text-[10px] font-bold uppercase tracking-wider text-emerald-300">
                    Next
                  </span>
                )}
                <span className={`text-xl font-mono font-semibold ${prayer.isNext ? 'text-white' : 'text-slate-300'}`}>
                  {prayer.time}
                </span>
              </div>
            </div>
          ))}
        </div>
      </main>

      {/* Footer */}
      <footer className="border-t border-slate-800 bg-slate-900 p-4 text-center text-xs text-slate-500">
        <p>Times are calculated based on local coordinates. Adjustments may apply.</p>
      </footer>
    </div>
  );
}