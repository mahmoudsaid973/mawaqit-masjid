import {
  pgTable,
  uuid,
  text,
  integer,
  timestamp,
  boolean,
  jsonb,
  uniqueIndex,
  index,
  foreignKey,
  pgEnum,
} from "drizzle-orm/pg-core";
import { sql } from "drizzle-orm";

/**
 * Enum for Hadith authenticity grades.
 * Maps to standard Islamic scholarly classifications.
 */
export const authenticityGradeEnum = pgEnum("authenticity_grade", [
  "sahih",
  "hasan",
  "daif",
  "mawdu",
  "hasan_sahih",
  "sahih_li_ghayrihi",
  "hasan_li_ghayrihi",
  "daif_jiddan",
  "munkar",
  "mudraj",
  "maqlub",
  "mudtarib",
  "shadh",
  "majhul",
  "matruk",
]);

/**
 * Enum for Hadith language.
 * Supports multilingual Hadith content.
 */
export const languageEnum = pgEnum("language", ["ar", "en", "ur", "fr", "tr", "id", "ms", "bn", "fa", "de", "es", "ru"]);

/**
 * Enum for user bookmark type.
 * Allows bookmarking collections, narrators, or individual Hadith.
 */
export const bookmarkTypeEnum = pgEnum("bookmark_type", [
  "hadith",
  "collection",
  "narrator",
  "chapter",
]);

/**
 * Enum for reading progress status.
 */
export const readingStatusEnum = pgEnum("reading_status", [
  "not_started",
  "in_progress",
  "completed",
]);

/**
 * Collections table — represents canonical Hadith collections
 * (e.g., Sahih al-Bukhari, Sahih Muslim, Sunan Abu Dawud).
 */
export const collections = pgTable(
  "collections",
  {
    id: uuid("id").primaryKey().defaultRandom(),
    slug: text("slug").notNull(),
    titleAr: text("title_ar").notNull(),
    titleEn: text("title_en").notNull(),
    titleTransliterated: text("title_transliterated"),
    authorNameAr: text("author_name_ar").notNull(),
    authorNameEn: text("author_name_en").notNull(),
    authorDeathYearHijri: integer("author_death_year_hijri"),
    authorDeathYearGregorian: integer("author_death_year_gregorian"),
    description: text("description"),
    totalHadith: integer("total_hadith").notNull().default(0),
    totalVolumes: integer("total_volumes").notNull().default(1),
    totalBooks: integer("total_books").notNull().default(1),
    totalChapters: integer("total_chapters").notNull().default(0),
    isVerified: boolean("is_verified").notNull().default(false),
    isFeatured: boolean("is_featured").notNull().default(false),
    sortOrder: integer("sort_order").notNull().default(0),
    metadata: jsonb("metadata").$type<Record<string, unknown>>(),
    createdAt: timestamp("created_at", { withTimezone: true })
      .notNull()
      .defaultNow(),
    updatedAt: timestamp("updated_at", { withTimezone: true })
      .notNull()
      .defaultNow()
      .$onUpdate(() => new Date()),
  },
  (table) => [
    uniqueIndex("uq_collections_slug").on(table.slug),
    index("idx_collections_featured").on(table.isFeatured),
    index("idx_collections_sort_order").on(table.sortOrder),
  ]
);

/**
 * Volumes table — represents volumes within a collection.
 */
export const volumes = pgTable(
  "volumes",
  {
    id: uuid("id").primaryKey().defaultRandom(),
    collectionId: uuid("collection_id")
      .notNull()
      .references(() => collections.id, { onDelete: "cascade" }),
    volumeNumber: integer("volume_number").notNull(),
    titleAr: text("title_ar"),
    titleEn: text("title_en"),
    totalHadith: integer("total_hadith").notNull().default(0),
    sortOrder: integer("sort_order").notNull().default(0),
    createdAt: timestamp("created_at", { withTimezone: true })
      .notNull()
      .defaultNow(),
    updatedAt: timestamp("updated_at", { withTimezone: true })
      .notNull()
      .defaultNow()
      .$onUpdate(() => new Date()),
  },
  (table) => [
    uniqueIndex("uq_volumes_collection_number").on(
      table.collectionId,
      table.volumeNumber
    ),
    index("idx_volumes_collection").on(table.collectionId),
  ]
);

