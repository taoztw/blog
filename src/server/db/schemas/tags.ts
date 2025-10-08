import { relations } from "drizzle-orm";
import { text, sqliteTable } from "drizzle-orm/sqlite-core";
import { createSelectSchema, createInsertSchema } from "drizzle-zod";
import { commonColumns } from "./common";

export const tags = sqliteTable("tag", {
  id: text("id", { length: 255 })
    .notNull()
    .primaryKey()
    .$defaultFn(() => crypto.randomUUID()),
  name: text("name", { length: 255 }).notNull().unique(),
  description: text("description", { length: 512 }),
  color: text("color", { length: 7 }), // hex color code
  ...commonColumns,
});

export const tagSelectSchema = createSelectSchema(tags).omit({
  updateCounter: true,
});

export const tagInsertSchema = createInsertSchema(tags);