import { sql } from "drizzle-orm";
import { integer, sqliteTable, text } from "drizzle-orm/sqlite-core";
import { createInsertSchema, createSelectSchema } from "drizzle-zod";

export const statistics = sqliteTable("statistics", {
  id: text("id").primaryKey(),
  totalPosts: integer("total_posts").notNull().default(0),
  totalViews: integer("total_views").notNull().default(0),
  lastUpdated: integer("last_updated", { mode: "timestamp_ms" })
    .default(sql`(cast(unixepoch('subsecond') * 1000 as integer))`)
    .notNull(),
});

export const statisticsInsertSchema = createInsertSchema(statistics);
export const statisticsSelectSchema = createSelectSchema(statistics);