/**
 * Books table — represents books (kutub) within a volume.
 */
export const books = pgTable(
  "books",
  {
    id: uuid("id").primaryKey().defaultRandom(),
    volumeId: uuid("volume_id")
      .notNull()
      .references(() => volumes.id, { onDelete: "cascade" }),
    collectionId: uuid("collection_id")
      .notNull()
      .references(() => collections.id, { onDelete: "cascade" }),
    bookNumber: integer("book_number").notNull(),
    titleAr: text("title_ar").notNull(),
    titleEn: text("title_en"),
    titleTransliterated: text("title_transliterated"),
    introduction: text("introduction"),
    totalHadith: integer("total_hadith").notNull().default(0),
    totalChapters: integer("total_chapters").notNull().default(0),
    sortOrder: integer("sort_order").notNull().default(0),
    createdAt: timestamp("created_at", { withTimezone: true })
      .notNull()
      .defaultNow(),
    updatedAt: timestamp("updated_at", { withTimezone: true })
      .notNull()
      .defaultNow()
      .$onUpdate(() => new Date()),
  },
  (table) => [
    uniqueIndex("uq_books_volume_number").on(table.volumeId, table.bookNumber),
    index("idx_books_collection").on(table.collectionId),
    index("idx_books_volume").on(table.volumeId),
  ]
);

/**
 * Chapters table — represents chapters (abwab) within a book.
 */
export const chapters = pgTable(
  "chapters",
  {
    id: uuid("id").primaryKey().defaultRandom(),
    bookId: uuid("book_id")
      .notNull()
      .references(() => books.id, { onDelete: "cascade" }),
    collectionId: uuid("collection_id")
      .notNull()
      .references(() => collections.id, { onDelete: "cascade" }),
    chapterNumber: integer("chapter_number").notNull(),
    titleAr: text("title_ar").notNull(),
    titleEn: text("title_en"),
    titleTransliterated: text("title_transliterated"),
    introduction: text("introduction"),
    totalHadith: integer("total_hadith").notNull().default(0),
    sortOrder: integer("sort_order").notNull().default(0),
    createdAt: timestamp("created_at", { withTimezone: true })
      .notNull()
      .defaultNow(),
    updatedAt: timestamp("updated_at", { withTimezone: true })
      .notNull()
      .defaultNow()
      .$onUpdate(() => new Date()),
  },
  (table) => [
    uniqueIndex("uq_chapters_book_number").on(table.bookId, table.chapterNumber),
    index("idx_chapters_collection").on(table.collectionId),
    index("idx_chapters_book").on(table.bookId),
  ]
);

/**
 * Hadith table — the core entity representing a single Hadith narration.
 * Supports full Arabic text with diacritics, multiple translations,
 * and chain of narration (isnad).
 */
