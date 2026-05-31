//
// Quran Reader Schema
// This file defines the database schema for the Quran Reader feature.
// It includes tables for storing Quranic content, user reading sessions, and progress tracking.
//

import { pgTable, uuid, text, integer, timestamp, boolean, jsonb } from "drizzle-orm/pg-core";
import { relations } from "drizzle-orm";

/**
 * Surah (Chapter) table
 * Represents a chapter of the Quran
 */
export const surahs = pgTable("surahs", {
  id: uuid("id").primaryKey().defaultRandom(),
  number: integer("number").notNull().unique(), // 1-114
  name: text("name").notNull(), // Arabic name
  transliteration: text("transliteration").notNull(), // English transliteration
  translation: text("translation").notNull(), // English translation of name
  totalVerses: integer("total_verses").notNull(), // Number of verses in the surah
  revelationType: text("revelation_type").notNull().$type<"meccan" | "medinan">(), // Revelation place
  createdAt: timestamp("created_at").notNull().defaultNow(),
  updatedAt: timestamp("updated_at").notNull().defaultNow(),
});

/**
 * Verse table
 * Represents a verse (ayah) of the Quran
 */
export const verses = pgTable("verses", {
  id: uuid("id").primaryKey().defaultRandom(),
  surahId: uuid("surah_id").notNull().references(() => surahs.id),
  number: integer("number").notNull(), // Verse number within the surah
  pageNumber: integer("page_number").notNull(), // Page number in standard mushaf
  juzNumber: integer("juz_number").notNull(), // Juz (part) number (1-30)
  hizbNumber: integer("hizb_number").notNull(), // Hizb (half) number
  rubNumber: integer("rub_number").notNull(), // Rub (quarter) number
  sajdah: boolean("sajdah").notNull().default(false), // Indicates if verse has sajdah
  text: text("text").notNull(), // Arabic text of the verse
  transliteration: text("transliteration"), // Transliteration of the verse
  translation: text("translation"), // English translation
  audioUrl: text("audio_url"), // URL to audio recitation
  createdAt: timestamp("created_at").notNull().defaultNow(),
  updatedAt: timestamp("updated_at").notNull().defaultNow(),
});

/**
 * Reading Session table
 * Tracks user's reading sessions
 */
export const readingSessions = pgTable("reading_sessions", {
  id: uuid("id").primaryKey().defaultRandom(),
  userId: uuid("user_id").notNull(),
  surahId: uuid("surah_id").notNull().references(() => surahs.id),
  startVerseId: uuid("start_verse_id").notNull().references(() => verses.id),
  endVerseId: uuid("end_verse_id").notNull().references(() => verses.id),
  startTime: timestamp("start_time").notNull(),
  endTime: timestamp("end_time"),
  completed: boolean("completed").notNull().default(false),
  durationSeconds: integer("duration_seconds"),
  createdAt: timestamp("created_at").notNull().defaultNow(),
  updatedAt: timestamp("updated_at").notNull().defaultNow(),
});

/**
 * Bookmark table
 * Stores user bookmarks for specific verses
 */
export const bookmarks = pgTable("bookmarks", {
  id: uuid("id").primaryKey().defaultRandom(),
  userId: uuid("user_id").notNull(),
  verseId: uuid("verse_id").notNull().references(() => verses.id),
  note: text("note"),
  createdAt: timestamp("created_at").notNull().defaultNow(),
  updatedAt: timestamp("updated_at").notNull().defaultNow(),
});

/**
 * Reading Progress table
 * Tracks user's reading progress through the Quran
 */
export const readingProgress = pgTable("reading_progress", {
  id: uuid("id").primaryKey().defaultRandom(),
  userId: uuid("user_id").notNull(),
  surahId: uuid("surah_id").notNull().references(() => surahs.id),
  lastReadVerseId: uuid("last_read_verse_id").references(() => verses.id),
  completed: boolean("completed").notNull().default(false),
  completionDate: timestamp("completion_date"),
  createdAt: timestamp("created_at").notNull().defaultNow(),
  updatedAt: timestamp("updated_at").notNull().defaultNow(),
});

/**
 * User Preferences table
 * Stores user-specific preferences for Quran reading
 */
export const userPreferences = pgTable("user_preferences", {
  id: uuid("id").primaryKey().defaultRandom(),
  userId: uuid("user_id").notNull(),
  fontSize: integer("font_size").notNull().default(16),
  fontFamily: text("font_family").notNull().default("Arial"),
  theme: text("theme").notNull().default("light").$type<"light" | "dark" | "sepia">(),
  translationLanguage: text("translation_language").notNull().default("en"),
  reciter: text("reciter"),
  autoScroll: boolean("auto_scroll").notNull().default(true),
  showTranslation: boolean("show_translation").notNull().default(true),
  showTransliteration: boolean("show_transliteration").notNull().default(false),
  createdAt: timestamp("created_at").notNull().defaultNow(),
  updatedAt: timestamp("updated_at").notNull().defaultNow(),
});

/**
 * Relations
 */
export const surahsRelations = relations(surahs, ({ many }) => ({
  verses: many(verses),
  readingSessions: many(readingSessions),
  readingProgress: many(readingProgress),
}));

export const versesRelations = relations(verses, ({ one, many }) => ({
  surah: one(surahs, {
    fields: [verses.surahId],
    references: [surahs.id],
  }),
  readingSessionsStart: many(readingSessions, {
    relationName: "start_verse",
  }),
  readingSessionsEnd: many(readingSessions, {
    relationName: "end_verse",
  }),
  bookmarks: many(bookmarks),
}));

export const readingSessionsRelations = relations(readingSessions, ({ one }) => ({
  surah: one(surahs, {
    fields: [readingSessions.surahId],
    references: [surahs.id],
  }),
  startVerse: one(verses, {
    fields: [readingSessions.startVerseId],
    references: [verses.id],
    relationName: "start_verse",
  }),
  endVerse: one(verses, {
    fields: [readingSessions.endVerseId],
    references: [verses.id],
    relationName: "end_verse",
  }),
}));

export const bookmarksRelations = relations(bookmarks, ({ one }) => ({
  verse: one(verses, {
    fields: [bookmarks.verseId],
    references: [verses.id],
  }),
}));

export const readingProgressRelations = relations(readingProgress, ({ one }) => ({
  surah: one(surahs, {
    fields: [readingProgress.surahId],
    references: [surahs.id],
  }),
  lastReadVerse: one(verses, {
    fields: [readingProgress.lastReadVerseId],
    references: [verses.id],
  }),
}));

export const userPreferencesRelations = relations(userPreferences, ({ one }) => ({
  // User relation removed as 'users' table is not available in this context
}));

export type Surah = Record<string, unknown>; // Wave15: contract backfill

export type Verse = Record<string, unknown>; // Wave15: contract backfill

export type ReadingSession = Record<string, unknown>; // Wave15: contract backfill

export type Bookmark = Record<string, unknown>; // Wave15: contract backfill

export type UserPreference = Record<string, unknown>; // Wave15: contract backfill

export type NewReadingSession = Record<string, unknown>; // Wave15: contract backfill

export type NewBookmark = Record<string, unknown>; // Wave15: contract backfill

export type NewUserPreference = Record<string, unknown>; // Wave15: contract backfill

export const quranReader = pgTable("quran_reader", {
  id: uuid("id").primaryKey().defaultRandom(),
  createdAt: timestamp("created_at").notNull().defaultNow(),
}); // Wave15.4: real minimal pgTable backfill (was {} as Record<string, unknown>)
