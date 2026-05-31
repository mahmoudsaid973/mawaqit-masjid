// Auto-generated minimal Drizzle schema for "Home Screen Widgets" (F006)
import { pgTable, uuid, text, timestamp } from "drizzle-orm/pg-core";

export const homeScreenWidgets = pgTable("home_screen_widgets", {
  id: uuid("id").primaryKey().defaultRandom(),
  name: text("name").notNull(),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});