export const hadiths = pgTable(
  "hadiths",
  {
    id: uuid("id").primaryKey().defaultRandom(),
    collectionId: uuid("collection_id")
      .notNull()
      .references(() => collections.id, { onDelete: "cascade" }),
    volumeId: uuid("volume_id").references(() => volumes.id, {
      onDelete: "set null",
    }),
    bookId: uuid("book_id").references(() => books.id, {
      onDelete: "set null",
    }),
    chapterId: uuid("chapter_id").references(() => chapters.id, {
      onDelete: "set null",
    }),
    hadithNumber: text("hadith_number").notNull(),
    globalNumber: integer("global_number"),
    textAr: text("text_ar").notNull(),
    textArDiacritics: text("text_ar_diacritics"),
    textEn: text("text_en"),
    isnadAr: text("isnad_ar"),
    isnadEn: text("isnad_en"),
    authenticityGrade: authenticityGradeEnum("authenticity_grade"),
    authenticityNote: text("authenticity_note"),
    narratorChainIds: jsonb("narrator_chain_ids").$type<string[]>(),
    keywords: jsonb("keywords").$type<string[]>(),
    topics: jsonb("topics").$type<string[]>(),
    referencePage: text("reference_page"),
    isDeleted: boolean("is_deleted").notNull().default(false),
    deletedAt: timestamp("deleted_at", { withTimezone: true }),
    metadata: jsonb("metadata").$type<Record<string, unknown>>(),
    createdAt: timestamp("created_at", { withTimezone: true })
      .notNull()
      .defaultNow(),
    updatedAt: timestamp("updated_at", { withTimezone: true })
      .notNull()
      .defaultNow()
      .$onUpdate(() => new Date()),
  },
  (table) => [
    uniqueIndex("uq_hadiths_collection_number").on(
      table.collectionId,
      table.hadithNumber
    ),
    index("idx_hadiths_collection").on(table.collectionId),
    index("idx_hadiths_volume").on(table.volumeId),
    index("idx_hadiths_book").on(table.bookId),
    index("idx_hadiths_chapter").on(table.chapterId),
    index("idx_hadiths_global_number").on(table.globalNumber),
    index("idx_hadiths_grade").on(table.authenticityGrade),
    index("idx_hadiths_not_deleted").on(table.isDeleted),
    index("idx_hadiths_keywords").using("gin", table.keywords),
    index("idx_hadiths_topics").using("gin", table.topics),
    index("idx_hadiths_text_search_ar").using(
      "gin",
      sql`to_tsvector('arabic', ${table.textAr})`
    ),
    index("idx_hadiths_text_search_en").using(
      "gin",
      sql`to_tsvector('english', ${table.textEn})`
    ),
  ]
);

/**
 * Hadith translations table — supports multiple translations per Hadith
 * in different languages, each with optional attribution.
 */
export const hadithTranslations = pgTable(
  "hadith_translations",
  {
    id: uuid("id").primaryKey().defaultRandom(),
    hadithId: uuid("hadith_id")
      .notNull()
      .references(() => hadiths.id, { onDelete: "cascade" }),
    language: languageEnum("language").notNull(),
    text: text("text").notNull(),
    translatorName: text("translator_name"),
    translatorBio: text("translator_bio"),
    isVerified: boolean("is_verified").notNull().default(false),
    isPrimary: boolean("is_primary").notNull().default(false),
    metadata: jsonb("metadata").$type<Record<string, unknown>>(),
    createdAt: timestamp("created_at", { withTimezone: true })
      .notNull()
      .defaultNow(),
    updatedAt: timestamp("updated_at", { withTimezone: true })
      .notNull()
      .defaultNow()
      .$onUpdate(() => new Date()),
  },
  (table) => [
    uniqueIndex("uq_hadith_translations_hadith_lang").on(
      table.hadithId,
      table.language
    ),
    index("idx_hadith_translations_hadith").on(table.hadithId),
    index("idx_hadith_translations_lang").on(table.language),
  ]
);

/**
 * Narrators table — represents individuals in chains of narration.
 * Includes biographical data for scholarly reference.
 */
export const narrators = pgTable(
  "narrators",
  {
    id: uuid("id").primaryKey().defaultRandom(),
    nameAr: text("name_ar").notNull(),
    nameEn: text("name_en"),
    nameTransliterated: text("name_transliterated"),
    kunya: text("kunya"),
    laqab: text("laqab"),
    nisba: text("nisba"),
    birthYearHijri: integer("birth_year_hijri"),
    deathYearHijri: integer("death_year_hijri"),
    birthYearGregorian: integer("birth_year_gregorian"),
    deathYearGregorian: integer("death_year_gregorian"),
    biography: text("biography"),
    reliabilityGrade: text("reliability_grade"),
    teachers: jsonb("teachers").$type<string[]>(),
    students: jsonb("students").$type<string[]>(),
    totalNarrations: integer("total_narrations").notNull().default(0),
    metadata: jsonb("metadata").$type<Record<string, unknown>>(),
    createdAt: timestamp("created_at", { withTimezone: true })
      .notNull()
      .defaultNow(),
    updatedAt: timestamp("updated_at", { withTimezone: true })
      .notNull()
      .defaultNow()
      .$onUpdate(() => new Date()),
  },
  (table) => [
    index("idx_narrators_name_ar").on(table.nameAr),
    index("idx_narrators_name_en").on(table.nameEn),
  ]
);

