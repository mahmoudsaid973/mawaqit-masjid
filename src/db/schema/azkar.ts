// Wave15.4: stripped 19 lines of leading LLM narration prose
import { pgTable, serial, text, timestamp, boolean } from 'drizzle-orm/pg-core';
import { sql } from 'drizzle-orm';

export const azkarTable = pgTable('azkar', {
  id: serial('id').primaryKey(),
  title: text('title').notNull(),
  content: text('content').notNull(),
  createdAt: timestamp('created_at').defaultNow(),
  updatedAt: timestamp('updated_at').defaultNow(),
  isFavorite: boolean('is_favorite').default(false),
});

export type Azkar = typeof azkarTable.$inferSelect;
export type NewAzkar = typeof azkarTable.$inferInsert;

export const azkar = pgTable('azkar', {
  id: uuid("id").primaryKey().defaultRandom(),
});