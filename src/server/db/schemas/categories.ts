import { relations } from "drizzle-orm";
import { text, sqliteTable } from "drizzle-orm/sqlite-core";
import { createSelectSchema, createInsertSchema } from "drizzle-zod";
import { commonColumns } from "./common";

export const categorys = sqliteTable("category", {
  id: text("id", { length: 255 })
    .notNull()
    .primaryKey()
    .$defaultFn(() => crypto.randomUUID()),
  name: text("name", { length: 255 }).notNull(),
  description: text("description", { length: 512 }),
  ...commonColumns,
});

export const categorySelectSchema = createSelectSchema(categorys).omit({
  updateCounter: true,
});

export const categoryInsertSchema = createInsertSchema(categorys);