/**
 * Hadith-Narrator junction table — links Hadith to narrators in their chain
 * with position ordering to preserve isnad sequence.
 */
export const hadithNarrators = pgTable(
  "hadith_narrators",
  {
    id: uuid("id").primaryKey().defaultRandom(),
    hadithId: uuid("hadith_id")
      .notNull()
      .references(() => hadiths.id, { onDelete: "cascade" }),
    narratorId: uuid("narrator_id")
      .notNull()
      .references(() => narrators.id, { onDelete: "cascade" }),
    position: integer("position").notNull(),
    relationType: text("relation_type"),
    createdAt: timestamp("created_at", { withTimezone: true })
      .notNull()
      .defaultNow(),
  },
  (table) => [
    uniqueIndex("uq_hadith_narrators_hadith_position").on(
      table.hadithId,
      table.position
    ),
    index("idx_hadith_narrators_hadith").on(table.hadithId),
    index("idx_hadith_narrators_narrator").on(table.narratorId),
  ]
);

/**
 * User bookmarks table — allows users to bookmark Hadith, collections,
 * chapters, or narrators for quick access.
 */
export const userBookmarks = pgTable(
  "user_bookmarks",
  {
    id: uuid("id").primaryKey().defaultRandom(),
    userId: text("user_id").notNull(),
    bookmarkType: bookmarkTypeEnum("bookmark_type").notNull(),
    hadithId: uuid("hadith_id").references(() => hadiths.id, {
      onDelete: "cascade",
    }),
    collectionId: uuid("collection_id").references(() => collections.id, {
      onDelete: "cascade",
    }),
    chapterId: uuid("chapter_id").references(() => chapters.id, {
      onDelete: "cascade",
    }),
    narratorId: uuid("narrator_id").references(() => narrators.id, {
      onDelete: "cascade",
    }),
    note: text("note"),
    tags: jsonb("tags").$type<string[]>(),
    createdAt: timestamp("created_at", { withTimezone: true })
      .notNull()
      .defaultNow(),
    updatedAt: timestamp("updated_at", { withTimezone: true })
      .notNull()
      .defaultNow()
      .$onUpdate(() => new Date()),
  },
  (table) => [
    uniqueIndex("uq_user_bookmarks_unique").on(
      table.userId,
      table.bookmarkType,
      table.hadithId,
      table.collectionId,
      table.chapterId,
      table.narratorId
    ),
    index("idx_user_bookmarks_user").on(table.userId),
    index("idx_user_bookmarks_type").on(table.bookmarkType),
  ]
);

/**
 * User reading progress — tracks reading progress per collection
 * for each user.
 */
export const userReadingProgress = pgTable(
  "user_reading_progress",
  {
    id: uuid("id").primaryKey().defaultRandom(),
    userId: text("user_id").notNull(),
    collectionId: uuid("collection_id")
      .notNull()
      .references(() => collections.id, { onDelete: "cascade" }),
    lastReadHadithId: uuid("last_read_hadith_id").references(
      () => hadiths.id,
      { onDelete: "set null" }
    ),
    lastReadHadithNumber: text("last_read_hadith_number"),
    totalRead: integer("total_read").notNull().default(0),
    status: readingStatusEnum("status").notNull().default("not_started"),
    completedAt: timestamp("completed_at", { withTimezone: true }),
    createdAt: timestamp("created_at", { withTimezone: true })
      .notNull()
      .defaultNow(),
    updatedAt: timestamp("updated_at", { withTimezone: true })
      .notNull()
      .defaultNow()
      .$onUpdate(() => new Date()),
  },
  (table) => [
    uniqueIndex("uq_user_reading_progress_user_collection").on(
      table.userId,
      table.collectionId
    ),
    index("idx_user_reading_progress_user").on(table.userId),
    index("idx_user_reading_progress_status").on(table.status),
  ]
);

