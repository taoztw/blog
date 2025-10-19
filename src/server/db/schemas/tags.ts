import { sqliteTable, text } from "drizzle-orm/sqlite-core";
import { createInsertSchema, createSelectSchema } from "drizzle-zod";
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

export const tagSelectSchema = createSelectSchema(tags);

export const tagInsertSchema = createInsertSchema(tags);
