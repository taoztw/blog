import { sqliteTable, text } from "drizzle-orm/sqlite-core";
import { createInsertSchema, createSelectSchema } from "drizzle-zod";
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

export const categorySelectSchema = createSelectSchema(categorys);

export const categoryInsertSchema = createInsertSchema(categorys);