/**
 * User notes — private annotations on specific Hadith.
 */
export const userNotes = pgTable(
  "user_notes",
  {
    id: uuid("id").primaryKey().defaultRandom(),
    userId: text("user_id").notNull(),
    hadithId: uuid("hadith_id")
      .notNull()
      .references(() => hadiths.id, { onDelete: "cascade" }),
    content: text("content").notNull(),
    isPrivate: boolean("is_private").notNull().default(true),
    createdAt: timestamp("created_at", { withTimezone: true })
      .notNull()
      .defaultNow(),
    updatedAt: timestamp("updated_at", { withTimezone: true })
      .notNull()
      .defaultNow()
      .$onUpdate(() => new Date()),
  },
  (table) => [
    uniqueIndex("uq_user_notes_user_hadith").on(table.userId, table.hadithId),
    index("idx_user_notes_user").on(table.userId),
    index("idx_user_notes_hadith").on(table.hadithId),
  ]
);

/**
 * User search history — stores recent searches for quick access
 * and search suggestions.
 */
export const userSearchHistory = pgTable(
  "user_search_history",
  {
    id: uuid("id").primaryKey().defaultRandom(),
    userId: text("user_id").notNull(),
    query: text("query").notNull(),
    language: languageEnum("language").notNull().default("en"),
    resultCount: integer("result_count").notNull().default(0),
    filters: jsonb("filters").$type<Record<string, unknown>>(),
    createdAt: timestamp("created_at", { withTimezone: true })
      .notNull()
      .defaultNow(),
  },
  (table) => [
    index("idx_user_search_history_user").on(table.userId),
    index("idx_user_search_history_created").on(table.createdAt),
  ]
);

/**
 * Type exports for use in services and repositories.
 */
export type Collection = typeof collections.$inferSelect;
export type NewCollection = typeof collections.$inferInsert;

export type Volume = typeof volumes.$inferSelect;
export type NewVolume = typeof volumes.$inferInsert;

export type Book = typeof books.$inferSelect;
export type NewBook = typeof books.$inferInsert;

export type Chapter = typeof chapters.$inferSelect;
export type NewChapter = typeof chapters.$inferInsert;

export type Hadith = typeof hadiths.$inferSelect;
export type NewHadith = typeof hadiths.$inferInsert;

export type HadithTranslation = typeof hadithTranslations.$inferSelect;
export type NewHadithTranslation = typeof hadithTranslations.$inferInsert;

export type Narrator = typeof narrators.$inferSelect;
export type NewNarrator = typeof narrators.$inferInsert;

export type HadithNarrator = typeof hadithNarrators.$inferSelect;
export type NewHadithNarrator = typeof hadithNarrators.$inferInsert;

export type UserBookmark = typeof userBookmarks.$inferSelect;
export type NewUserBookmark = typeof userBookmarks.$inferInsert;

export type UserReadingProgress = typeof userReadingProgress.$inferSelect;
export type NewUserReadingProgress = typeof userReadingProgress.$inferInsert;

export type UserNote = typeof userNotes.$inferSelect;
export type NewUserNote = typeof userNotes.$inferInsert;

export type UserSearchHistory = typeof userSearchHistory.$inferSelect;
export type NewUserSearchHistory = typeof userSearchHistory.$inferInsert;

export const hadithBrowser = pgTable("hadith_browser", {
  id: uuid("id").primaryKey().defaultRandom(),
  createdAt: timestamp("created_at").notNull().defaultNow(),
}); // Wave15.4: real minimal pgTable backfill (was {} as Record<string, unknown>)
