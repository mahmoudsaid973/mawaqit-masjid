import { eq } from "drizzle-orm";
import { db } from "@/db/connection";
import {
  surahs,
  verses,
  readingSessions,
  bookmarks,
  userPreferences,
  type Surah,
  type Verse,
  type ReadingSession,
  type Bookmark,
  type UserPreference,
  type NewReadingSession,
  type NewBookmark,
  type NewUserPreference,
} from "@/db/schema/quran-reader";

/**
 * Service layer for Quran Reader functionality.
 * Handles business logic and database interactions for Surahs, Verses,
 * Reading Sessions, Bookmarks, and User Preferences.
 */

/**
 * Retrieves all Surahs from the database.
 * @returns Promise resolving to an array of Surah objects.
 */
export async function getAllSurahs(): Promise<Surah[]> {
  try {
    return await db.select().from(surahs);
  } catch (error) {
    const message = error instanceof Error ? error.message : String(error);
    throw new ServiceError("DATABASE_ERROR", `Failed to fetch surahs: ${message}`);
  }
}

/**
 * Retrieves a specific Surah by its ID.
 * @param id - The unique identifier of the Surah.
 * @returns Promise resolving to the Surah object or null if not found.
 */
export async function getSurahById(id: string): Promise<Surah | null> {
  try {
    const results = await db.select().from(surahs).where(eq(surahs.id, id));
    return results.length > 0 ? results[0] : null;
  } catch (error) {
    const message = error instanceof Error ? error.message : String(error);
    throw new ServiceError("DATABASE_ERROR", `Failed to fetch surah ${id}: ${message}`);
  }
}

/**
 * Retrieves all Verses for a specific Surah.
 * @param surahId - The unique identifier of the Surah.
 * @returns Promise resolving to an array of Verse objects.
 */
export async function getVersesBySurahId(surahId: string): Promise<Verse[]> {
  try {
    return await db.select().from(verses).where(eq(verses.surahId, surahId));
  } catch (error) {
    const message = error instanceof Error ? error.message : String(error);
    throw new ServiceError("DATABASE_ERROR", `Failed to fetch verses for surah ${surahId}: ${message}`);
  }
}

/**
 * Creates a new reading session for a user.
 * @param userId - The unique identifier of the user.
 * @param data - The data required to create a reading session.
 * @returns Promise resolving to the created ReadingSession object.
 */
export async function createReadingSession(
  userId: string,
  data: {
    surahId: string;
    startVerseId: string;
    endVerseId: string;
  }
): Promise<ReadingSession> {
  try {
    const newSession: NewReadingSession = {
      userId,
      surahId: data.surahId,
      startVerseId: data.startVerseId,
      endVerseId: data.endVerseId,
    };

    const result = await db.insert(readingSessions).values(newSession).returning();
    return result[0];
  } catch (error) {
    const message = error instanceof Error ? error.message : String(error);
    throw new ServiceError("DATABASE_ERROR", `Failed to create reading session: ${message}`);
  }
}

/**
 * Retrieves all reading sessions for a specific user.
 * @param userId - The unique identifier of the user.
 * @returns Promise resolving to an array of ReadingSession objects.
 */
export async function getUserReadingSessions(userId: string): Promise<ReadingSession[]> {
  try {
    return await db.select().from(readingSessions).where(eq(readingSessions.userId, userId));
  } catch (error) {
    const message = error instanceof Error ? error.message : String(error);
    throw new ServiceError("DATABASE_ERROR", `Failed to fetch reading sessions for user ${userId}: ${message}`);
  }
}

/**
 * Creates a new bookmark for a user.
 * @param userId - The unique identifier of the user.
 * @param data - The data required to create a bookmark (verseId and optional note).
 * @returns Promise resolving to the created Bookmark object.
 */
export async function createBookmark(
  userId: string,
  data: {
    verseId: string;
    note?: string;
  }
): Promise<Bookmark> {
  try {
    const newBookmark: NewBookmark = {
      userId,
      verseId: data.verseId,
      note: data.note,
    };

    const result = await db.insert(bookmarks).values(newBookmark).returning();
    return result[0];
  } catch (error) {
    const message = error instanceof Error ? error.message : String(error);
    throw new ServiceError("DATABASE_ERROR", `Failed to create bookmark: ${message}`);
  }
}

/**
 * Retrieves all bookmarks for a specific user.
 * @param userId - The unique identifier of the user.
 * @returns Promise resolving to an array of Bookmark objects.
 */
export async function getUserBookmarks(userId: string): Promise<Bookmark[]> {
  try {
    return await db.select().from(bookmarks).where(eq(bookmarks.userId, userId));
  } catch (error) {
    const message = error instanceof Error ? error.message : String(error);
    throw new ServiceError("DATABASE_ERROR", `Failed to fetch bookmarks for user ${userId}: ${message}`);
  }
}

/**
 * Updates user preferences. Creates a new record if none exists.
 * @param userId - The unique identifier of the user.
 * @param updates - The partial preferences to update.
 * @returns Promise resolving to the updated UserPreference object.
 */
export async function updateUserPreferences(
  userId: string,
  updates: {
    fontSize?: number;
    fontFamily?: string;
    theme?: string;
    translationLanguage?: string;
    reciter?: string;
    autoScroll?: boolean;
    showTranslation?: boolean;
    showTransliteration?: boolean;
  }
): Promise<UserPreference> {
  try {
    // Check if preferences exist
    const existing = await db
      .select()
      .from(userPreferences)
      .where(eq(userPreferences.userId, userId));

    if (existing.length > 0) {
      // Update existing
      const result = await db
        .update(userPreferences)
        .set(updates)
        .where(eq(userPreferences.userId, userId))
        .returning();
      return result[0];
    } else {
      // Create new with defaults + updates
      const newPrefs: NewUserPreference = {
        userId,
        fontSize: updates.fontSize ?? 16,
        fontFamily: updates.fontFamily ?? "Amiri",
        theme: updates.theme ?? "light",
        translationLanguage: updates.translationLanguage ?? "en",
        reciter: updates.reciter ?? "alafasy",
        autoScroll: updates.autoScroll ?? false,
        showTranslation: updates.showTranslation ?? true,
        showTransliteration: updates.showTransliteration ?? false,
        ...updates,
      };

      const result = await db.insert(userPreferences).values(newPrefs).returning();
      return result[0];
    }
  } catch (error) {
    const message = error instanceof Error ? error.message : String(error);
    throw new ServiceError("DATABASE_ERROR", `Failed to update user preferences: ${message}`);
  }
}

/**
 * Custom error class for service layer exceptions.
 */
export class ServiceError extends Error {
  public readonly code: string;

  constructor(code: string, message: string) {
    super(message);
    this.name = "ServiceError";
    this.code = code;
  }
}
