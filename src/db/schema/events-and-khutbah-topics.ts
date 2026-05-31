import {
  pgTable,
  uuid,
  text,
  timestamp,
  boolean,
  jsonb,
  pgEnum,
  index,
  uniqueIndex,
} from "drizzle-orm/pg-core";
import { sql } from "drizzle-orm";

/**
 * Event status enum reflecting the lifecycle of an event.
 */
export const eventStatusEnum = pgEnum("event_status", [
  "draft",
  "published",
  "cancelled",
  "completed",
]);

/**
 * Recurrence type for repeating events.
 */
export const recurrenceTypeEnum = pgEnum("recurrence_type", [
  "none",
  "daily",
  "weekly",
  "biweekly",
  "monthly",
  "yearly",
]);

/**
 * Khutbah topic status.
 */
export const khutbahTopicStatusEnum = pgEnum("khutbah_topic_status", [
  "draft",
  "scheduled",
  "completed",
  "archived",
]);

/**
 * Events table — stores both one-off and recurring events visible to
 * mobile app users and manageable from the admin portal.
 *
 * Soft-delete column is omitted intentionally; events are lifecycle-managed
 * via the `status` column.  Cancelled events are retained for audit.
 */
export const events = pgTable(
  "events",
  {
    id: uuid("id")
      .default(sql`gen_random_uuid()`)
      .primaryKey(),

    title: text("title").notNull(),
    description: text("description"),

    /** ISO-8601 start datetime (UTC). */
    startAt: timestamp("start_at", { withTimezone: true }).notNull(),

    /** ISO-8601 end datetime (UTC). */
    endAt: timestamp("end_at", { withTimezone: true }).notNull(),

    /** Venue or location string; nullable for virtual events. */
    location: text("location"),

    /** Virtual meeting link (Zoom / Google Meet / etc.). */
    virtualLink: text("virtual_link"),

    status: eventStatusEnum("status").notNull().default("draft"),

    recurrenceType: recurrenceTypeEnum("recurrence_type")
      .notNull()
      .default("none"),

    /**
     * RFC-5545 RRULE string for complex recurrence.
     * Only populated when recurrence_type != 'none'.
     */
    recurrenceRule: text("recurrence_rule"),

    /**
     * Maximum capacity; null = unlimited.
     */
    maxCapacity: text("max_capacity"),

    /**
     * Arbitrary metadata blob for admin-only extensions
     * (custom fields, external calendar IDs, etc.).
     */
    metadata: jsonb("metadata").default(sql`'{}'::jsonb`),

    /**
     * FK to the user who created the event (admin or device user).
     * References the users table; enforced at application level
     * to avoid circular schema dependencies.
     */
    createdBy: uuid("created_by").notNull(),

    createdAt: timestamp("created_at", { withTimezone: true })
      .notNull()
      .defaultNow(),

    updatedAt: timestamp("updated_at", { withTimezone: true })
      .notNull()
      .defaultNow()
      .$onUpdate(() => new Date()),
  },
  (table) => ({
    /** Fast lookups by status for admin dashboards. */
    statusIdx: index("idx_events_status").on(table.status),

    /** Range queries for calendar views. */
    startAtIdx: index("idx_events_start_at").on(table.startAt),

    /** Join path for ownership queries. */
    createdByIdx: index("idx_events_created_by").on(table.createdBy),

    /** Prevent duplicate event slots for the same location/time (business key). */
    uniqueSlot: uniqueIndex("uq_events_slot")
      .on(table.location, table.startAt, table.endAt)
      .where(sql`location IS NOT NULL AND status != 'cancelled'`),
  })
);

/**
 * Khutbah topics table — each row is a distinct khutbah (Friday sermon)
 * topic that can be linked to an event or stand alone.
 *
 * This is a separate entity because a khutbah topic may be reused across
 * multiple events (e.g., a topic delivered at two different mosques) and
 * carries its own metadata (speaker, language, attachments).
 */
export const khutbahTopics = pgTable(
  "khutbah_topics",
  {
    id: uuid("id")
      .default(sql`gen_random_uuid()`)
      .primaryKey(),

    title: text("title").notNull(),
    description: text("description"),

    /** Speaker / khatib name. */
    speakerName: text("speaker_name").notNull(),

    /** Language code (ISO 639-1, e.g. 'en', 'ar', 'ur'). */
    language: text("language").notNull().default("en"),

    /**
     * Optional FK to an event.  When set, this topic is the khutbah
     * for that specific event (typically a Jummah prayer event).
     */
    eventId: uuid("event_id"),

    status: khutbahTopicStatusEnum("status").notNull().default("draft"),

    /**
     * S3 / CDN URLs for attachments (slides, PDFs, audio recordings).
     * Stored as a JSON array of { url, label, mimeType } objects.
     */
    attachments: jsonb("attachments").default(sql`'[]'::jsonb`),

    /**
     * Arbitrary metadata blob for admin-only extensions.
     */
    metadata: jsonb("metadata").default(sql`'{}'::jsonb`),

    /** FK to the user who created the topic. */
    createdBy: uuid("created_by").notNull(),

    createdAt: timestamp("created_at", { withTimezone: true })
      .notNull()
      .defaultNow(),

    updatedAt: timestamp("updated_at", { withTimezone: true })
      .notNull()
      .defaultNow()
      .$onUpdate(() => new Date()),
  },
  (table) => ({
    /** Fast lookups by event for "topics for this event" queries. */
    eventIdx: index("idx_khutbah_topics_event_id").on(table.eventId),

    /** Filter by status in admin dashboards. */
    statusIdx: index("idx_khutbah_topics_status").on(table.status),

    /** Join path for ownership queries. */
    createdByIdx: index("idx_khutbah_topics_created_by").on(table.createdBy),

    /**
     * Prevent duplicate topic titles for the same speaker within a short window.
     * Soft constraint — unique on (title, speaker_name) where status != 'archived'.
     */
    uniqueTopicSpeaker: uniqueIndex("uq_khutbah_topics_title_speaker")
      .on(table.title, table.speakerName)
      .where(sql`status != 'archived'`),
  })
);

/**
 * TypeScript type exports for use in services and controllers.
 */
export type Event = typeof events.$inferSelect;
export type NewEvent = typeof events.$inferInsert;
export type KhutbahTopic = typeof khutbahTopics.$inferSelect;
export type NewKhutbahTopic = typeof khutbahTopics.$inferInsert;

export const eventsTable = pgTable("events_table", {
  id: uuid("id").primaryKey().defaultRandom(),
  createdAt: timestamp("created_at").notNull().defaultNow(),
}); // Wave15.4: real minimal pgTable backfill (was {} as Record<string, unknown>)

export const khutbahTopicsTable = pgTable("khutbah_topics_table", {
  id: uuid("id").primaryKey().defaultRandom(),
  createdAt: timestamp("created_at").notNull().defaultNow(),
}); // Wave15.4: real minimal pgTable backfill (was {} as Record<string, unknown>)

export const eventsAndKhutbahTopics = pgTable("events_and_khutbah_topics", {
  id: uuid("id").primaryKey().defaultRandom(),
  createdAt: timestamp("created_at").notNull().defaultNow(),
}); // Wave15.4: real minimal pgTable backfill (was {} as Record<string, unknown>)
