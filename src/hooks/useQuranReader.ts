"use client";

import { useState, useEffect, useCallback } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';

/**
 * Represents a Surah (chapter) in the Quran.
 */
export interface Surah {
  number: number;
  name: string;
  englishName: string;
  englishNameTranslation: string;
  revelationType: string;
  verses: number;
}

/**
 * Represents an Ayah (verse) in the Quran.
 */
export interface Ayah {
  number: number;
  text: string;
  numberInSurah: number;
  juz: number;
  manzil: number;
  page: number;
  ruku: number;
  hizbQuarter: number;
  sajda: boolean;
}

interface FetchSurahsResponse {
  data: Surah[];
}

interface FetchAyahsResponse {
  data: Ayah[];
}

interface UseQuranReaderOptions {
  /** Initial Surah number to select on mount */
  initialSurahNumber?: number;
  /** Callback when a Surah is selected */
  onSurahSelect?: (surah: Surah) => void;
}

interface UseQuranReaderReturn {
  /** List of all Surahs */
  surahs: Surah[];
  /** Currently selected Surah */
  selectedSurah: Surah | null;
  /** List of Ayahs for the selected Surah */
  ayahs: Ayah[];
  /** Loading state for any query */
  isLoading: boolean;
  /** Error state */
  error: string | null;
  /** Search term for filtering Surahs */
  searchTerm: string;
  /** Current font size */
  fontSize: number;
  /** Function to set the search term */
  setSearchTerm: (term: string) => void;
  /** Function to select a Surah */
  selectSurah: (surahNumber: number) => void;
  /** Function to decrease font size */
  decreaseFontSize: () => void;
  /** Function to increase font size */
  increaseFontSize: () => void;
  /** Function to clear selection */
  clearSelection: () => void;
}

const API_BASE = '/api/quran';

const fetchSurahs = async (): Promise<Surah[]> => {
  const response = await fetch(`${API_BASE}/surahs`);
  if (!response.ok) {
    const errorBody = await response.text().catch(() => 'Unknown error');
    throw new Error(`Failed to fetch surahs: ${response.status} ${response.statusText} - ${errorBody}`);
  }
  const result: FetchSurahsResponse = await response.json();
  return result.data;
};

const fetchAyahs = async (surahNumber: number): Promise<Ayah[]> => {
  const response = await fetch(`${API_BASE}/surahs/${surahNumber}/ayahs`);
  if (!response.ok) {
    const errorBody = await response.text().catch(() => 'Unknown error');
    throw new Error(`Failed to fetch ayahs for surah ${surahNumber}: ${response.status} ${response.statusText} - ${errorBody}`);
  }
  const result: FetchAyahsResponse = await response.json();
  return result.data;
};

/**
 * Custom hook for managing Quran Reader state and data fetching.
 * Utilizes TanStack Query for efficient data management and caching.
 *
 * @param options - Configuration options including initial state and callbacks.
 * @returns Object containing state, data, and control functions for the Quran Reader.
 */
export function useQuranReader(options: UseQuranReaderOptions = {}): UseQuranReaderReturn {
  const { initialSurahNumber = 1, onSurahSelect } = options;
  const queryClient = useQueryClient();

  const [searchTerm, setSearchTerm] = useState<string>('');
  const [fontSize, setFontSize] = useState<number>(18);
  const [selectedSurahNumber, setSelectedSurahNumber] = useState<number | null>(
    initialSurahNumber || null
  );

  // Query for fetching all Surahs
  const {
    data: surahsData = [],
    isLoading: isSurahsLoading,
    error: surahsError,
  } = useQuery<Surah[], Error>({
    queryKey: ['quran', 'surahs'],
    queryFn: fetchSurahs,
    staleTime: 1000 * 60 * 5, // 5 minutes
  });

  // Query for fetching Ayahs of the selected Surah
  const {
    data: ayahsData = [],
    isLoading: isAyahsLoading,
    error: ayahsError,
  } = useQuery<Ayah[], Error>({
    queryKey: ['quran', 'ayahs', selectedSurahNumber],
    queryFn: () => fetchAyahs(selectedSurahNumber!),
    enabled: selectedSurahNumber !== null,
    staleTime: 1000 * 60 * 10, // 10 minutes
  });

  // Handle initial Surah selection and callback
  useEffect(() => {
    if (surahsData.length > 0 && initialSurahNumber) {
      const initialSurah = surahsData.find((s) => s.number === initialSurahNumber);
      if (initialSurah && onSurahSelect) {
        onSurahSelect(initialSurah);
      }
    }
  }, [surahsData, initialSurahNumber, onSurahSelect]);

  // Handle Surah selection callback when selectedSurahNumber changes
  useEffect(() => {
    if (selectedSurahNumber !== null && surahsData.length > 0) {
      const surah = surahsData.find((s) => s.number === selectedSurahNumber);
      if (surah && onSurahSelect) {
        onSurahSelect(surah);
      }
    }
  }, [selectedSurahNumber, surahsData, onSurahSelect]);

  const selectSurah = useCallback((surahNumber: number) => {
    setSelectedSurahNumber(surahNumber);
  }, []);

  const clearSelection = useCallback(() => {
    setSelectedSurahNumber(null);
  }, []);

  const decreaseFontSize = useCallback(() => {
    setFontSize((prev) => Math.max(12, prev - 2));
  }, []);

  const increaseFontSize = useCallback(() => {
    setFontSize((prev) => Math.min(32, prev + 2));
  }, []);

  const selectedSurah = selectedSurahNumber
    ? surahsData.find((s) => s.number === selectedSurahNumber) || null
    : null;

  const isLoading = isSurahsLoading || isAyahsLoading;
  const error = surahsError instanceof Error ? surahsError.message : ayahsError instanceof Error ? ayahsError.message : null;

  return {
    surahs: surahsData,
    selectedSurah,
    ayahs: ayahsData,
    isLoading,
    error,
    searchTerm,
    fontSize,
    setSearchTerm,
    selectSurah,
    decreaseFontSize,
    increaseFontSize,
    clearSelection,
  };
}
