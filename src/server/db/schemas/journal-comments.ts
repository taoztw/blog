import { foreignKey, sqliteTable, text } from "drizzle-orm/sqlite-core";
import { createInsertSchema, createSelectSchema } from "drizzle-zod";
import { user } from "./auth";
import { commonColumns } from "./common";
import { journals } from "./journals";

export const journalComments = sqliteTable(
  "journal_comments",
  {
    id: text("id", { length: 255 })
      .notNull()
      .primaryKey()
      .$defaultFn(() => crypto.randomUUID()),
    userId: text("user_id", { length: 255 })
      .notNull()
      .references(() => user.id),
    journalId: text("journal_id", { length: 255 })
      .notNull()
      .references(() => journals.id, { onDelete: "cascade" }),
    parentId: text("parent_id", { length: 255 }),
    content: text("content").notNull(),
    ...commonColumns,
  },
  (table) => [
    foreignKey({
      columns: [table.parentId],
      foreignColumns: [table.id],
      name: "journal_comments_parent_id_fk",
    }),
  ]
);

export const journalCommentInsertSchema = createInsertSchema(journalComments).omit({
  createdAt: true,
  updatedAt: true,
  userId: true,
});

export const journalCommentSelectSchema = createSelectSchema(journalComments);
